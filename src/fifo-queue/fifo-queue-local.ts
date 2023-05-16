import { Msg, FifoQueue } from "./fifo-queue";

export class LocalFifoQueue implements FifoQueue {
  private _queue: Msg[];

  constructor() {
    this._queue = [];
  }

  async add(msg: Msg) {
    this._queue.push(msg);
    console.log("add msg", msg);
  }

  async pop() {
    const msg = this._queue.shift();
    console.log("get msg", msg);
    if (!msg) {
      throw new Error("No msg available in the queue");
    }
    return msg;
  }
}
