import { CommitmentMapperTester } from "./commitment-mapper-tester";
import { buildPoseidon } from ".";
import { ethers, Wallet, BigNumber } from "ethers";
import { getOwnershipMsg } from "./commitment";

let commitmentMapper: CommitmentMapperTester; 
let account: string;
let messageSigned: string;
let commitment: any;
let wallet: Wallet;

beforeAll(async () => {
  const poseidon = await buildPoseidon()
  commitmentMapper = new CommitmentMapperTester();
  const testMnemonic =
  'fox sight canyon orphan hotel grow hedgehog build bless august weather swarm'
  wallet = ethers.Wallet.fromMnemonic(testMnemonic);
  account = await wallet.getAddress();
  messageSigned =  await wallet.signMessage(getOwnershipMsg(account));  
  const secret = BigNumber.from(1);
  commitment = poseidon([secret]);
})

test("Should generate the commitment proof", async () => {
  const res = await commitmentMapper.commit(account, messageSigned, commitment);
  expect(res).toEqual({
    commitmentMapperPubKey: [
      '0x0739d67c4d0c90837361c2fe595d11dfecc2847dc41e1ef0da8201c0b16aa09c',
      '0x2206d2a327e39f643e508f5a08e922990cceba9610c15f9a94ef30d6dd54940f'
    ],
    commitmentReceipt: [
      '0x23a7eeec501cef6105e5a3704786df75916a964eaa891e829ddf0ffe904e078b',
      '0x28f12252440ab2104c6d5eeb500518bc9fe021db357d96fafd7f8a770c9e26f7',
      '0x01e5fd30421faf85e77458219f689d2ce204b124b279a76f0f02c4d40107ab61'
    ]
  });
});

test("Should throw when trying to commit a second time with another secret", async () => {
  expect(async () => {
    await commitmentMapper.commit(account, messageSigned, BigNumber.from(2).toHexString())
  }).rejects.toThrowError("Address is already used for a commitment!");
});

test('Should throw when sending Invalid signature', async () => {
  const InvalidSignedMessage =  await wallet.signMessage("This is an incorrect signature");  

  expect(async () => {
    await commitmentMapper.commit(account, InvalidSignedMessage, BigNumber.from(1).toHexString());
  }).rejects.toThrowError("Address 0x75e480db528101a381ce68544611c169ad7eb342 does not corresponds to signature!");
});