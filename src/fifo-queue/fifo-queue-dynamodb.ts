import { DynamoDB } from "aws-sdk";
import { Msg, FifoQueue } from "./fifo-queue";

const dynamoDBConfig = {
  endpoint: 'http://localhost:9000',
  region: 'eu-west-1', 
  accessKeyId: 'test', 
  secretAccessKey: 'test',
};

export class FifoQueueDynamodb implements FifoQueue {
  private db: DynamoDB.DocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string) {
    this.db = new DynamoDB.DocumentClient(dynamoDBConfig);
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
      await this.db.put(params).promise();
      console.log("add msg", msg);
    } catch (err) {
      console.error("Unable to add message: ", err);
    }
  }

  async isEmpty(): Promise<boolean> {
    return await this.length() == 0;
  }

  async length(): Promise<number> {
    const params = {
      TableName: this.tableName,
      Select: "COUNT",
    };
    const res = await this.db.query(params).promise();
    const length = res.Count || 0;
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
      const data = await this.db.query(params).promise();
      if (data.Items && data.Items.length > 0) {
        const msg = data.Items[0].msg;
        console.log("get msg", msg);

        const deleteParams = {
          TableName: this.tableName,
          Key: { pk: "FIFO_QUEUE", timestamp: data.Items[0].timestamp },
        };
        await this.db.delete(deleteParams).promise();

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