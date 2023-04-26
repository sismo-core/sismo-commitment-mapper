resource "aws_dynamodb_table" "commitment_store" {
  name = "hash-commitment-${terraform.workspace}"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "Address"

  attribute {
    name = "Address"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}


data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "AWS"
      identifiers = [
        for account_id in local.env.commitment_mapper_accounts : "arn:aws:iam::${account_id}:root"
      ]
    }
  }
}

data "aws_iam_policy_document" "dynamodb_access" {
  statement {
    actions = [
      "dynamodb:Get*",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
    ]
    effect    = "Allow"
    resources = [aws_dynamodb_table.commitment_store.arn]
  }
}

resource "aws_iam_role" "dynamodb_access" {
  name               = "commitment-store-dynamodb-${terraform.workspace}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  inline_policy {
    name   = "dynamodb_access"
    policy = data.aws_iam_policy_document.dynamodb_access.json
  }
}

