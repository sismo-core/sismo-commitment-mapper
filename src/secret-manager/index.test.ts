import { getSecretHandler, SecretHandlerType } from "./index";
import SecretManagerAWS from "./secret-manager-aws";
import LocalSecret from "./secret-manager-local";

test("force SecretManagerAWS", async () => {
  expect(getSecretHandler(SecretHandlerType.SecretManagerAWS)).toBeInstanceOf(
    SecretManagerAWS
  );
});

test("force LocalSecret", async () => {
  expect(getSecretHandler(SecretHandlerType.LocalSecret)).toBeInstanceOf(
    LocalSecret
  );
});

test("default to SecretManagerAWS", async () => {
  expect(getSecretHandler()).toBeInstanceOf(SecretManagerAWS);
});

test("default to LocalSecret if local", async () => {
  process.env.IS_LOCAL = "true";
  const secretHandler = getSecretHandler();
  delete process.env.IS_LOCAL;
  expect(secretHandler).toBeInstanceOf(LocalSecret);
});
