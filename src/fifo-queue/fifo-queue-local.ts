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

  async isEmpty() {
    return await this.length() == 0;
  }

  async length() {
    const length = this._queue.length
    console.log("Queue length: ", length);
    return length;
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