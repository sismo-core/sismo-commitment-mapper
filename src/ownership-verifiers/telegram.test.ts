import { TelegramPayload, TelegramOwnershipVerifier } from "./telegram";

const mockTelegramPayload = {
  id: 123,
  username: "username",
  hash: "hash"
};

class TelegramOwnershipVerifierWithToken extends TelegramOwnershipVerifier {
  protected _getTelegramBotToken(): string {
    return "test_token";
  }
};

test("should throw error when payload is missing", async() => {
  const verifier = new TelegramOwnershipVerifierWithToken();

  await expect(verifier.verify({ payload: "" }))
    .rejects.toThrowError("Payload must not be empty");
});

test("should throw error when payload is not a valid JSON", async() => {
  const verifier = new TelegramOwnershipVerifierWithToken();

  await expect(verifier.verify({ payload: "test" }))
    .rejects.toThrowError("Payload is not a valid JSON");
});

test("should throw error when payload does not contain hash", async() => {
  const verifier = new TelegramOwnershipVerifierWithToken();
  const payloadWithoutHash = btoa(JSON.stringify({ id: 123 }));
 
  await expect(verifier.verify({ payload: payloadWithoutHash }))
    .rejects.toThrowError("Payload must contain hash"); 
});

test("should throw error when hash check fails", async() => {
  class TelegramOwnershipVerifierMock extends TelegramOwnershipVerifierWithToken {
    protected _decodePayload(_payload: string): TelegramPayload {
      return mockTelegramPayload;
    }
    protected _checkHash(_payload: TelegramPayload): boolean {
      return false;
    }
  }
  const verifier = new TelegramOwnershipVerifierMock();

  await expect(verifier.verify({ payload: "test" }))
    .rejects.toThrowError("Hash check failed, data is not from Telegram");
});

test("should return account when hash check passes", async() => {
  class TelegramOwnershipVerifierMock extends TelegramOwnershipVerifierWithToken {
    protected _decodePayload(_payload: string): TelegramPayload {
      return mockTelegramPayload;
    }
    protected _checkHash(_payload: TelegramPayload): boolean {
      return true;
    }
  }
  const verifier = new TelegramOwnershipVerifierMock();
  const account = await verifier.verify({ payload: "test" });

  expect(account.id).toEqual(123);
  expect(account.identifier).toEqual("0x1003000000000000000000000000000000000123");
  expect(account.username).toEqual("username");
});