import { CommitmentStore, AccountIdentifier, Commitment } from ".";

export default class LocalCommitmentStore implements CommitmentStore {
  private _store: Map<AccountIdentifier, Commitment>;

  constructor() {
    this._store = new Map<AccountIdentifier, Commitment>();
  }

  async add(address: AccountIdentifier, commitment: Commitment): Promise<void> {
    await this._store.set(address, commitment);
  }

  async get(address: AccountIdentifier): Promise<Commitment> {
    const res = await this._store.get(address);
    if (!res) throw new Error("address does not exist in store");
    return res;
  }
}
