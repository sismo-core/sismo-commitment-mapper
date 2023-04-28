export * from "./secret-manager";

import SecretManagerAWS from "./secret-manager-aws";
import LocalSecret from "./secret-manager-local";

export const enum SecretHandlerType {
  SecretManagerAWS,
  LocalSecret,
}

export const getSecretHandler = (force?: SecretHandlerType) => {
  const isLocal = process.env.IS_LOCAL || process.env.IS_OFFLINE === 'true'; 

  if (isLocal || force === SecretHandlerType.LocalSecret) {
    return new LocalSecret();
  }
  if (force === SecretHandlerType.SecretManagerAWS) {
    return new SecretManagerAWS();
  }

  return new SecretManagerAWS();
};
