import { DynamoDB } from "aws-sdk";
import { 
  FifoQueue, 
  FifoQueueDynamodb,
} from "../fifo-queue";

let fifoQueue: FifoQueue;

beforeEach(async () => {
  fifoQueue = new FifoQueueDynamodb("fifo-table", "eu-region");
});

test("it should blaba", async() => {
  expect(await fifoQueue.isEmpty()).toEqual(true);
});