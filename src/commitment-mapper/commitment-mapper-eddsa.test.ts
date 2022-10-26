import SecretManagerLocal from "../secret-manager/secret-manager-local";
import LocalCommitmentStore from "../commitment-store/commitment-store-local";
import CommitmentMapperEddsa, {
  HashCommitmentReceiptAPIResponse,
} from "./commitment-mapper-eddsa";
import { ethers, BigNumber, Wallet } from "ethers";
import { buildPoseidon } from "@sismo-core/crypto";

let poseidon: any;
let secretManager: SecretManagerLocal;
let localCommitmentStore: LocalCommitmentStore;
let commitmentMapperEddsa: CommitmentMapperEddsa;
let wallet: Wallet;

beforeAll(async () => {
  // setup cryptography libraries
  poseidon = await buildPoseidon();
  // setup local service for testing.
  // in production it's AWS dynamoDB and AWS secrets management that are used instead
  secretManager = new SecretManagerLocal();
  localCommitmentStore = new LocalCommitmentStore();
  commitmentMapperEddsa = new CommitmentMapperEddsa(
    localCommitmentStore,
    secretManager
  );
  // setup a wallet with an ethereum account to simulate a user.
  const testMnemonic =
    "myth like bonus scare over problem client lizard pioneer submit female collect";
  wallet = ethers.Wallet.fromMnemonic(testMnemonic);
});

test("Should get a valid public key", async () => {
  const pubKey = await commitmentMapperEddsa.getPubKey();
  expect(pubKey.length).toEqual(2);
});

test("add a valid commitment into the commitmentStore and get a commitmentReceipt for it", async () => {
  // get the ethereum account prove of ownership
  const ethAddress = wallet.address;

  // the user chose its secret. the Hash(secret) will be used as a commitment
  // and mapped to the ethereum account.
  const secret = 123456;
  // hash the secret to create the commitment.
  // commitment = hash(secret)
  const commitment = BigNumber.from(await poseidon([secret])).toHexString();

  // send the ethereum account (ethAddr) along its proof of ownership (ethSignature)
  // and the commitment the commitment mapper will send back a receipt that is
  // an EdDSA signature that approve (ethAddress;commitment)
  const commitmentMapperResponse: HashCommitmentReceiptAPIResponse =
    await commitmentMapperEddsa.commit(ethAddress, commitment);
  // contains the eddsa pubkey of the commitment mapper
  // Ax
  // Ay
  expect(commitmentMapperResponse.commitmentMapperPubKey).toEqual([
    "0x0739d67c4d0c90837361c2fe595d11dfecc2847dc41e1ef0da8201c0b16aa09c",
    "0x2206d2a327e39f643e508f5a08e922990cceba9610c15f9a94ef30d6dd54940f",
  ]);
  // contains the eddsa signature of the eth address concat with the commitment
  // R8.x
  // R8.y
  // S
  expect(commitmentMapperResponse.commitmentReceipt).toEqual([
    "0x0aaceed36c4bfc17c5e03e026fad8b64e08f3e4f780342754f2e1dbda03f730b",
    "0x221716a81b04ec1f8aacce214ab22735b03c4c075cb6e02d9a4a91f197416369",
    "0x046920ecc46ede6f04e6038074f4047708f342b11ff1fea3c84603076e2c9e15",
  ]);
}, 20000);

test("sismo address commitment receipt", async () => {
  const commitmentMapperResponse: HashCommitmentReceiptAPIResponse =
    await commitmentMapperEddsa.getSismoAddressCommitment();
  // contains the eddsa pubkey of the commitment mapper
  // Ax
  // Ay
  expect(commitmentMapperResponse.commitmentMapperPubKey).toEqual([
    "0x0739d67c4d0c90837361c2fe595d11dfecc2847dc41e1ef0da8201c0b16aa09c",
    "0x2206d2a327e39f643e508f5a08e922990cceba9610c15f9a94ef30d6dd54940f",
  ]);
  // contains the eddsa signature of the sismo 0x0000000000000000000000000000000000515110 address
  // concat with the commitment
  // R8.x
  // R8.y
  // S
  expect(commitmentMapperResponse.commitmentReceipt).toEqual([
    "0x182cbeae64368ceb4fbc6579dd4d4614667f7427ee26469e47d45b17c19c05a4",
    "0x071d546aad8e4df8394214e4513ccab4664302be335de73d74d5e5c8c35d2388",
    "0x0341498a7397c4c50fbe7f67b3b2e9d4800fa4393811e6dc04e8009cc8c57468",
  ]);
}, 20000);
