import LocalCommitmentStore from "../commitment-store/commitment-store-local";
import { getOwnershipMsg } from "../utils/get-ownership-msg";
import { ethers, Wallet } from "ethers";
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

  public async getSismoAddressCommitment(): Promise<void> {}
}

let poseidon: any;
let localCommitmentStore: LocalCommitmentStore;
let commitmentMapperTest: CommitmentMapperTest;
let wallet: Wallet;

beforeAll(async () => {
  // setup cryptography libraries
  poseidon = await buildPoseidon();
  // setup local service for testing.
  localCommitmentStore = new LocalCommitmentStore();
  commitmentMapperTest = new CommitmentMapperTest(localCommitmentStore);
  // setup a wallet with an ethereum account to simulate a user.
  const testMnemonic =
    "myth like bonus scare over problem client lizard pioneer submit female collect";
  wallet = ethers.Wallet.fromMnemonic(testMnemonic);
});

test("add a valid commitment into the commitmentStore and get a commitmentReceipt for it", async () => {
  // get the ethereum account prove of ownership
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(getOwnershipMsg(ethAddress));

  // the user choose its commitment and commit with its proof of ownership
  const commitment = "123";
  const commitmentMapperResponse: CommitmentMapperTestAPIResponse =
    await commitmentMapperTest.commit(ethAddress, ethSignature, commitment);

  expect(commitmentMapperResponse.receipt).toEqual(
    `${ethAddress.toLowerCase()}:${commitment}`
  );
}, 10000);

test("send again the same commitment into the commitmentStore and get a commitmentReceipt for it", async () => {
  // get the ethereum account prove of ownership
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(getOwnershipMsg(ethAddress));

  // the user choose its commitment and commit with its proof of ownership
  const commitment = "123";
  const commitmentMapperResponse: CommitmentMapperTestAPIResponse =
    await commitmentMapperTest.commit(ethAddress, ethSignature, commitment);

  expect(commitmentMapperResponse.receipt).toEqual(
    `${ethAddress.toLowerCase()}:${commitment}`
  );
}, 20000);

test("Try to commit an other commitment for the same address, should throw", async () => {
  // get the ethereum account prove of ownership
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(getOwnershipMsg(ethAddress));
  await expect(
    commitmentMapperTest.commit(ethAddress, ethSignature, "1234")
  ).rejects.toThrow("Address is already used for a commitment!");
});

test("Call the commit function without commitment should throw", async () => {
  const wallet2 = ethers.Wallet.createRandom();
  const ethAddress = wallet2.address;
  const ethSignature = await wallet2.signMessage(getOwnershipMsg(ethAddress));
  await expect(
    commitmentMapperTest.commit(ethAddress, ethSignature, "")
  ).rejects.toThrow(
    "ethAddress and ethSignature and commitment should always be defined!"
  );
});

test("Try to commit to an address with an invalid signature, should throw", async () => {
  const ethAddress = wallet.address;
  const malformedsignature = "0x345";
  await expect(
    commitmentMapperTest.commit(ethAddress, malformedsignature, "123")
  ).rejects.toThrow(
    'signature missing v and recoveryParam (argument="signature", value="0x345", code=INVALID_ARGUMENT, version=bytes/5.6.1)'
  );
});

test("Try to commit to an address with a signature of ownership from an other address, should throw", async () => {
  // get the ethereum account prove of ownership
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(getOwnershipMsg(ethAddress));
  // create an other wallet
  const wallet2 = ethers.Wallet.createRandom();
  await expect(
    commitmentMapperTest.commit(wallet2.address, ethSignature, "123")
  ).rejects.toThrow(
    `Address ${wallet2.address.toLowerCase()} does not corresponds to signature!`
  );
});

test("Try to commit to an address with a signature of a bad ownership msg, should throw", async () => {
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(
    `${getOwnershipMsg(ethAddress)}-test`
  );
  await expect(
    commitmentMapperTest.commit(wallet.address, ethSignature, "123")
  ).rejects.toThrow(
    `Address ${ethAddress.toLowerCase()} does not corresponds to signature!`
  );
});
