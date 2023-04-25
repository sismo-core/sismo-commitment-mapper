import { buildPoseidon, EddsaAccount, EddsaSignature, SNARK_FIELD } from "@sismo-core/crypto";
import { BigNumber, BigNumberish } from "ethers";
import { MigrateOwnershipVerifier } from "./migrate";

let pubKey: [BigNumberish, BigNumberish];
let migrateOwnership: MigrateOwnershipVerifier;
let eddsaAccount: EddsaAccount;
let receipt: EddsaSignature;
let commitment: string;
let identifier: string;
let msg: BigNumber;

const setTestPubKeyEnvVars = (pubKeyX: BigNumberish, pubKeyY: BigNumberish) => {
    process.env.COMMITMENT_MAPPER_MIGRATE_PUBKEY_X = BigNumber.from(pubKeyX).toString();
    process.env.COMMITMENT_MAPPER_MIGRATE_PUBKEY_Y = BigNumber.from(pubKeyY).toString();
};
  
beforeAll(async () => {
  eddsaAccount = await EddsaAccount.generateFromSeed("0x012");
  pubKey = eddsaAccount.getPubKey();
  setTestPubKeyEnvVars(pubKey[0], pubKey[1])
  migrateOwnership = new MigrateOwnershipVerifier();
  commitment = "0x12345";
  identifier = "0x1";

  const identifierBigNumber = BigNumber.from(identifier.toLowerCase()).mod(
    SNARK_FIELD
  );
  const poseidon = await buildPoseidon();
  msg = poseidon([identifierBigNumber, commitment]);
  receipt = eddsaAccount.sign(msg)
});

test("should return true with a valid receipt", async () => {
  expect(
    await migrateOwnership.verify({ commitment, identifier, receipt })
  ).toEqual(true);
});

test("should return false with invalid commitment", async () => {
    const invalidCommitment = "0x1";
    expect(
      await migrateOwnership.verify({ 
        commitment: invalidCommitment, 
        identifier, 
        receipt 
      })
    ).toEqual(false);
});

test("should return false with invalid identifier", async () => {
    const invalidIdentifier = "0x2";
    expect(
      await migrateOwnership.verify({ 
        commitment, 
        identifier: invalidIdentifier, 
        receipt 
      })
    ).toEqual(false);
});

test("should return false with invalid receipt", async () => {
    const invalidReceipt: [BigNumber, BigNumber, BigNumber] = [
        BigNumber.from("0x1"), 
        BigNumber.from("0x2"), 
        BigNumber.from("0x3")
    ];
    expect(
      await migrateOwnership.verify({ 
        commitment, 
        identifier, 
        receipt: invalidReceipt
      })
    ).toEqual(false);
});

test("should return false with receipt signed with incorrect pubKey", async () => {
    const eddsaAccount = await EddsaAccount.generateFromSeed("0x0123");
    const invalidReceipt = eddsaAccount.sign(msg)
    expect(
      await migrateOwnership.verify({ 
        commitment, 
        identifier, 
        receipt: invalidReceipt
      })
    ).toEqual(false);
});