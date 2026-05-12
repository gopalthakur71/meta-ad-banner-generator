terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "meta-ad-banner"
      ManagedBy = "Terraform"
    }
  }
}

# Alias without default_tags — used for apigatewayv2_stage only.
# Reason: apigateway:TagResource is not a recognizable IAM action (the AWS
# console flags it with a red X and the action can't be granted), so the
# Terraform provider's post-create tag call fails. Skipping default_tags on
# this resource avoids the call entirely. Stage tags aren't load-bearing for
# our cost-allocation needs.
provider "aws" {
  alias  = "no_default_tags"
  region = var.aws_region
}
