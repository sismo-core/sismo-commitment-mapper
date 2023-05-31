import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from "aws-lambda";
import { commitmentMapperFactory } from "../commitment-mapper";
import { TelegramOwnershipVerifier } from "../ownership-verifiers/telegram";

type CommitTelegramEddsaInputData = {
  payload: string;
  commitment: string;
};

export const commitTelegramEddsa: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const requestData: CommitTelegramEddsaInputData = JSON.parse(event.body!);

    const commitmentMapper = commitmentMapperFactory();
    const ownershipVerifier = new TelegramOwnershipVerifier();
    
    const telegramAccount = await ownershipVerifier.verify({
      payload: requestData.payload 
    });
    const commitmentReceipt = await commitmentMapper.commit(
      telegramAccount.identifier,
      requestData.commitment
    );
    const res = {
      ...commitmentReceipt,
      account: telegramAccount,
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
}