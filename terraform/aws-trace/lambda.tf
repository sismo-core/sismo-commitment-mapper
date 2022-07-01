data "aws_iam_role" "commitment_mapper" {
  name = local.env.sls_role_name
}

data "archive_file" "log_analyze" {
  type        = "zip"
  source_file = "${path.module}/function/log_analyze.py"
  output_path = "${path.module}/function/log_analyze.zip"
}

resource "aws_lambda_function" "log_analyze" {
  filename         = data.archive_file.log_analyze.output_path
  function_name    = "log-analyze"
  role             = aws_iam_role.log_analyze.arn
  handler          = "log_analyze.handler"
  source_code_hash = data.archive_file.log_analyze.output_base64sha256
  runtime          = "python3.9"
  description      = "Log analyze"
  publish          = true

  environment {
    variables = {
      SNS_ARN      = aws_sns_topic.cloudtrail_alerts.arn
      SLS_ROLE_ARN = data.aws_iam_role.commitment_mapper.arn
      LOG_ROLE_ARN = aws_iam_role.log_analyze.arn
    }
  }
}


resource "aws_iam_role" "log_analyze" {
  name = "log-analyze"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

data "aws_iam_policy_document" "log_analyze" {
  statement {
    sid    = "LogAccess"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
  statement {
    sid    = "PublishSNS"
    effect = "Allow"
    actions = [
      "sns:Publish",
    ]
    resources = [aws_sns_topic.cloudtrail_alerts.arn]
  }
}

resource "aws_iam_role_policy" "log_analyze" {
  role   = aws_iam_role.log_analyze.id
  policy = data.aws_iam_policy_document.log_analyze.json
}


resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.log_analyze.function_name
  principal     = "logs.eu-west-1.amazonaws.com"
  source_arn    = "${aws_cloudwatch_log_group.cloudtrail.arn}:*"
}
