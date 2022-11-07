export type AccountIdentifier = string;
export type Commitment = string;

export interface CommitmentStore {
  add(
    accountIdentifier: AccountIdentifier,
    commitment: Commitment
  ): Promise<void>;
  get(accountIdentifier: AccountIdentifier): Promise<Commitment>;
}
