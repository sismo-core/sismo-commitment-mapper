export type Msg = any;

export interface FifoQueue {
  add(msg: Msg): Promise<void>;
  isEmpty(): Promise<boolean>;
  length(): Promise<number>;
  pop(): Promise<Msg>;
}