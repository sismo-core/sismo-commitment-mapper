import LocalCommitmentStore from "./commitment-store-local";

export * from "./commitment-mapper";
export * from "./commitment-mapper-eddsa";
export * from "./commitment-store";
export * from "./commitment-store-local";
export * from "./get-ownership-msg";
export * from "./secret-manager";
export * from "./secret-manager-local";


export const getCommitmentStore = (): LocalCommitmentStore => {
    return new LocalCommitmentStore();
};