import { BigNumber, BigNumberish } from "ethers";
import { buildPoseidon, EddsaAccount, SNARK_FIELD } from "@sismo-core/crypto";

export class MigrateOwnershipVerifier {
    async verify({ receipt, identifier, commitment }: { receipt: [BigNumberish, BigNumberish, BigNumberish], identifier: string, commitment: string }): Promise<boolean> {
        if (!receipt || !identifier || !commitment) {
            throw new Error("receipt, identifier and commitment should always be defined!");
        }

        const identifierBigNumber = BigNumber.from(identifier.toLowerCase()).mod(
            SNARK_FIELD
        );
        const poseidon = await buildPoseidon();
        const msg = poseidon([identifierBigNumber, commitment]);

        return await EddsaAccount.verify(
            msg,
            receipt,
            [
                process.env.COMMITMENT_MAPPER_MIGRATE_PUBKEY_X as BigNumberish, 
                process.env.COMMITMENT_MAPPER_MIGRATE_PUBKEY_Y as BigNumberish
            ]
        );
    }
}