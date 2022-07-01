<br />
<div align="center">
  <img src="https://static.sismo.io/readme/top-secondary.png" alt="Logo" width="150" height="150" style="borderRadius: 20px">

  <h3 align="center">
    Commitment Mapper tester
  </h3>

  <p align="center">
    Made by <a href="https://www.sismo.io/" target="_blank">Sismo</a>
  </p>
  
  <p align="center">
    <a href="https://discord.gg/sismo" target="_blank">
        <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white"/>
    </a>
    <a href="https://twitter.com/sismo_eth" target="_blank">
        <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white"/>
    </a>
  </p>
</div>

## Installation

``` 
yarn add @sismo-core/commitment-mapper-tester-js
``` 

## Usage

``` javascript
import { CommitmentMapperTester, OWNERSHIP_SIGNATURE_MESSAGE, buildPoseidon } from "@sismo-core/commitment-mapper-tester-js"; 

const commitmentMapperTester = await CommitmentMapperTester.generate();
const poseidon = await buildPoseidon();

const address = ; //ETHAddress
const signature = ; //ETHSig(OWNERSHIP_SIGNATURE_MESSAGE)
const secret = BigNumber.from(1);
const commitment = poseidon([secret]);

const commitmentReceipt = await commitmentMapperTester.commit(
    address,
    signature,
    commitment
);
``` 

## License

Distributed under the MIT License.

## Contribute

Please, feel free to open issues, PRs or simply provide feedback!

## Contact

Prefer [Discord](https://discord.gg/sismo) or [Twitter](https://twitter.com/sismo_eth)

<br/>
<img src="https://static.sismo.io/readme/bottom-secondary.png" alt="bottom" width="100%" >