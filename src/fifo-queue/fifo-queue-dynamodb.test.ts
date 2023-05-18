import { DynamoDB } from "aws-sdk";
import { FifoQueue, FifoQueueDynamodb } from "../fifo-queue";

let fifoQueue: FifoQueue;

beforeEach(async () => {
  fifoQueue = new FifoQueueDynamodb("fifo-table", "eu-west-1");
  const db = new DynamoDB({
    endpoint: "http://localhost:9000",
    region: "eu-west-1",
    accessKeyId: "test",
    secretAccessKey: "test",
  });
  await db.deleteTable({ TableName: "fifo-table" }).promise();
  await db
    .createTable({
      TableName: "fifo-table",
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "timestamp", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "timestamp", AttributeType: "N" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    })
    .promise();
});

test("it should add in the queue", async () => {
  await fifoQueue.add({ test: "test" });
  expect(await fifoQueue.pop()).toEqual({
    test: "test",
  });
});
