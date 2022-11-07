import { CacheStore, Key, Value } from "./cache-store";

export class CacheStoreLocal implements CacheStore {
  private _cache: { [key: string]: string } = {};

  async add(key: Key, value: Value, duration: number): Promise<void> {
    this._cache[key] = value;
  }
  async get(key: Key): Promise<Value> {
    const value = this._cache[key];
    if (!value) throw new Error("key does not exist in store");
    return value;
  }
}
