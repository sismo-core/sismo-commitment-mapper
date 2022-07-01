import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from "aws-lambda";

import { getSecretHandler, SecretHandlerType } from "./secret-manager";
import { getCommitmentStore, CommitmentStoreType } from "./commitment-store";
import { randomBytes } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import CommitmentMapperEddsa, {
  CommitmentStoreNamespace,
  HashCommitmentReceiptAPIResponse,
} from "./commitment-mapper/commitment-mapper-eddsa";

type CommitInputData = {
  ethAddress: string;
  ethSignature: string;
  commitment: string;
};

export const commitEddsa: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: CommitInputData = JSON.parse(event.body!);

  const commitmentStore = getCommitmentStore(
    CommitmentStoreNamespace.HashCommitment,
    CommitmentStoreType.DynamoDBCommitmentStore
  );
  const commitmentMapper = new CommitmentMapperEddsa(
    commitmentStore,
    getSecretHandler()
  );

  try {
    const commitmentReceipt: HashCommitmentReceiptAPIResponse =
      await commitmentMapper.commit(
        requestData.ethAddress,
        requestData.ethSignature,
        requestData.commitment
      );
    return {
      statusCode: 200,
      body: JSON.stringify(commitmentReceipt),
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

export const generateSecret: Handler = async () => {
  const secretGenerator = async () => ({
    seed: BigNumber.from(randomBytes(32)).toHexString(),
  });
  const created = await getSecretHandler(
    SecretHandlerType.SecretManagerAWS
  ).generate(secretGenerator);
  return {
    status: created ? "created" : "unchanged",
  };
};

export const sismoAddressCommitment: Handler = async () => {
  const commitmentStore = getCommitmentStore(
    CommitmentStoreNamespace.HashCommitment,
    CommitmentStoreType.DynamoDBCommitmentStore
  );
  const commitmentMapper = new CommitmentMapperEddsa(
    commitmentStore,
    getSecretHandler()
  );
  return commitmentMapper.getSismoAddressCommitment();
};
