export * from "./fifo-queue";
export * from "./fifo-queue-dynamodb";
export * from "./fifo-queue-local";
import { FifoQueueDynamodb } from "./fifo-queue-dynamodb";
import { LocalFifoQueue } from "./fifo-queue-local";

let offlineLocalFifoQueueSingleton: any = null;

const getDynamoDBFifoQueueInstance = () => {
  const env = process.env;
  if (!env.FIFO_QUEUE_REGION || !env.FIFO_QUEUE_TABLE_NAME) {
    throw "FIFO_QUEUE_REGION and FIFO_QUEUE_TABLE_NAME env vars must be set";
  }
  return new FifoQueueDynamodb(
    env.FIFO_QUEUE_TABLE_NAME,
    env.FIFO_QUEUE_REGION
  );
};

export const fifoQueueFactory = () => {
  if (process.env.IS_OFFLINE === "true") {
    if (!offlineLocalFifoQueueSingleton) {
      offlineLocalFifoQueueSingleton = new LocalFifoQueue();
    }
    return offlineLocalFifoQueueSingleton;
  }

  return getDynamoDBFifoQueueInstance();
};
