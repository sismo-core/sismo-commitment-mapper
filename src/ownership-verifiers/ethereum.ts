import { utils } from "ethers";
import { getOwnershipMsg } from "../utils/get-ownership-msg";

export class EthereumOwnershipVerifier {
  async verify({
    ethAddress,
    ethSignature,
  }: {
    ethAddress: string;
    ethSignature: string;
  }): Promise<string> {
    // Verify inputs
    if (!ethAddress || !ethSignature) {
      throw new Error(
        "ethAddress and ethSignature and commitment should always be defined!"
      );
    }

    // verify the ownership of the ethereum account
    const ethAddressLowerCase = ethAddress.toLowerCase();

    // Verify the Eth account is well possessed by the caller of this function
    // by verifing the signature corresponds to the address.
    const recoveredAddress = utils.verifyMessage(
      getOwnershipMsg(ethAddressLowerCase),
      ethSignature
    );
    if (!recoveredAddress) {
      throw new Error("Signature not valid!");
    }
    if (ethAddressLowerCase.toLowerCase() != recoveredAddress.toLowerCase()) {
      throw new Error(
        `Address ${ethAddressLowerCase} does not corresponds to signature!`
      );
    }

    return ethAddressLowerCase;
  }
}
