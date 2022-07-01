import base64
import gzip
import json
import os

import boto3

SNS_ARN = os.getenv("SNS_ARN")
SLS_ROLE_ARN = os.getenv("SLS_ROLE_ARN")
LOG_ROLE_ARN = os.getenv("LOG_ROLE_ARN")

VALID_ROLES_ARN = (
    SLS_ROLE_ARN,
    LOG_ROLE_ARN,
)


def is_assume_valid_role_from_lambda(message) -> bool:
    try:
        return (
            message["eventName"] == "AssumeRole"
            and message["requestParameters"]["roleArn"] in VALID_ROLES_ARN
            and message["userIdentity"]["invokedBy"] == "lambda.amazonaws.com"
        )
    except KeyError:
        return False


def is_action_from_valid_role(message) -> bool:
    try:
        return (
            message["userIdentity"]["sessionContext"]["sessionIssuer"]["arn"]
            in VALID_ROLES_ARN
        )
    except KeyError:
        return False


def is_cloudtrail(message) -> bool:
    try:
        return message["userIdentity"]["invokedBy"] == "cloudtrail.amazonaws.com"
    except KeyError:
        return False


def is_valid_message(message) -> bool:
    return (
        is_assume_valid_role_from_lambda(message)
        or is_action_from_valid_role(message)
        or is_cloudtrail(message)
    )


def sns_alert(suspect_messages) -> None:
    client = boto3.client("sns")
    client.publish(
        TargetArn=SNS_ARN,
        Subject="[ALERT] Suspect action in commitment mapper account",
        Message=json.dumps({"default": json.dumps(suspect_messages, indent=4)}),
        MessageStructure="json",
    )


def handler(event, context):
    payload = json.loads(gzip.decompress(base64.b64decode(event["awslogs"]["data"])))

    messages = [json.loads(event["message"]) for event in payload["logEvents"]]

    suspect_messages = [
        message for message in messages if not (is_valid_message(message))
    ]

    if suspect_messages:
        sns_alert(suspect_messages)
