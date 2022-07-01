import SecretManagerLocal from "./secret-manager-local";

const testCommitmentMapperSecret = {
  seed: "test_seed",
};

test("create is not implemented", async () => {
  const secretManager = new SecretManagerLocal();
  expect(async () => {
    await secretManager.generate(async () => testCommitmentMapperSecret);
  }).rejects.toThrowError("Not implemented");
});

test("get a valid commitmentMapper secret", async () => {
  const secretManager = new SecretManagerLocal();
  const secret = await secretManager.get();
  expect(secret).toEqual(
    expect.objectContaining({
      seed: expect.any(String),
    })
  );
});
