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
} from "./commitment-mapper/commitment-mapper-eddsa";
import { EthereumOwnershipVerifier } from "./ownership-verifiers/ethereum";
import { GithubOwnershipVerifier } from "./ownership-verifiers/github";
import { TwitterOwnershipVerifier } from "./ownership-verifiers/twitter";
import { getCacheStore } from "./cache-store";
import { MigrateOwnershipVerifier } from "./ownership-verifiers/migrate";

type CommitEthereumEddsaInputData = {
  ethAddress: string;
  ethSignature: string;
  commitment: string;
};

type CommitGithubEddsaInputData = {
  githubCode: string;
  commitment: string;
};

type CommitTwitterEddsaInputData = {
  oauthToken: string;
  oauthVerifier: string;
  commitment: string;
};

type MigrateEddsaInputData = {
  identifier: string;
  commitmentReceipt: any;
  oldCommitment: string;
  newCommitment: string;
}

const commitmentMapperFactory = () => {
  const commitmentStore = getCommitmentStore(
    CommitmentStoreNamespace.HashCommitment,
    CommitmentStoreType.DynamoDBCommitmentStore
  );
  const commitmentMapper = new CommitmentMapperEddsa(
    commitmentStore,
    getSecretHandler()
  );
  return commitmentMapper;
};

export const commitGithubEddsa: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: CommitGithubEddsaInputData = JSON.parse(event.body!);

  const commitmentMapper = commitmentMapperFactory();
  const ownershipVerifier = new GithubOwnershipVerifier();

  try {
    const githubAccount = await ownershipVerifier.verify({
      code: requestData.githubCode,
    });
    const commitmentReceipt = await commitmentMapper.commit(
      githubAccount.identifier,
      requestData.commitment
    );
    const res = {
      ...commitmentReceipt,
      account: githubAccount,
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

export const commitTwitterEddsa: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: CommitTwitterEddsaInputData = JSON.parse(event.body!);

  const commitmentMapper = commitmentMapperFactory();
  const cacheStore = getCacheStore();
  const ownershipVerifier = new TwitterOwnershipVerifier({
    cacheStore,
  });

  try {
    const twitterAccount = await ownershipVerifier.verify({
      oauthToken: requestData.oauthToken,
      oauthVerifier: requestData.oauthVerifier,
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

export const migrateEddsa: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: MigrateEddsaInputData = JSON.parse(event.body!);

  const commitmentMapper = commitmentMapperFactory();
  const ownershipVerifier = new MigrateOwnershipVerifier();

  try {
    const isVerified = await ownershipVerifier.verify({
      receipt: requestData.commitmentReceipt,
      identifier: requestData.identifier,
      commitment: requestData.oldCommitment
    });
    if (!isVerified) throw new Error("Invalid commitmentReceipt");
    const commitmentReceipt = await commitmentMapper.commit(
      requestData.identifier,
      requestData.newCommitment
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

export const commitEthereumEddsa: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: CommitEthereumEddsaInputData = JSON.parse(event.body!);

  const commitmentMapper = commitmentMapperFactory();
  const ownershipVerifier = new EthereumOwnershipVerifier();

  try {
    const account = await ownershipVerifier.verify({
      ethAddress: requestData.ethAddress,
      ethSignature: requestData.ethSignature,
    });
    const commitmentReceipt = await commitmentMapper.commit(
      account,
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

type TwitterGetTokenInputData = {
  oauth_callback?: string;
};

export const requestTwitterToken: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const queryParams: TwitterGetTokenInputData = event.queryStringParameters!;
  if (!queryParams.oauth_callback) {
    throw new Error("You should provide an oauth_callback");
  }

  const cacheStore = getCacheStore();
  const ownershipVerifier = new TwitterOwnershipVerifier({
    cacheStore,
  });

  try {
    const requestToken = await ownershipVerifier.requestToken({
      oauthCallback: queryParams.oauth_callback,
    });

    return {
      statusCode: 302,
      headers: {
        Location: `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken}`,
      },
      body: "",
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
