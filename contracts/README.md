<div align="center">

<h1><strong> Fury Racing | Contracts </strong></h1>
<br/>
<img src="../frontend/public/img/Fury_Racing_logo_HD.png" width="200" alt="Fury Racing logo" />
<br>

</div>
</br>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description:](#description)
- [Chainlink:](#chainlink)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Quickstart](#quickstart)
  - [Chainlink VRF and Functions Subscriptions](#chainlink-vrf-and-functions-subscriptions)
  - [Deployment](#deployment)
  - [Chainlink Automation](#chainlink-automation)

## Description:

The Racing contract is currently deployed and verified on **Avalanche Fuji** at the following address:

[0x143989DeA4CdB29b452b241eF3134d2554E583Bc](https://testnet.snowscan.xyz/address/0x143989DeA4CdB29b452b241eF3134d2554E583Bc)

The smart contracts for Fury Racing have been implemented in Solidity with the help of the [Foundry](https://book.getfoundry.sh/) framework. All the critical features are executed on-chain and handled directly in the contracts. They have been designed with the following goals in mind:

- Reduce the use of arrays and loops as much as possible to be sustainable in the long run;
- Require a single transaction per game (registration included) to keep the UI/UX smooth and user-friendly;
- Gas efficiency and security ([Slither](https://github.com/crytic/slither)/[Aderyn](https://github.com/Cyfrin/aderyn));

## Chainlink:

Chainlink features are leveraged in two ways:

1. [**Chainlink VRF V2.5**](https://docs.chain.link/vrf): to generate random numbers for the luck attributes;
2. [**Chainlink Functions**](https://docs.chain.link/chainlink-functions): to query the backend for race results (the time per player based on their car attributes) as well as for weather conditions converted to a percentage;
3. [**Chainlink Automation**](https://automation.chain.link/fuji): to automate the updates of each circuit's weather in the smart contract every hour.

Thanks to Chainlink, the entire logic can stay on-chain and transparent, while the heavy calculations are done off-chain. This allows for more transparency and a more secure, gas-efficient contract. Automation also eliminates the need for a third party to update the weather conditions, removing the requirement to store a private key at the same time.

## Getting Started

### Requirements

Make sure to have the following installed on your machine:

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

Thanks to the make file, all actions are easily accessible:

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

- To get the test coverage:

```bash
make coverage
```

- To format the solidity code:

```bash
make format
```

### Chainlink VRF and Functions Subscriptions

Before deploying the contracts, you will need to create your subscriptions to get your subscription IDs. Just follow the instructions for each service:

- Chainlink VRF: https://vrf.chain.link/
- Chainlink Functions: https://functions.chain.link/

Add your contract as a consumer, then fund the subscription with some LINK tokens. You can get some testnet LINK tokens from the Chainlink Faucet: https://faucets.chain.link/

Finally, once you're done setting up the subscriptions, you can update the contract with the new subscription IDs:

### Deployment

When you are ready to deploy the contracts, first ensure that you have updated the values in the `scripts/deployerTestnet.sol` file to match your Chainlink VRF and Functions Subscriptions.

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

### Chainlink Automation

Chainlink Automation setup is a bit different since you must have your contract address to set the function that you want to call. Once you have the contract address, you can follow the instructions there:

- Chainlink Automation: https://automation.chain.link/

Once that's done, don't forget to set the `forwarder` address to your `Upkeep address` in your contract to make sure that only the Chainlink Automation can update the weather conditions.

And... that's it! You are ready to start racing!

<br></br>

<div align="center">
<h2>🎉 Thank you Chainlink for this amazing hackathon! 🎉</h2>
<h3>⭐️ ... and don't forget to leave a star if you like it! ⭐️</h3>
</div>

<br>

<p align="right">(<a href="#top">back to top</a>)</p>
