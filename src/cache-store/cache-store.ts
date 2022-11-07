export type Key = string;
export type Value = string;

export interface CacheStore {
  add(key: Key, value: Value, duration: number): Promise<void>;
  get(key: Key): Promise<Value>;
}
