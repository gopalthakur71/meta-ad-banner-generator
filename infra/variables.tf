variable "aws_region" {
  description = "AWS region for all resources. Bedrock Sonnet 4.6 availability confirmed here on 2026-05-12."
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS account ID. Used for constructing CloudWatch log group ARNs."
  type        = string
  default     = "048589483919"
}

# Every resource name must start with this prefix. The scoped IAM policy on the
# meta-ad-banner deploy user denies actions on resources outside this prefix,
# so changing it requires updating iam-policy-meta-ad-banner-deploy.json in lockstep.
variable "project_prefix" {
  description = "Prefix for all AWS resource names. Enforced by the deploy user's IAM policy."
  type        = string
  default     = "meta-ad-banner"
}

variable "bedrock_model_id" {
  description = "Bedrock foundation model ID. Captured via aws bedrock list-foundation-models on 2026-05-12."
  type        = string
  default     = "anthropic.claude-sonnet-4-6"
}
