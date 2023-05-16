export * from "./fifo-queue";
export * from "./fifo-queue-dynamodb";
export * from "./fifo-queue-local";
import { FifoQueueDynamodb } from "./fifo-queue-dynamodb";
import { LocalFifoQueue } from "./fifo-queue-local";

let offlineLocalFifoQueueSingleton: any = null;

const getDynamoDBFifoQueueInstance = () => {
  // const env = process.env;
  // if (!env.CACHE_STORE_REGION || !env.CACHE_STORE_TABLE_NAME) {
  //   throw "CACHE_STORE_REGION and CACHE_STORE_TABLE_NAME env vars must be set";
  // }
  return new FifoQueueDynamodb();
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
