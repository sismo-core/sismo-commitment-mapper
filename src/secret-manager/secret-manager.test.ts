import { SecretManager } from "./secret-manager";

const testCommitmentMapperSecret = {
  seed: "test_seed",
};

class SecretManagerTester extends SecretManager {
  public exists = false;
  public created = false;
  public secretStr = '{"seed": "test_seed"}';

  protected async _exists(): Promise<boolean> {
    return Promise.resolve(this.exists);
  }

  protected async _create(): Promise<null> {
    this.created = true;
    return Promise.resolve(null);
  }

  protected async _get(): Promise<string> {
    return Promise.resolve(this.secretStr);
  }
}

test("generate secret call _create method", async () => {
  const secretManager = new SecretManagerTester();
  const created = await secretManager.generate(async () => testCommitmentMapperSecret)
  expect(created).toBeTruthy();
  expect(secretManager.created).toBeTruthy();
});

test("do not create secret if already exists", async () => {
  const secretManager = new SecretManagerTester();
  secretManager.exists = true;
  const created = await secretManager.generate(async () => testCommitmentMapperSecret);
  expect(created).toBeFalsy();
  expect(secretManager.created).toBeFalsy();
});

test("get a valid CommitmentMapperSecret", async () => {
  const secretManager = new SecretManagerTester();
  const secret = await secretManager.get()
  expect(secret).toEqual({
    seed: "test_seed",
  });
});

test("raise error if secret is empty", async () => {
  const secretManager = new SecretManagerTester();
  secretManager.secretStr = "";
  expect(async () => {
    await secretManager.get();
  }).rejects.toThrowError("Invalid Secret");
});

test("raise error if secret is invalid", async () => {
  const secretManager = new SecretManagerTester();
  secretManager.secretStr = '{"invalidKey": "test_seed"}';
  expect(async () => {
    await secretManager.get();
  }).rejects.toThrowError("Invalid Secret");
});
