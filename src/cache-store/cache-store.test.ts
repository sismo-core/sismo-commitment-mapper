import { CacheStore } from "./cache-store";
import { CacheStoreLocal } from "cache-store/cache-store-local";

describe("test cache store", () => {
  let testCacheStore: CacheStore;
  beforeAll(() => {
    testCacheStore = new CacheStoreLocal();
  });
  test("set a cache key", async () => {
    await testCacheStore.add("testKey", "testValue", 1000);
  });
  test("get a cache key", async () => {
    const value = await testCacheStore.get("testKey");
    expect(value).toBe("testValue");
  });
});
