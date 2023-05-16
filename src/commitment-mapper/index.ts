import CommitmentMapperEddsa, {
  CommitmentStoreNamespace,
} from "./commitment-mapper-eddsa";
import { CommitmentStoreType, getCommitmentStore } from "../commitment-store";
import { getSecretHandler } from "../secret-manager";

export * from "./commitment-mapper-eddsa";

export const commitmentMapperFactory = () => {
  const commitmentStore = getCommitmentStore(
    CommitmentStoreNamespace.HashCommitment,
    CommitmentStoreType.DynamoDBCommitmentStore
  );
  const commitmentMapper = new CommitmentMapperEddsa(
    commitmentStore,
    getSecretHandler()
  );
  return commitmentMapper;
};
