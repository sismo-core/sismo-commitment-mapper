import { CommitmentStore, Address, Commitment } from ".";

export default class LocalCommitmentStore implements CommitmentStore {
  private _store: Map<Address, Commitment>;

  constructor() {
    this._store = new Map<Address, Commitment>();
  }

  async add(address: Address, commitment: Commitment): Promise<void> {
    await this._store.set(address, commitment);
  }

  async get(address: Address): Promise<Commitment> {
    const res = await this._store.get(address);
    if (!res) throw new Error("address does not exist in store")
    return res;
  }
}
