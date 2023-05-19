import { DynamoDB } from "aws-sdk";
import { Msg, FifoQueue } from "./fifo-queue";

export class FifoQueueDynamoDB implements FifoQueue {
  private documentClient: DynamoDB.DocumentClient;
  private tableName: string;

  constructor(documentClient: DynamoDB.DocumentClient, tableName: string) {
    this.documentClient = documentClient;
    this.tableName = tableName;
  }

  async add(msg: Msg): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        pk: "FIFO_QUEUE",
        timestamp: new Date().getTime(),
        msg: msg,
      },
    };

    try {
      await this.documentClient.put(params).promise();
      console.log("add msg", msg);
    } catch (err) {
      console.error("Unable to add message: ", err);
    }
  }

  async isEmpty(): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "FIFO_QUEUE" },
      Limit: 1,
    };
    const data = await this.documentClient.query(params).promise();
    return !(data.Items && data.Items.length > 0);
  }

  async length(): Promise<number> {
    const params = {
      TableName: this.tableName,
      Select: "COUNT",
    };
    const data = await this.documentClient.scan(params).promise();
    const length = data.Count || 0;
    console.log("Queue length: ", length);
    return length;
  }

  async pop(): Promise<Msg> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "FIFO_QUEUE" },
      Limit: 1,
      ScanIndexForward: true,
    };

    try {
      const data = await this.documentClient.query(params).promise();
      if (data.Items && data.Items.length > 0) {
        const msg = data.Items[0].msg;
        console.log("get msg", msg);

        const deleteParams = {
          TableName: this.tableName,
          Key: { pk: "FIFO_QUEUE", timestamp: data.Items[0].timestamp },
        };
        await this.documentClient.delete(deleteParams).promise();

        return msg;
      } else {
        throw new Error("No msg available in the queue");
      }
    } catch (err) {
      console.error("Unable to get message: ", err);
      throw err;
    }
  }
}