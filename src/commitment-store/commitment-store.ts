
export type Address = string;
export type Commitment = string;

export interface CommitmentStore {
  add(address: Address, commitment: Commitment): Promise<void>;
  get(address: Address): Promise<Commitment>;
}
