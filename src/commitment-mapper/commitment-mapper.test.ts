import LocalCommitmentStore from "../commitment-store/commitment-store-local";
import { buildPoseidon } from "@sismo-core/crypto";
import {
  CommitmentMapper,
  CommitmentMapperPublicKey,
} from "./commitment-mapper";
import { CommitmentStore } from "commitment-store";

export type CommitmentMapperTestAPIResponse = {
  receipt: string;
};

export default class CommitmentMapperTest extends CommitmentMapper {
  constructor(commitmentStore: CommitmentStore) {
    super(commitmentStore);
  }

  public async getPubKey(): Promise<CommitmentMapperPublicKey> {
    return ["0x1", "0x2"];
  }

  protected async _constructCommitmentReceipt(
    ethAddress: string,
    commitment: string
  ): Promise<CommitmentMapperTestAPIResponse> {
    return { receipt: `${ethAddress}:${commitment}` };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async getSismoAddressCommitment(): Promise<void> {}
}

let poseidon: any;
let localCommitmentStore: LocalCommitmentStore;
let commitmentMapperTest: CommitmentMapperTest;

beforeAll(async () => {
  // setup cryptography libraries
  poseidon = await buildPoseidon();
  // setup local service for testing.
  localCommitmentStore = new LocalCommitmentStore();
  commitmentMapperTest = new CommitmentMapperTest(localCommitmentStore);
});

test("add a valid commitment into the commitmentStore and get a commitmentReceipt for it", async () => {
  const account = "0x1";

  // the user choose its commitment and commit with its proof of ownership
  const commitment = "123";
  const commitmentMapperResponse: CommitmentMapperTestAPIResponse =
    await commitmentMapperTest.commit(account, commitment);

  expect(commitmentMapperResponse.receipt).toEqual(`${account}:${commitment}`);
}, 10000);

test("send again the same commitment into the commitmentStore and get a commitmentReceipt for it", async () => {
  const account = "0x1";

  // the user choose its commitment and commit with its proof of ownership
  const commitment = "123";
  const commitmentMapperResponse: CommitmentMapperTestAPIResponse =
    await commitmentMapperTest.commit(account, commitment);

  expect(commitmentMapperResponse.receipt).toEqual(`${account}:${commitment}`);
}, 20000);

test("Try to commit an other commitment for the same address, should throw", async () => {
  const account = "0x1";
  await expect(commitmentMapperTest.commit(account, "1234")).rejects.toThrow(
    "Address is already used for a commitment!"
  );
});

test("Call the commit function without commitment should throw", async () => {
  const account = "0x2";
  await expect(commitmentMapperTest.commit(account, "")).rejects.toThrow(
    "account and commitment should always be defined!"
  );
});
