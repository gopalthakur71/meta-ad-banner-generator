output "site_bucket_name" {
  description = "S3 bucket hosting the SPA. Deploy with: aws s3 sync ../dist/ s3://<this>/."
  value       = aws_s3_bucket.site.id
}

output "site_url" {
  description = "Public URL of the deployed SPA (HTTP — internal tool)."
  value       = "http://${aws_s3_bucket_website_configuration.site.website_endpoint}"
}

output "api_endpoint" {
  description = "API Gateway base URL. Frontend POSTs to <this>/generate with a Bearer id_token."
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID. Used by the frontend SDK for SRP auth."
  value       = aws_cognito_user_pool.main.id
}

output "cognito_app_client_id" {
  description = "Cognito App Client ID. Used by the frontend SDK for SRP auth."
  value       = aws_cognito_user_pool_client.main.id
}

output "cognito_region" {
  description = "Region where Cognito User Pool lives. Used by the frontend SDK."
  value       = var.aws_region
}
