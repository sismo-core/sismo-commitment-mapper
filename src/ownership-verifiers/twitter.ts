import { CacheStore } from "cache-store/cache-store";
import { utils } from "ethers";
import twittersignin from "twittersignin";

const consumerKey = process.env.COMMITMENT_MAPPER_TWITTER_CONSUMER_KEY!;
const consumerSecret = process.env.COMMITMENT_MAPPER_TWITTER_CONSUMER_SECRET!;
const accessToken = process.env.COMMITMENT_MAPPER_TWITTER_ACCESS_TOKEN!;
const accessTokenSecret =
  process.env.COMMITMENT_MAPPER_TWITTER_ACCESS_TOKEN_SECRET!;

export type TwitterAccount = {
  userId: string;
  username: string;
  identifier: string;
};

export class TwitterOwnershipVerifier {
  private _cacheStore: CacheStore;
  private _twitterSign;
  constructor({ cacheStore }: { cacheStore: CacheStore }) {
    this._cacheStore = cacheStore;
    this._twitterSign = twittersignin({
      consumerKey: consumerKey,
      consumerSecret: consumerSecret,
      accessToken: accessToken,
      accessTokenSecret: accessTokenSecret,
    });
  }

  async requestToken({
    oauthCallback,
  }: {
    oauthCallback: string;
  }): Promise<string> {
    if (!oauthCallback) {
      throw new Error("oauthCallback should always be defined!");
    }
    const response = await this._twitterSign.getRequestToken({
      oauth_callback: oauthCallback,
      x_auth_access_type: "read",
    });
    if (!response.oauth_callback_confirmed) {
      throw new Error("Callback not confirmed");
    }

    const requestToken = response.oauth_token;
    const requestTokenSecret = response.oauth_token_secret;
    await this._cacheStore.add(requestToken, requestTokenSecret, 60 * 60);
    return requestToken;
  }

  async verify({
    oauthToken,
    oauthVerifier,
  }: {
    oauthToken: string;
    oauthVerifier: string;
  }): Promise<TwitterAccount> {
    if (!oauthToken || !oauthVerifier) {
      throw new Error("oauthToken and oauthVerifier should always be defined!");
    }

    const oauthTokenSecret = await this._cacheStore.get(oauthToken);

    const accessToken = await this._twitterSign.getAccessToken(
      oauthToken,
      oauthTokenSecret,
      oauthVerifier
    );

    const identifier = `0x1002${utils
      .hexZeroPad(`0x${accessToken.user_id}`, 20)
      .slice(6)}`;
    const userDetail: TwitterAccount = {
      userId: `${accessToken.user_id}`,
      username: `${accessToken.screen_name}`,
      identifier,
    };
    return userDetail;
  }
}
