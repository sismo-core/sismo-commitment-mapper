export const getOwnershipMsg = (ethAddress: string) =>
  `Sign this message to generate an offchain commitment.
It is used to perform necessary cryptographic computations when generating Sismo Attestations.

Wallet address:
${ethAddress.toLowerCase()}

IMPORTANT: Only sign this message if you are on Sismo application.
`;
