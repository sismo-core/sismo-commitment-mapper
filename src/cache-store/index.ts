export * from "./cache-store-dynamodb";
export * from "./cache-store-local";
export * from "./cache-store";

import { CacheStoreDynamodb } from "./cache-store-dynamodb";
import { CacheStoreLocal } from "./cache-store-local";

const getDynamoDBCacheStoreInstance = () => {
  const env = process.env;
  if (!env.CACHE_STORE_REGION || !env.CACHE_STORE_TABLE_NAME) {
    throw "CACHE_STORE_REGION and CACHE_STORE_TABLE_NAME env vars must be set";
  }
  return new CacheStoreDynamodb(
    env.CACHE_STORE_TABLE_NAME,
    env.CACHE_STORE_REGION
  );
};

export const getCacheStore = () => {
  return process.env.IS_LOCAL
    ? new CacheStoreLocal()
    : getDynamoDBCacheStoreInstance();
};
