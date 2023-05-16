import { utils } from "ethers";
import { FifoQueue } from "fifo-queue";
import { Client, auth } from "twitter-api-sdk";
import {
  OAuth2Scopes,
  OAuth2UserOptions,
} from "twitter-api-sdk/dist/OAuth2User";

const twitterClientId = process.env.COMMITMENT_MAPPER_TWITTER_CLIENT_ID!;
const twitterClientSecret =
  process.env.COMMITMENT_MAPPER_TWITTER_CLIENT_SECRET!;
const twitterRefreshTokenFailureThreshold = process.env
  .COMMITMENT_MAPPER_TWITTER_REFRESH_FAILURE
  ? parseInt(process.env.COMMITMENT_MAPPER_TWITTER_REFRESH_FAILURE)
  : 10;

export type TwitterV2Account = {
  userId: string;
  username: string;
  identifier: string;
};

export const TWITTER_SCOPES: OAuth2Scopes[] = [
  "tweet.read",
  "users.read",
  "offline.access",
];

export type TwitterToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  callback: string;
};

export type FifoMsg = {
  twitterToken: TwitterToken;
  failureCount: number;
};

export class TwitterV2OwnershipVerifier {
  private _fifoQueue: FifoQueue;

  constructor(fifoQueue: FifoQueue) {
    this._fifoQueue = fifoQueue;
  }

  async verify({
    twitterCode,
    callback,
  }: {
    twitterCode: string;
    callback: string;
  }): Promise<TwitterV2Account> {
    const token = await this._requestAccessToken(twitterCode, callback);
    await this._fifoQueue.add({
      twitterToken: { ...token, callback },
      failureCount: 0,
    });
    return this._getTwitterAccount(callback);
  }

  async getAccessToken(): Promise<string> {
    const tokenMsg = (await this._fifoQueue.pop()) as FifoMsg;
    try {
      tokenMsg.twitterToken = await this._refreshAccessToken(
        tokenMsg.twitterToken
      );
    } catch {
      tokenMsg.failureCount += 1;
      console.log(
        "failed to refresh token. failureCount: ",
        tokenMsg.failureCount
      );
    } finally {
      // After 10 failures, we give up and don't add it back to the queue
      if (tokenMsg.failureCount < twitterRefreshTokenFailureThreshold) {
        await this._fifoQueue.add(tokenMsg);
      }
    }
    console.log("return access token", tokenMsg.twitterToken);
    return tokenMsg.twitterToken.access_token;
  }

  protected async _requestAccessToken(
    twitterCode: string,
    callback: string
  ): Promise<TwitterToken> {
    const authClient = new auth.OAuth2User(this._getConfig(callback));
    const res = await authClient.requestAccessToken(twitterCode as string);
    return res.token as TwitterToken;
  }

  protected async _refreshAccessToken(
    token: TwitterToken
  ): Promise<TwitterToken> {
    const authClient = new auth.OAuth2User({
      ...this._getConfig(token.callback),
      token,
    });
    if (authClient.isAccessTokenExpired()) {
      await authClient.refreshAccessToken();
    }
    return authClient.token as TwitterToken;
  }

  protected async _getTwitterAccount(
    callback: string
  ): Promise<TwitterV2Account> {
    const authClient = new auth.OAuth2User(this._getConfig(callback));
    const client = new Client(authClient);
    const me = await client.users.findMyUser();
    const userId = me.data?.id;
    const username = me.data?.username;
    if (!userId) throw new Error("userId is undefined");
    if (!username) throw new Error("username is undefined");

    const identifier = `0x1002${utils.hexZeroPad(`0x${userId}`, 20).slice(6)}`;
    const twitterAccount: TwitterV2Account = {
      userId,
      username,
      identifier: identifier,
    };
    return twitterAccount;
  }

  protected _getConfig(callback: string): OAuth2UserOptions {
    return {
      client_id: twitterClientId as string,
      client_secret: twitterClientSecret as string,
      callback,
      scopes: TWITTER_SCOPES,
    };
  }
}

// const STATE = "commitment-mapper-twitter-v2";
// const authUrl = authClient.generateAuthURL({
//   state: STATE,
//   code_challenge_method: "s256",
// });
// //
