import { BigNumber, BigNumberish } from "ethers";
import { buildPoseidon, EddsaAccount, SNARK_FIELD } from "@sismo-core/crypto";

const pubKeyX = process.env.COMMITMENT_MAPPER_MIGRATE_PUBKEY_X;
const pubKeyY = process.env.COMMITMENT_MAPPER_MIGRATE_PUBKEY_Y;

export class MigrateOwnershipVerifier {
    private _pubKeyX: BigNumberish;
    private _pubKeyY: BigNumberish;

    constructor(params?: { pubKeyX?: BigNumberish, pubKeyY?: BigNumberish }) {
        if (params && params.pubKeyX && params.pubKeyY) {
            this._pubKeyX = params.pubKeyX;
            this._pubKeyY = params.pubKeyY;
        } else {
            this._pubKeyX = pubKeyX as BigNumberish;
            this._pubKeyY = pubKeyY as BigNumberish;
        }
    }

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
                this._pubKeyX, 
                this._pubKeyY
            ]
        );
    }
}