import {
  buildPoseidon,
  EddsaPublicKey,
  EddsaSignature,
} from "@sismo-core/crypto";
import { BigNumber, BigNumberish, ethers, Signer } from "ethers";
import SecretManagerLocal from "./commitment/secret-manager-local";
import { getCommitmentStore, getOwnershipMsg } from "./commitment";
import CommitmentMapperEddsa from "./commitment/commitment-mapper-eddsa";

export type SignerWithCommitmentReceipt = {
  signer: Signer;
  secret: BigNumberish;
  commitmentReceipt: EddsaSignature;
};

export type SismoAddressCommitmentReceipt = {
  address: string;
  secret: string;
  commitmentReceipt: EddsaSignature;
};

export class CommitmentMapperTester {
  private _commitmentMapper: CommitmentMapperEddsa;
  private _secretManager: SecretManagerLocal;

  constructor() {
    const secretManager = new SecretManagerLocal();
    this._secretManager = secretManager;
    const commitmentStore = getCommitmentStore();
    this._commitmentMapper = new CommitmentMapperEddsa(
      commitmentStore,
      secretManager
    );
  }

  public static async generate(): Promise<CommitmentMapperTester> {
    const commitmentMapperTester = new CommitmentMapperTester();
    await commitmentMapperTester.generateRandomSecret();
    return commitmentMapperTester;
  }

  public async commit(
    ethAddress: string,
    ethSignature: string,
    commitment: string
  ): Promise<{
    commitmentReceipt: EddsaSignature;
    commitmentMapperPubKey: EddsaPublicKey;
  }> {
    return this._commitmentMapper.commit(ethAddress, ethSignature, commitment);
  }

  public async getPubKey(): Promise<EddsaPublicKey> {
    const pubKey = await this._commitmentMapper.getPubKey();
    return [BigNumber.from(pubKey[0]), BigNumber.from(pubKey[1])];
  }

  public async generateRandomSecret() {
    const secretGenerator = async () => ({
      seed: BigNumber.from(32).toHexString(),
    });
    await this._secretManager.generate(secretGenerator);
  }

  public async getSismoAddressCommitmentReceipt(): Promise<SismoAddressCommitmentReceipt> {
    const commitmentReceipt = (
      await this._commitmentMapper.getSismoAddressCommitment()
    ).commitmentReceipt;
    return {
      address: "0x0000000000000000000000000000000000515110",
      secret: "515110",
      commitmentReceipt: [
        BigNumber.from(commitmentReceipt[0]),
        BigNumber.from(commitmentReceipt[1]),
        BigNumber.from(commitmentReceipt[2]),
      ],
    };
  }

  // Default to 10 signers
  public async getSignersWithCommitmentReceipt({
    mnemonic,
    useSigners: signers,
    numberOfSigners,
  }: {
    mnemonic?: string;
    useSigners?: Signer[];
    numberOfSigners?: number;
  } = {}): Promise<SignerWithCommitmentReceipt[]> {
    const poseidon = await buildPoseidon();

    const generateSigners = (): Signer[] => {
      const testSismoSharedMnemonic = mnemonic
        ? mnemonic
        : "analyst decade album recall stem run cage ozone human pepper once insect";
      let wallets: Signer[] = [];
      const totalNumberOfSigners = numberOfSigners ? numberOfSigners : 10;
      for (let index = 0; index < totalNumberOfSigners; index++) {
        const wallet = ethers.Wallet.fromMnemonic(
          testSismoSharedMnemonic,
          `m/44'/60'/0'/0/${index}`
        );
        wallets.push(wallet);
      }
      return wallets;
    };

    const usedSigners = signers ? signers : generateSigners();

    const signersWithCommitmentReceipt: SignerWithCommitmentReceipt[] = [];
    for (const signer of usedSigners) {
      const address = await signer.getAddress();
      const messageSigned = await signer.signMessage(getOwnershipMsg(address));
      const secret = BigNumber.from(20);
      const commitment = poseidon([secret]).toHexString();
      const receipt = await this.commit(address, messageSigned, commitment);
      signersWithCommitmentReceipt.push({
        signer,
        secret,
        commitmentReceipt: [
          BigNumber.from(receipt.commitmentReceipt[0]),
          BigNumber.from(receipt.commitmentReceipt[1]),
          BigNumber.from(receipt.commitmentReceipt[2]),
        ],
      });
    }

    return signersWithCommitmentReceipt;
  }
}
