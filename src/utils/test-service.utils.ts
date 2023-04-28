import { DynamoDB } from "aws-sdk";

const localDynamoDBOptions = {
  endpoint: "http://localhost:9000",
  region: "eu-west-1",
  accessKeyId: "local",
  secretAccessKey: "local",
};

export const createLocalDocumentClient = async(
  table: DynamoDB.Types.CreateTableInput
): Promise<DynamoDB.DocumentClient> => {
  const db = new DynamoDB(localDynamoDBOptions);
  try {
    await db.deleteTable({ TableName: table.TableName }).promise();
  } finally {
    await db.createTable(table).promise();
  }
  return new DynamoDB.DocumentClient(localDynamoDBOptions);
};