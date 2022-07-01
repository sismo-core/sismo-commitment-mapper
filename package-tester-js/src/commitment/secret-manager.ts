export type CommitmentMapperSecret = {
  seed: string;
};

export abstract class SecretManager {

  async generate(
    generator: () => Promise<CommitmentMapperSecret>
  ): Promise<boolean> {
    if (await this._exists()) {
      return false;
    }
    //const secret = await generator();
    //await this._create(SecretManager.secretToString(secret))
    return true;
  }

  async get(): Promise<CommitmentMapperSecret> {
    const secretStr = await this._get()
    return SecretManager.stringToSecret(secretStr);
  }

  private static stringToSecret(secretStr: string): CommitmentMapperSecret {
    if (!secretStr) {
      throw new Error("Invalid Secret");
    }
    const secretParsed = JSON.parse(secretStr);
    if (!("seed" in secretParsed)) {
      throw new Error("Invalid Secret");
    }
    return {
      seed: secretParsed["seed"],
    };
  }

  private static secretToString(secret: CommitmentMapperSecret): string {
    return JSON.stringify({ seed: secret.seed });
  }

  protected abstract _exists(): Promise<boolean>;
  protected abstract _create(secret: string): Promise<null>;
  protected abstract _get(): Promise<string>;
}
