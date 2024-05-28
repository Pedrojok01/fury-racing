<div align="center">

<h1><strong> Fury Racing </strong></h1><br/>
<img src="../frontend/public/img/Fury_Racing_logo_HD.png" width="200" alt="Fury Racing logo" />
<br/>

</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description:](#description)
- [About:](#about)
- [Getting Started](#getting-started)

## Description:

The backend part of Fury Racing is quite small, so it has been implemented using AWS Lambda functions and CloudWatch BridgeEvents. The backend is responsible for the following tasks:

- **Leaderboard**: as the leaderboard requires reading a lot of data from the blockchain, as well as sorting those data, it was both simpler and more efficient to implement it as a backend function, leveraging multicall to reduce the number of requests to the node provider.
- **Race Results**: The time generated for each player based on their selected attributes is also handled in the Lambda function. This endpoint is directly queried by the smart contracts when needed via Chainlink Functions.
- **Weather**: The weather is also handled by the backend. The weather for each track is stored on-chain in the smart contracts. A cron job allows to update the data every hour so the weather is almost in real-time.

## About:

The main technologies used in the backend are:

- **Node.js**: to write the functions
- **Express.js**: to handle the API requests
- **Viem**: to communicate with the smart contracts
- **AWS Lambda**: to deploy the functions
- **Serverless Framework**: to deploy the functions
- **CloudWatch BridgeEvents**: to schedule the cron jobs

## Getting Started

To get started with the backend, you need to install the dependencies:

```bash
bun install
# or
pnpm install
# or
yarn install
# or
npm install
```

Then you can deploy the function to AWS by running the following command:

```bash
serverless deploy
```

Note: you need to have the AWS CLI installed and configured on your machine.

Once deployed, don't forget to add the environment variables to the Lambda function. You can find the list of environment variables in the `.env.example` file.

<br></br>

<br></br>

<div align="center">
<h2>🎉 Thank you Chainlink for this amazing hackathon! 🎉</h2>
<h3>⭐️ ... and don't forget to leave a star if you like it! ⭐️</h3>
</div>

<br>

<p align="right">(<a href="#top">back to top</a>)</p>
