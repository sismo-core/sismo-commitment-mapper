import { TelegramPayload, TelegramOwnershipVerifier } from "./telegram";

class TelegramOwnershipVerifierWithToken extends TelegramOwnershipVerifier {
  protected _getTelegramBotToken(_botId: string): string {
    return "test_token";
  }
};

test("should throw error when bot id is missing", async() => {
  const verifier = new TelegramOwnershipVerifierWithToken();

  await expect(verifier.verify({ botId: "", payload: "payload" }))
    .rejects.toThrowError("Bot ID (bot_id) must not be empty");
});

test("should throw error when payload is missing", async() => {
  const verifier = new TelegramOwnershipVerifierWithToken();

  await expect(verifier.verify({ botId: "botId", payload: "" }))
    .rejects.toThrowError("Payload (payload) must not be empty");
});

test("should throw error when payload is not a valid JSON", async() => {
  const verifier = new TelegramOwnershipVerifierWithToken();

  await expect(verifier.verify({ botId: "botId", payload: "payload" }))
    .rejects.toThrowError(/Error decoding payload/);
});

test("should map bot token to bot id", async() => {
  class TelegramOwnershipVerifierMock extends TelegramOwnershipVerifier {
    protected _decodePayload(_payload: string): TelegramPayload {
      return {
        id: 123,
        username: "username",
        hash: "hash"
      };
    }
    protected _hash(key: string, _data: string): string {
      return (key === "botId2:token2") ? "hash" : "other-hash";
    }
    protected _getTelegramBotTokens(): string {
      return "botId1:token1,botId2:token2";
    }
  }
  const verifier = new TelegramOwnershipVerifierMock();
  const account = await verifier.verify({ botId: "botId2", payload: "payload" });

  expect(account.id).toEqual(123);
  expect(account.username).toEqual("username");
});

test("should throw error when payload does not contain hash", async() => {
  const verifier = new TelegramOwnershipVerifierWithToken();
  const payloadWithoutHash = btoa(JSON.stringify({ id: 123 }));
 
  await expect(verifier.verify({ botId: "botId", payload: payloadWithoutHash }))
    .rejects.toThrowError("Payload must contain hash"); 
});

test("should throw error when hash check fails", async() => {
  class TelegramOwnershipVerifierMock extends TelegramOwnershipVerifierWithToken {
    protected _decodePayload(_payload: string): TelegramPayload {
      return {
        id: 123,
        username: "username",
        hash: "hash"
      };
    }
    protected _checkHash(_botId: "botId", _payload: TelegramPayload): boolean {
      return false;
    }
  }
  const verifier = new TelegramOwnershipVerifierMock();

  await expect(verifier.verify({ botId: "botId", payload: "payload" }))
    .rejects.toThrowError("Hash check failed, data is not from Telegram");
});

test("should return account when hash check passes", async() => {
  class TelegramOwnershipVerifierMock extends TelegramOwnershipVerifierWithToken {
    protected _decodePayload(_payload: string): TelegramPayload {
      return {
        id: 123,
        username: "username",
        hash: "hash"
      };
    }
    protected _checkHash(_botId: "botId", _payload: TelegramPayload): boolean {
      return true;
    }
  }
  const verifier = new TelegramOwnershipVerifierMock();
  const account = await verifier.verify({ botId: "botId", payload: "payload" });

  expect(account.id).toEqual(123);
  expect(account.identifier).toEqual("0x1003000000000000000000000000000000000123");
  expect(account.username).toEqual("username");
});