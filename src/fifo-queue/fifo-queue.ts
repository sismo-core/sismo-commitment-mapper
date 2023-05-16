export type Msg = any;

export interface FifoQueue {
  add(msg: Msg): Promise<void>;
  pop(): Promise<Msg>;
}
