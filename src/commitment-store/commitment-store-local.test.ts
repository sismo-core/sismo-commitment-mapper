import LocalCommitmentStore from "./commitment-store-local";

test("get invalid address fail", async () => {
  const commitmentStore = new LocalCommitmentStore();
  expect(async () => await commitmentStore.get("1")).rejects.toThrow();
});

test("add then get have correct values", async () => {
  const commitmentStore = new LocalCommitmentStore();
  await commitmentStore.add("1", "value1");
  await commitmentStore.add("2", "value2");
  const value1 = await commitmentStore.get("1");
  expect(value1).toEqual("value1");
  const value2 = await commitmentStore.get("2");
  expect(value2).toEqual("value2");
});
