<br />
<div align="center">
  <img src="https://static.sismo.io/readme/top-main.png" alt="Logo" width="150" height="150" style="borderRadius: 20px">

  <h3 align="center">
    Commitment Mapper
  </h3>


  <p align="center">
    Made by <a href="https://www.docs.sismo.io/" target="_blank">Sismo</a>
  </p>
  
  <p align="center">
    <a href="https://discord.gg/sismo" target="_blank">
        <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white"/>
    </a>
    <a href="https://twitter.com/sismo_eth" target="_blank">
        <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white"/>
    </a>
  </p>
  <a href="https://www.sismo.io/" target="_blank"></a>
</div>

# Commitment Mapper 

The commitment mapper is an off-chain trusted service provided by Sismo. 

It enables account owners to convert a proof of account ownership into a proof of secret knowledge. 

The account owner receives a receipt from the Commitment Mapper, which maps their account with their commitment (e.g hash of their secret). The commitment mapper ensures that only one commitment can be associated to an account.

The combination of the user's secret and the commitment mapper receipt form the Delegated Proof Of Ownership.

You will find more information in the [documentation](https://commitment-mapper.docs.sismo.io/).

# Public keys

## Hydra Delegated Proof Of Ownership

- URI: https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com
- EdDSAPubKey:
  - X: `0x0c6c16efc72c198f4549bd069f1e57f091885234b9c140286d80ef431151d644`
  - Y: `0x12c54731563d974ead25d469d2263fdf0e230d5a09f6cd40a06e60210610d642`

# Commitment mapper implementations

The commitment mapper can have multiple implementations where the signature algorithm from the commitment mapper varies. The map which stores the commitments is then namespaced for each type of implementation.

## Hydra
### Specification

The Hydra was designed for an easy verification inside a Snark Circuit. Its specifications are:

- Signature algorithm: `EdDSA` using `poseidon` hash function and the `BabyJubJub` elliptic curve.
- `CommitmentReceipt = Signature(PoseidonHash(Ethereum Address, Commitment))`

A commitment is generated based on the following specification:

- `Commitment = PoseidonHash(secret)`, where the secret is a random number choosen by the user and hashed in the browser.

The Poseidon hash algorithm makes the commitmentReceipt easy to verify inside a snark circuit (~ 5000 constraints). That means a snark circuit can easily verify that a specific secret is only known by the owner of an Ethereum Address. This secret then acts as a proof of ownership for the Ethereum Address.

### API Endpoint

Endpoint: `https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com/commit-eddsa`

Method: `POST`

Parameters:

- `ethAddress` : Ethereum Address to map with the commitment
- `ethSignature` : Signature of [this message](./src/commitment_logic/ownership.ts) by the Ethereum Address to prove the ownership
- `commitment` : The commitment choosen by the user

Response:

- `commitmentMapperPubKey` : The EdDSA public key of the commitment Mapper. This public key will never change.
- `commitmentReceipt` : The Signature(HashPoseidon(EthereumAddress, Commitment))

Example:

```bash
$ curl -X POST -H 'content-type: application/json' https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com/commit-eddsa -d @- <<EOF
{
    "ethAddress": "0x41ea85211c08227bd62b03f3efc65faaa6cbd1c3",
    "ethSignature": "0xa6c615ef9ebe12168abe3ab17cb99e0a134b9b037425637f09107bd964d1da34264b23b25edd75b15bde9819d4ac8a8395ec4ffe7401a21946680890bbbe0c1a1b",
    "commitment": "0x25a80aa8b7c619ed19da7ae54286b77fd705d2c01fcf974ab1cb3a902f8e3f89"
}
EOF

{
  "commitmentMapperPubKey": [
    "0x0c6c16efc72c198f4549bd069f1e57f091885234b9c140286d80ef431151d644",
    "0x12c54731563d974ead25d469d2263fdf0e230d5a09f6cd40a06e60210610d642"
  ],
  "commitmentReceipt": [
    "0x2b17f369369670bef2212c4e0250e8be06d0d1c8bb687b5d61b1c235e1f5fc96",
    "0x26c89da29c3c5f05eb40ddaa440bd7d2bb2d5be73211ae58c664aa0020a09914",
    "0x025b5f8dc6d4b1865c77e04954704ea26ba0e0a9dc62d8bc2f8b84ad3348ca54"
  ]
}
```

---

The commitmentReceipt fot the sismo address `0x0000000000000000000000000000000000515110` is automatically created. It serves for offchain services which want to use the ZKSMPS offchain verifier without a specific destination.  
It can be retrieve with this endpoint:

Endpoint: `https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com/sismo-address-commitment`

Method: `GET`

Response:

- `commitmentMapperPubKey` : The EdDSA public key of the commitment Mapper. This public key will never change.
- `commitmentReceipt` : The Signature(HashPoseidon(EthereumAddress, Commitment))

Example:

```bash
curl https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com/sismo-address-commitment

{
  "commitmentMapperPubKey": [
    "0x0c6c16efc72c198f4549bd069f1e57f091885234b9c140286d80ef431151d644",
    "0x12c54731563d974ead25d469d2263fdf0e230d5a09f6cd40a06e60210610d642"
  ],
  "commitmentReceipt": [
    "0x0efc00005caca3317d85bcd00b52320f9206ab7b91eccd8bcbdf7a0b4a170073",
    "0x1627540d131244ef425588a0874c7e723af4ad0203700984c89cb79575ad6847",
    "0x01ed0e48f1d9ae09b9165f281e572e0c8df00b0599fa37fb34f42a4cdc169e95"
  ]
}
```

## Deployed endpoints

- staging: https://x5y521b36b.execute-api.eu-west-1.amazonaws.com
- prod-v1: https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com

## License

Distributed under the MIT License.

## Contribute

Please, feel free to open issues, PRs or simply provide feedback!

## Contact

Prefer [Discord](https://discord.gg/sismo) or [Twitter](https://twitter.com/sismo_eth)

<br/>
<img src="https://static.sismo.io/readme/bottom-main.png" alt="bottom" width="100%" >