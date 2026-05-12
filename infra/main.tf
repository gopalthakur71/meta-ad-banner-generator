# =============================================================================
# Random suffix for globally-unique S3 bucket name
# =============================================================================
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# =============================================================================
# S3 bucket hosting the SPA (static website mode, HTTP only).
# Internal-team tool, so public-read on /* is acceptable. If/when this goes
# external, swap to CloudFront + OAC + private bucket.
# =============================================================================
resource "aws_s3_bucket" "site" {
  bucket = "${var.project_prefix}-site-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  # SPA fallback — Vite outputs a single index.html and React handles routing.
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy" "site_public_read" {
  bucket     = aws_s3_bucket.site.id
  depends_on = [aws_s3_bucket_public_access_block.site]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.site.arn}/*"
    }]
  })
}

# =============================================================================
# Cognito User Pool — admin-create-only (no self-signup, internal team).
# =============================================================================
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_prefix}-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  password_policy {
    minimum_length    = 10
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_prefix}-app-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}

# =============================================================================
# IAM execution role for the Lambda.
# Bedrock InvokeModel is scoped to exactly the Sonnet 4.6 model ARN — if we
# ever flip modelId in variables.tf, the role updates in lockstep.
# =============================================================================
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_execution" {
  name               = "${var.project_prefix}-lambda-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "lambda_inline" {
  statement {
    sid     = "BedrockInvoke"
    effect  = "Allow"
    actions = ["bedrock:InvokeModel"]
    resources = [
      "arn:aws:bedrock:${var.aws_region}::foundation-model/${var.bedrock_model_id}"
    ]
  }

  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.project_prefix}-generate:*"
    ]
  }
}

resource "aws_iam_role_policy" "lambda_inline" {
  name   = "${var.project_prefix}-lambda-inline"
  role   = aws_iam_role.lambda_execution.id
  policy = data.aws_iam_policy_document.lambda_inline.json
}

# =============================================================================
# Lambda function — zipped from ../lambda/generate-banner.mjs at apply time.
# Node 20 runtime ships AWS SDK v3 in /var/runtime/node_modules, so the
# function is a single file with no node_modules to bundle.
# =============================================================================
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambda/generate-banner.mjs"
  output_path = "${path.module}/.terraform/lambda-generate-banner.zip"
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_prefix}-generate"
  retention_in_days = 14
}

resource "aws_lambda_function" "generate" {
  function_name = "${var.project_prefix}-generate"
  role          = aws_iam_role.lambda_execution.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  runtime = "nodejs20.x"
  handler = "generate-banner.handler"

  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      BEDROCK_MODEL_ID   = var.bedrock_model_id
      BEDROCK_REGION     = var.aws_region
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

# =============================================================================
# API Gateway HTTP API + JWT authorizer (Cognito) + Lambda integration.
# CORS is handled at the API level — OPTIONS preflight skips the authorizer
# automatically. allow_origins = ["*"] is fine for internal v1; tighten to the
# S3 site origin once the bucket suffix is known.
# =============================================================================
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_prefix}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Authorization", "Content-Type"]
    max_age       = 3000
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project_prefix}-jwt-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.main.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.generate.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "generate" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /generate"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_stage" "default" {
  provider    = aws.no_default_tags
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
