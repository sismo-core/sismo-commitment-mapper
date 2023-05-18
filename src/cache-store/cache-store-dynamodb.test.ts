import { CacheStore } from "./cache-store";
import { CacheStoreDynamodb } from "cache-store/cache-store-dynamodb";
import { createLocalDocumentClient } from "../utils/test-service.utils";

let cacheStore: CacheStore;

beforeAll(async () => {
  const table = {
    TableName: "cache-store",
    KeySchema: [
      { AttributeName: "key", KeyType: "HASH" },
    ],
    AttributeDefinitions: [
      { AttributeName: "key", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    }
  };
  const client = await createLocalDocumentClient(table);
  cacheStore = new CacheStoreDynamodb(client, table.TableName);
});

test("set a cache key", async () => {
  await cacheStore.add("testKey", "testValue", 1000);
});

test("get a cache key", async () => {
  const value = await cacheStore.get("testKey");
  expect(value).toBe("testValue");
});