export * from "./secret-manager";

import SecretManagerAWS from "./secret-manager-aws";
import LocalSecret from "./secret-manager-local";

export const enum SecretHandlerType {
  SecretManagerAWS,
  LocalSecret,
}

export const getSecretHandler = (force?: SecretHandlerType) => {
  if (force === SecretHandlerType.SecretManagerAWS) {
    return new SecretManagerAWS();
  }
  if (force === SecretHandlerType.LocalSecret) {
    return new LocalSecret();
  }
  return process.env.IS_LOCAL ? new LocalSecret() : new SecretManagerAWS();
};
