import { FifoQueue, FifoQueueDynamoDB } from "../fifo-queue";
import { createLocalDocumentClient } from "../utils/test-service.utils"

let fifoQueue: FifoQueue;

beforeEach(async () => {
  const table = {
    TableName: "fifo-store",
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
    }
  };
  const client = await createLocalDocumentClient(table);
  fifoQueue = new FifoQueueDynamoDB(client, table.TableName);
});

test("should be empty when nothing was added", async() => {
  expect(await fifoQueue.isEmpty()).toEqual(true);
  expect(await fifoQueue.length()).toEqual(0);
});

test("should not be empty when an element was added", async() => {
  const element = 1;
  await fifoQueue.add(element);
  expect(await fifoQueue.isEmpty()).toEqual(false);
  expect(await fifoQueue.length()).toEqual(1);
});

test("should be able to pop elements in a FIFO order", async() => {
  await fifoQueue.add(1);
  await fifoQueue.add(2);
  expect(await fifoQueue.pop()).toEqual(1);
  expect(await fifoQueue.pop()).toEqual(2);
});

test("should be empty after popping the last element", async() => {
  const element = 1;
  await fifoQueue.add(element);
  await fifoQueue.pop();
  expect(await fifoQueue.isEmpty()).toEqual(true);
  expect(await fifoQueue.length()).toEqual(0);
});

test("should throw when popping an empty queue", async() => {
  expect(await fifoQueue.length()).toEqual(0);
  await expect(fifoQueue.pop()).rejects.toThrowError("No msg available in the queue");
});