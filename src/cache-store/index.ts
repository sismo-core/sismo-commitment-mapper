export * from "./cache-store-dynamodb";
export * from "./cache-store-local";
export * from "./cache-store";

import { CacheStoreDynamodb } from "./cache-store-dynamodb";
import { CacheStoreLocal } from "./cache-store-local";
import { DynamoDB } from "aws-sdk";

let offlineModeLocalCacheStoreSingleton: any = null;

const getDynamoDBCacheStoreInstance = () => {
  const env = process.env;
  if (!env.CACHE_STORE_REGION || !env.CACHE_STORE_TABLE_NAME) {
    throw "CACHE_STORE_REGION and CACHE_STORE_TABLE_NAME env vars must be set";
  }
  return new CacheStoreDynamodb(
    new DynamoDB.DocumentClient({
      region: env.CACHE_STORE_REGION,
    }),
    env.CACHE_STORE_TABLE_NAME
  );
};

export const getCacheStore = () => {
  if(process.env.IS_OFFLINE === 'true') {
    if(!offlineModeLocalCacheStoreSingleton) {
      offlineModeLocalCacheStoreSingleton = new CacheStoreLocal();
    }
    return offlineModeLocalCacheStoreSingleton;
  }

  return  getDynamoDBCacheStoreInstance();
};
