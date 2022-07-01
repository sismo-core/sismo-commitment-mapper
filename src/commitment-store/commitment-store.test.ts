import { getCommitmentStore, CommitmentStoreType } from "./index";
import DynamoDBCommitmentStore from "./commitment-store-dynamodb";
import LocalCommitmentStore from "./commitment-store-local";

const setDynamoEnvVars = () => {
  process.env.COMMITMENT_STORE_TABLE_SUFFIX = "test";
  process.env.COMMITMENT_STORE_REGION = "eu-west-1";
  process.env.COMMITMENT_STORE_ROLE_ARN = "unused";
};

const deleteDynamoEnvVars = () => {
  delete process.env.COMMITMENT_STORE_TABLE_SUFFIX;
  delete process.env.COMMITMENT_STORE_REGION;
  delete process.env.COMMITMENT_STORE_ROLE_ARN;
};

const commitmentStoreNamespaceTest = "test";

test("throw error if env var are not set for DynamoDB", async () => {
  expect(() => {
    getCommitmentStore(
      commitmentStoreNamespaceTest,
      CommitmentStoreType.DynamoDBCommitmentStore
    );
  }).toThrow();
});

test("force DynamoDBAMS", async () => {
  setDynamoEnvVars();
  const commitmentStore = getCommitmentStore(
    commitmentStoreNamespaceTest,
    CommitmentStoreType.DynamoDBCommitmentStore
  );
  deleteDynamoEnvVars();
  expect(commitmentStore).toBeInstanceOf(DynamoDBCommitmentStore);
});

test("force LocalAMS", async () => {
  expect(
    getCommitmentStore(
      commitmentStoreNamespaceTest,
      CommitmentStoreType.LocalCommitmentStore
    )
  ).toBeInstanceOf(LocalCommitmentStore);
});

test("default to DynamoDBAMS", async () => {
  setDynamoEnvVars();
  expect(getCommitmentStore(commitmentStoreNamespaceTest)).toBeInstanceOf(
    DynamoDBCommitmentStore
  );
  deleteDynamoEnvVars();
});

test("default to LocalAMS if local", async () => {
  process.env.IS_LOCAL = "true";
  const commitmentStore = getCommitmentStore(commitmentStoreNamespaceTest);
  expect(commitmentStore).toBeInstanceOf(LocalCommitmentStore);
});
