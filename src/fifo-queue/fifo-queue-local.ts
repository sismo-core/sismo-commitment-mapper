import { Msg, FifoQueue } from "./fifo-queue";

export class LocalFifoQueue implements FifoQueue {
  private _queue: Msg[];

  constructor() {
    this._queue = [];
  }

  async add(msg: Msg) {
    this._queue.push(msg);
  }

  async isEmpty() {
    return await this.length() == 0;
  }

  async length() {
    return this._queue.length;
  }

  async pop() {
    const msg = this._queue.shift();
    if (!msg) {
      throw new Error("No msg available in the queue");
    }
    return msg;
  }
}