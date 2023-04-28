import { ethers, Wallet } from "ethers";
import { EthereumOwnershipVerifier } from "./ethereum";
import { getOwnershipMsg } from "../utils/get-ownership-msg";

export type CommitmentMapperTestAPIResponse = {
  receipt: string;
};
let wallet: Wallet;
let ethereumOwnershipVerifier: EthereumOwnershipVerifier;

beforeAll(async () => {
  // setup a wallet with an ethereum account to simulate a user.
  const testMnemonic =
    "myth like bonus scare over problem client lizard pioneer submit female collect";
  wallet = ethers.Wallet.fromMnemonic(testMnemonic);

  ethereumOwnershipVerifier = new EthereumOwnershipVerifier();
});

test("should verify a valid signature for an eth account", async () => {
  // get the ethereum account prove of ownership
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(getOwnershipMsg(ethAddress));

  expect(
    await ethereumOwnershipVerifier.verify({ ethAddress, ethSignature })
  ).toEqual(ethAddress.toLowerCase());
}, 10000);

test("should throw if args are not present", async () => {
  expect(() =>
    ethereumOwnershipVerifier.verify({
      ethAddress: "",
      ethSignature: "0x1",
    })
  ).rejects.toThrow(
    "ethAddress and ethSignature and commitment should always be defined!"
  );
  expect(() =>
    ethereumOwnershipVerifier.verify({
      ethAddress: "0x1",
      ethSignature: "",
    })
  ).rejects.toThrow(
    "ethAddress and ethSignature and commitment should always be defined!"
  );
}, 10000);

test("Try to commit to an address with an invalid signature, should throw", async () => {
  const ethAddress = wallet.address;
  const malformedsignature = "0x345";
  expect(() =>
    ethereumOwnershipVerifier.verify({
      ethAddress,
      ethSignature: malformedsignature,
    })
  ).rejects.toThrow(
    /(signature missing v and recoveryParam)/
  );
});

test("Try to commit to an address with a signature of ownership from an other address, should throw", async () => {
  // get the ethereum account prove of ownership
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(getOwnershipMsg(ethAddress));
  // create an other wallet
  const wallet2 = ethers.Wallet.createRandom();

  expect(() =>
    ethereumOwnershipVerifier.verify({
      ethAddress: wallet2.address,
      ethSignature,
    })
  ).rejects.toThrow(
    `Address ${wallet2.address.toLowerCase()} does not corresponds to signature!`
  );
});

test("Try to commit to an address with a signature of a bad ownership msg, should throw", async () => {
  const ethAddress = wallet.address;
  const ethSignature = await wallet.signMessage(
    `${getOwnershipMsg(ethAddress)}-test`
  );

  expect(() =>
    ethereumOwnershipVerifier.verify({
      ethAddress,
      ethSignature,
    })
  ).rejects.toThrow(
    `Address ${ethAddress.toLowerCase()} does not corresponds to signature!`
  );
});
