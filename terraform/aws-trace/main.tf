resource "aws_cloudtrail" "cloudtrail" {
  name           = "org"
  s3_bucket_name = aws_s3_bucket.cloudtrail.id

  enable_log_file_validation = true
  is_multi_region_trail      = true
  is_organization_trail      = false

  cloud_watch_logs_group_arn = "${aws_cloudwatch_log_group.cloudtrail.arn}:*"
  cloud_watch_logs_role_arn  = aws_iam_role.cloudtrail_cloudwatch.arn

  depends_on = [aws_s3_bucket_policy.cloudtrail]
}

resource "aws_s3_bucket" "cloudtrail" {
  bucket = "sismo-commitment-mapper-${terraform.workspace}"
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id
  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AWSCloudTrailAclCheck",
            "Effect": "Allow",
            "Principal": {
              "Service": "cloudtrail.amazonaws.com"
            },
            "Action": "s3:GetBucketAcl",
            "Resource": "${aws_s3_bucket.cloudtrail.arn}"
        },
        {
            "Sid": "AWSCloudTrailWrite",
            "Effect": "Allow",
            "Principal": {
              "Service": "cloudtrail.amazonaws.com"
            },
            "Action": "s3:PutObject",
            "Resource": "${aws_s3_bucket.cloudtrail.arn}/AWSLogs/*/*",
            "Condition": {
                "StringEquals": {
                    "s3:x-amz-acl": "bucket-owner-full-control"
                }
            }
        }
    ]
}
POLICY
}


resource "aws_cloudwatch_log_group" "cloudtrail" {
  name = "CloudTrail"

  retention_in_days = 30
}

resource "aws_iam_role" "cloudtrail_cloudwatch" {
  name               = "cloudtrail_cloudwatch"
  assume_role_policy = data.aws_iam_policy_document.cloudtrail_cloudwatch_assume.json
}

resource "aws_iam_role_policy" "cloudtrail_cloudwatch" {
  name   = "cloudtrail_cloudwatch"
  role   = aws_iam_role.cloudtrail_cloudwatch.id
  policy = data.aws_iam_policy_document.cloudtrail_cloudwatch.json
}

data "aws_iam_policy_document" "cloudtrail_cloudwatch_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "cloudtrail_cloudwatch" {
  statement {
    effect  = "Allow"
    actions = ["logs:CreateLogStream"]

    resources = [
      "${aws_cloudwatch_log_group.cloudtrail.arn}:*"
    ]
  }

  statement {
    effect  = "Allow"
    actions = ["logs:PutLogEvents"]

    resources = [
      "${aws_cloudwatch_log_group.cloudtrail.arn}:*"
    ]
  }
}

resource "aws_cloudwatch_log_subscription_filter" "cloudtrail_analyze" {
  name            = "cloudtrail-analyze"
  log_group_name  = aws_cloudwatch_log_group.cloudtrail.name
  filter_pattern  = ""
  destination_arn = aws_lambda_function.log_analyze.arn
}

resource "aws_sns_topic" "cloudtrail_alerts" {
  name = "cloudtrail_alerts"
}

resource "aws_sns_topic_subscription" "cloudtrail_alerts_email" {
  topic_arn = aws_sns_topic.cloudtrail_alerts.arn
  protocol  = "email"
  endpoint  = "log-alerts@sismo.io"
}
