import { CommitmentStore } from "../commitment-store";

export type CommitmentMapperPublicKey = string[];

export abstract class CommitmentMapper {
  private _commitmentStore: CommitmentStore;

  constructor(commitmentStore: CommitmentStore) {
    this._commitmentStore = commitmentStore;
  }

  // verify the address ownership then store the commitment in the commitment store
  async commit(account: string, commitment: string): Promise<any> {
    if (!account || !commitment) {
      throw new Error("account and commitment should always be defined!");
    }

    // verify the account is not already linked to a commitment
    const accountAlreadyStore = await this._isAlreadyUsedForACommitment(
      account
    );
    if (accountAlreadyStore) {
      // retrieve the commitment then verified it has not been modified
      const retrieveCommitment = await this._getCommitment(account);
      if (commitment != retrieveCommitment) {
        throw new Error("Address is already used for a commitment!");
      }
    }
    await this._storeCommitment(account, commitment);

    // send back a commitment receipt linked to this commitment
    return this._constructCommitmentReceipt(account, commitment);
  }

  public abstract getSismoAddressCommitment(): Promise<any>;

  public abstract getPubKey(): Promise<CommitmentMapperPublicKey>;

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
