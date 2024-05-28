<div align="center">

<h1><strong> Fury Racing </strong></h1><br/>
<img src="../frontend/public/img/Fury_Racing_logo_HD.png" width="200" alt="Fury Racing logo" />
<br/>

</div>

## Table of Contents

- [Usage](#usage)
  - [Coverage](#coverage)

## Description:

The Racing contract is currently deployed abd verified on Avalanche Fuji at the following address:

[0x5a46363a08146fb5d93C687afb4C69D2EeB33412](https://testnet.snowscan.xyz/address/0x5a46363a08146fb5d93C687afb4C69D2EeB33412)

The smart contracts for Fury Racing have been implemented in Solidity and the Foundry framework. All the critical features are on-chain and handled directly in the contracts. They have been designed with the following in mind:

- Reduce the use of arrays and loops as much as possible;
- Require as little transactions as possible, to keep the UI/UX smooth and user-friendly;
- Gas efficiency and security ([Slither](https://github.com/crytic/slither)/[Aderyn](https://github.com/Cyfrin/aderyn));

## Chainlink:

Chainlink features are leveraged in two ways:

1. [**Chainlink VRF V2.5**](https://docs.chain.link/vrf): to generate random numbers for the luck attributes;
2. [**Chainlink Functions**](https://docs.chain.link/chainlink-functions): to query the backend for the race results (the time per player based on their car attributes).

## Getting Started

### Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [foundry](https://getfoundry.sh/)
  - You'll know you did it right if you can run `forge --version` and you see a response like `forge 0.2.0 (816e00b 2023-03-16T00:05:26.396218Z)`
  <!-- Additional requirements here -->

### Installation

Start by cloning the repository and navigating to the project directory:

```bash
git clone https://github.com/Pedrojok01/fury-racing.git
cd contracts
```

Then install the dependencies:

```bash
make install
```

You should now have `chainlink`, `openzeppelin-contracts`, and `forge-std` installed in your `lib` folder.

### Quickstart

Thanks to the make file, all actions are easily accessible.

- To compile the contracts, run:

```bash
make build
```

- To run the tests, run:

```bash
make test
```

You can even run `slither` and `aderyn` if they are installed on your machine:

```bash
make slither
make aderyn
```

- To get the coverage:

```bash
make coverage
```

- To format the solidity code:

```bash
make format
```

## Deployment

When you are ready to deploy the contracts, first ensure that you have updated the values in the `scripts/deployerTestnet.js` file to match your Chainlink VRF and Functions Subscriptions.

Then, go to https://catapulta.sh/ to get your API key. This is a super cool service to deploy and verify your contracts on multiple networks.

Update the environment variables in the `.env` file with the required value:

```js
PRIVATE_KEY=

AVALANCHE_RPC_URL=
AVALANCHE_FUJI_RPC_URL=

CATAPULTA_API_KEY=
CATAPULTA_SENDER=
```

Then run:

```bash
make CatapulTest
```

You should see your contracts address in the console, and a link to the explorer with your contracts verified!

<br></br>

<div align="center">
<h2>🎉 Thank you Chainlink for this amazing hackathon! 🎉</h2>
</div>

<br>

<p align="right">(<a href="#top">back to top</a>)</p>
