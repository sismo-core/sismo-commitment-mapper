import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from "aws-lambda";
import { commitmentMapperFactory } from "../commitment-mapper";
import { TwitterV2OwnershipVerifier } from "../ownership-verifiers";
import { fifoQueueFactory } from "../fifo-queue";

type CommitTwitterV2EddsaInputData = {
  twitterCode: string;
  callback: string;
  commitment: string;
};

export const commitTwitterV2Eddsa: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: CommitTwitterV2EddsaInputData = JSON.parse(event.body!);

  const commitmentMapper = commitmentMapperFactory();
  const fifoQueue = fifoQueueFactory();
  const ownershipVerifier = new TwitterV2OwnershipVerifier(fifoQueue);

  try {
    const twitterAccount = await ownershipVerifier.verify({
      twitterCode: requestData.twitterCode,
      callback: requestData.callback,
    });
    const commitmentReceipt = await commitmentMapper.commit(
      twitterAccount.identifier,
      requestData.commitment
    );
    const res = {
      ...commitmentReceipt,
      account: twitterAccount,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(res),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
};

export const getTwitterV2Token: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const fifoQueue = fifoQueueFactory();
  const ownershipVerifier = new TwitterV2OwnershipVerifier(fifoQueue);

  try {
    const accessToken = await ownershipVerifier.getAccessToken();
    const res = {
      accessToken,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(res),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
};
