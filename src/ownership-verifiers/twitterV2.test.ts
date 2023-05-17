import { FifoQueue, LocalFifoQueue } from "../fifo-queue";
import {
  TwitterToken,
  TwitterV2Account,
  TwitterV2OwnershipVerifier,
} from "./twitterV2";

const mockTwitterToken = {
  token_type: "test_token_type",
  expires_in: 10,
  scope: "scope",
};

const mockTwitterAccount = {
  userId: "123",
  identifier: "test_identifier",
  username: "test_username",
};

class TwitterV2OwnershipVerifierTest extends TwitterV2OwnershipVerifier {
  protected async _requestAccessToken(
    twitterCode: string,
    callback: string
  ): Promise<TwitterToken> {
    return {
      ...mockTwitterToken,
      access_token: twitterCode,
      callback,
    };
  }

  protected async _refreshAccessToken(
    token: TwitterToken
  ): Promise<TwitterToken> {
    if (token.callback === "http://refresh_failure") {
      throw new Error("failed to refresh token");
    }
    return token;
  }

  protected async _getTwitterAccount(): Promise<TwitterV2Account> {
    return mockTwitterAccount;
  }
}

let fifoQueue: FifoQueue;
let twitterV2OwnershipVerifierTest: TwitterV2OwnershipVerifierTest;

beforeEach(async () => {
  fifoQueue = new LocalFifoQueue();
  twitterV2OwnershipVerifierTest = new TwitterV2OwnershipVerifierTest(
    fifoQueue
  );
});

test("should verify a twitter account code and add it into the queue", async () => {
  expect(
    await twitterV2OwnershipVerifierTest.verify({
      callback: "http://test",
      twitterCode: "test_twitter_code",
    })
  ).toEqual(mockTwitterAccount);
  expect(await fifoQueue.pop()).toEqual({
    twitterToken: {
      ...mockTwitterToken,
      access_token: "test_twitter_code",
      callback: "http://test",
    },
    failureCount: 0,
  });
});

test("should get a round robin access token from the queue", async () => {
  await twitterV2OwnershipVerifierTest.verify({
    callback: "http://test",
    twitterCode: "test_twitter_code_1",
  });
  await twitterV2OwnershipVerifierTest.verify({
    callback: "http://test",
    twitterCode: "test_twitter_code_2",
  });
  expect(await twitterV2OwnershipVerifierTest.getAccessToken()).toEqual(
    "test_twitter_code_1"
  );
  expect(await twitterV2OwnershipVerifierTest.getAccessToken()).toEqual(
    "test_twitter_code_2"
  );
  expect(await twitterV2OwnershipVerifierTest.getAccessToken()).toEqual(
    "test_twitter_code_1"
  );
});

test("should be able to take only the good access token", async () => {
  await twitterV2OwnershipVerifierTest.verify({
    callback: "http://refresh_failure",
    twitterCode: "test_twitter_code_failure",
  });
  await twitterV2OwnershipVerifierTest.verify({
    callback: "http://refresh_failure",
    twitterCode: "test_twitter_code_failure",
  });
  await twitterV2OwnershipVerifierTest.verify({
    callback: "http://test",
    twitterCode: "test_twitter_code_ok",
  });
  expect(await twitterV2OwnershipVerifierTest.getAccessToken()).toEqual(
    "test_twitter_code_ok"
  );
});
