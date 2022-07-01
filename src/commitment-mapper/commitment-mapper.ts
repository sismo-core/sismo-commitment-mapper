import { CommitmentStore } from "../commitment-store";
import { utils } from "ethers";
import { getOwnershipMsg } from "../utils/get-ownership-msg";

export type CommitmentMapperPublicKey = string[];

export abstract class CommitmentMapper {
  private _commitmentStore: CommitmentStore;

  constructor(commitmentStore: CommitmentStore) {
    this._commitmentStore = commitmentStore;
  }

  // verify the address ownership then store the commitment in the commitment store
  async commit(
    ethAddress: string,
    ethSignature: string,
    commitment: string
  ): Promise<any> {
    // Verify inputs
    if (!ethAddress || !ethSignature || !commitment) {
      throw new Error(
        "ethAddress and ethSignature and commitment should always be defined!"
      );
    }

    // verify the ownership of the ethereum account
    const ethAddressLowerCase = ethAddress.toLowerCase();
    await this._verifyEthAccountOwnership(ethAddressLowerCase, ethSignature);

    // verify the account is not already linked to a commitment
    const accountAlreadyStore = await this._isAlreadyUsedForACommitment(
      ethAddressLowerCase
    );
    if (accountAlreadyStore) {
      // retrieve the commitment then verified it has not been modified
      const retrieveCommitment = await this._getCommitment(ethAddressLowerCase);
      if (commitment != retrieveCommitment) {
        throw new Error("Address is already used for a commitment!");
      }
    }

    // store the commitment on the database
    await this._storeCommitment(ethAddressLowerCase, commitment);

    // send back a commitment receipt linked to this commitment
    return this._constructCommitmentReceipt(ethAddressLowerCase, commitment);
  }

  public abstract getSismoAddressCommitment(): Promise<any>;

  public abstract getPubKey(): Promise<CommitmentMapperPublicKey>;

  // Verify the Eth account is well possessed by the caller of this function
  // by verifing the signature corresponds to the address.
  private async _verifyEthAccountOwnership(
    ethAddress: string,
    ethSignature: string
  ): Promise<void> {
    const recoveredAddress = utils.verifyMessage(
      getOwnershipMsg(ethAddress),
      ethSignature
    );
    if (!recoveredAddress) {
      throw new Error("Signature not valid!");
    }
    if (ethAddress.toLowerCase() != recoveredAddress.toLowerCase()) {
      throw new Error(
        `Address ${ethAddress} does not corresponds to signature!`
      );
    }
  }

  private async _isAlreadyUsedForACommitment(
    ethAddress: string
  ): Promise<boolean> {
    try {
      const commitment = await this._commitmentStore.get(ethAddress);
      if (!commitment) {
        return true;
      }
    } catch (e: any) {
      if (e.message === "address does not exist in store") {
        return false;
      }
      throw new Error(e);
    }
    return true;
  }

  private async _storeCommitment(
    ethAddress: string,
    commitment: string
  ): Promise<void> {
    await this._commitmentStore.add(ethAddress, commitment);
  }

  private async _getCommitment(ethAddress: string): Promise<string> {
    return this._commitmentStore.get(ethAddress);
  }

  protected abstract _constructCommitmentReceipt(
    ethAddress: string,
    commitment: string
  ): Promise<any>;
}
