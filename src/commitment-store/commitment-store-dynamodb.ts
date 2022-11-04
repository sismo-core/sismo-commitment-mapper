import { ChainableTemporaryCredentials, DynamoDB, Credentials } from "aws-sdk";

import { CommitmentStore, AccountIdentifier, Commitment } from ".";

export default class DynamoDBCommitmentStore implements CommitmentStore {
  private _tableName: string;
  private _documentClient: DynamoDB.DocumentClient;

  private static _assumeRole(roleARN: string): Credentials {
    return new ChainableTemporaryCredentials({
      params: { RoleArn: roleARN, RoleSessionName: "CommitmentMapper" },
    });
  }

  private static _getCredentials(roleARN: string | null): Credentials | null {
    return roleARN ? DynamoDBCommitmentStore._assumeRole(roleARN) : null;
  }

  constructor(tableName: string, region: string, roleARN: string | null) {
    this._tableName = tableName;
    this._documentClient = new DynamoDB.DocumentClient({
      region: region,
      credentials: DynamoDBCommitmentStore._getCredentials(roleARN),
    });
  }

  async add(
    accountIdentifier: AccountIdentifier,
    commitment: Commitment
  ): Promise<void> {
    return this._documentClient
      .put({
        TableName: this._tableName,
        Item: {
          Address: accountIdentifier,
          Commitment: commitment,
        },
      })
      .promise()
      .then();
  }

  async get(accountIdentifier: AccountIdentifier): Promise<Commitment> {
    return this._documentClient
      .get({
        TableName: this._tableName,
        Key: { Address: accountIdentifier },
      })
      .promise()
      .then((data) =>
        data.Item
          ? data.Item.Commitment
          : Promise.reject(new Error("address does not exist in store"))
      );
  }
}
