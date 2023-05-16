import { Msg, FifoQueue } from "./fifo-queue";

export class FifoQueueDynamodb implements FifoQueue {
  // constructor() {}

  async add(msg: Msg) {
    // await this._sqs
    //   .sendMessage({
    //     QueueUrl: this._queueURL,
    //     MessageBody: JSON.stringify(msg),
    //     MessageGroupId: "1",
    //   })
    //   .promise();
  }

  async pop() {
    // const params = {
    //   QueueUrl: this._queueURL,
    //   MaxNumberOfMessages: 1,
    // };
    // const response = await this._sqs.receiveMessage(params).promise();
    // const message = response.Messages && response.Messages[0];
    // if (!message) {
    //   throw new Error("No refresh tokens available in the queue");
    // }
    // if (!message.ReceiptHandle) {
    //   throw new Error("No ReceiptHandle available in the queue");
    // }
    // await this._sqs
    //   .deleteMessage({
    //     QueueUrl: this._queueURL,
    //     ReceiptHandle: message.ReceiptHandle,
    //   })
    //   .promise();
    // return message;
  }
}
