import { DynamoDB } from "aws-sdk";

import { CacheStore, Key, Value } from "./cache-store";

export class CacheStoreDynamodb implements CacheStore {
  private _tableName: string;
  private _documentClient: DynamoDB.DocumentClient;

  constructor(tableName: string, region: string) {
    this._tableName = tableName;
    this._documentClient = new DynamoDB.DocumentClient({
      region: region,
    });
  }

  async add(key: Key, value: Value, duration: number): Promise<void> {
    await this._documentClient
      .put({
        TableName: this._tableName,
        Item: {
          key,
          value,
          expiration: Math.floor(Date.now() / 1000) + duration,
        },
      })
      .promise();
  }
  async get(key: Key): Promise<Value> {
    return this._documentClient
      .get({
        TableName: this._tableName,
        Key: { key },
      })
      .promise()
      .then((data) =>
        data.Item
          ? data.Item.value
          : Promise.reject(new Error("key does not exist in cache store"))
      );
  }
}
