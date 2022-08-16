import { CommitmentStore } from "../commitment-store";
import {
  CommitmentMapper,
  CommitmentMapperPublicKey,
} from "./commitment-mapper";
import {
  SNARK_FIELD,
  EddsaAccount,
  buildPoseidon,
  EddsaPublicKey,
} from "@sismo-core/crypto";
import { SecretManager } from "../secret-manager";
import { BigNumber } from "ethers";

export type HashCommitmentReceiptAPIResponse = {
  commitmentMapperPubKey: string[];
  commitmentReceipt: string[];
};

export const enum CommitmentStoreNamespace {
  HashCommitment = "hash-commitment",
}

export default class CommitmentMapperEddsa extends CommitmentMapper {
  private _secretManager: SecretManager;

  constructor(commitmentStore: CommitmentStore, secretManager: SecretManager) {
    super(commitmentStore);
    this._secretManager = secretManager;
  }

  public async getPubKey(): Promise<CommitmentMapperPublicKey> {
    // instantiate the eddsaAccount of this commitmentMapper implementation
    // this will be used to sign the receipt
    const secret = await this._secretManager.get();
    const eddsaAccount = await EddsaAccount.generateFromSeed(
      BigNumber.from(secret.seed)
    );

    return eddsaAccount
      .getPubKey()
      .map((coord: BigNumber) => coord.toHexString());
  }

  public async getSismoAddressCommitment(): Promise<HashCommitmentReceiptAPIResponse> {
    const sismoAddress = "0x0000000000000000000000000000000000515110";
    const poseidon: any = await buildPoseidon();
    const commitment = poseidon([BigNumber.from(515110)]);
    return this._constructCommitmentReceipt(sismoAddress, commitment);
  }

  protected async _constructCommitmentReceipt(
    ethAddress: string,
    commitment: string
  ): Promise<HashCommitmentReceiptAPIResponse> {
    // instantiate the eddsaAccount of this commitmentMapper implementation
    // this will be used to sign the receipt
    const secret = await this._secretManager.get();
    const eddsaAccount = await EddsaAccount.generateFromSeed(
      BigNumber.from(secret.seed)
    );

    // construct the receipt
    const poseidon = await buildPoseidon();
    const ethAddressBigNumber = BigNumber.from(ethAddress.toLowerCase()).mod(
      SNARK_FIELD
    );
    const msg = poseidon([ethAddressBigNumber, commitment]);
    // sign the receipt => this is the commitmentReceipt
    const commitmentReceipt = await eddsaAccount.sign(msg);

    // convert bigNumber receipt to HexString
    const commitmentReceiptHex = commitmentReceipt.map((receipt: BigNumber) =>
      receipt.toHexString()
    );
    const pubKeyHex = eddsaAccount
      .getPubKey()
      .map((coord: BigNumber) => coord.toHexString());

    return {
      commitmentMapperPubKey: pubKeyHex,
      commitmentReceipt: commitmentReceiptHex,
    };
  }
}
