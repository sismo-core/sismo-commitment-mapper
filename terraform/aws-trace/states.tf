terraform {
  backend "s3" {
    bucket         = "sismo-tf-states"
    region         = "eu-west-1"
    key            = "commitment-mapper-logs.tfstate"
    dynamodb_table = "terraform-lock"

    role_arn     = "arn:aws:iam::651622860961:role/sismo-admin"
    session_name = "terraform-state"
  }
}
