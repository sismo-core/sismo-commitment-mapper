import { SecretManager } from "./secret-manager";

export default class SecretManagerLocal extends SecretManager {
  protected _create(): Promise<null> {
    throw new Error("Not implemented");
  }

  protected _exists(): Promise<boolean> {
    return Promise.resolve(false);
  }

  protected _get(): Promise<string> {
    return Promise.resolve('{"seed": "0x123876543456"}');
  }
}
