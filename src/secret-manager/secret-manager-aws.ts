import { SecretsManager } from "aws-sdk";

import { SecretManager } from "./secret-manager";

export default class SecretManagerAWS extends SecretManager {
  private _secretName = "commitment-mapper/secret3";
  private _secretManager = new SecretsManager();

  protected async _exists(): Promise<boolean> {
    return this._secretManager
      .describeSecret({ SecretId: this._secretName })
      .promise()
      .then(() => true)
      .catch(() => false);
  }

  protected async _create(secret: string): Promise<null> {
    return this._secretManager
      .createSecret({
        Name: this._secretName,
        SecretString: secret,
      })
      .promise()
      .then(() => null);
  }

  protected async _get(): Promise<string> {
    return this._secretManager
      .getSecretValue({ SecretId: this._secretName })
      .promise()
      .then((secret) => secret.SecretString || "");
  }
}
