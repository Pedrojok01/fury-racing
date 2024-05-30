<div align="center">

<h1><strong> Fury Racing </strong></h1><br/>
<img src="../frontend/public/img/Fury_Racing_logo_HD.png" width="200" alt="Fury Racing logo" />
<br/>

</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description:](#description)
- [Car Attributes, Track Data, and Time Calculation:](#car-attributes-track-data-and-time-calculation)
  - [Car Attributes:](#car-attributes)
  - [Track Data:](#track-data)
  - [Calculating the Time:](#calculating-the-time)
  - [Example:](#example)
- [About:](#about)
- [Getting Started](#getting-started)

## Description:

The backend part of Fury Racing is quite small, so it has been implemented using AWS Lambda functions and CloudWatch BridgeEvents. The backend is responsible for the following tasks:

- **Leaderboard**: as the leaderboard requires reading a lot of data from the blockchain, as well as sorting those data, it was both simpler and more efficient to implement it as a backend function, leveraging multicall to reduce the number of requests to the node provider.
- **Race Results**: The time generated for each player based on their selected attributes is also handled in the Lambda function. This endpoint is directly queried by the smart contracts when needed via Chainlink Functions.
- **Weather**: The weather is also handled by the backend. The weather for each track is stored on-chain in the smart contracts. A cron job allows to update the data every hour so the weather is almost in real-time.

## Car Attributes, Track Data, and Time Calculation:

Each attribute has 3 positive and 3 negative factors that affect the time calculation. The description can be found below:

### Car Attributes:

1. **Speed**:

   - **Positive Factors**:
     - **Aerodynamics**: Good aerodynamics reduce drag and enhance speed.
     - **Driver Skills**: Skilled drivers can make better use of high speed.
     - **Reliability**: Reliable cars can sustain high speeds over longer distances.
   - **Negative Factors**:
     - **Brakes**: Poor brakes can reduce the effectiveness of high speed, especially in technical sections.
     - **Weather**: Poor weather conditions can reduce the effectiveness of high speed.
     - **Car Balance**: Poor car balance can reduce the effectiveness of high speed.

2. **Brakes**:

   - **Positive Factors**:
     - **Driver Skills**: Skilled drivers can make better use of brakes, reducing stopping distance.
     - **Car Balance**: Good car balance helps in effective braking.
     - **Reliability**: Reliable brakes perform consistently under different conditions.
   - **Negative Factors**:
     - **Speed**: High speed requires better brakes; poor brakes reduce high-speed effectiveness.
     - **Weather**: Poor weather conditions can reduce braking effectiveness.
     - **Aerodynamics**: Poor aerodynamics can affect braking stability.

3. **Aerodynamics**:

   - **Positive Factors**:
     - **Speed**: Higher speed benefits from good aerodynamics by reducing drag.
     - **Downforce Level**: Higher downforce levels enhance aerodynamic effectiveness.
     - **Car Balance**: Good car balance enhances aerodynamic stability.
   - **Negative Factors**:
     - **Maniability**: Poor maniability reduces the benefits of good aerodynamics in technical sections.
     - **Weather**: Poor weather conditions can reduce aerodynamic effectiveness.
     - **Brakes**: Poor brakes can affect the aerodynamic performance.

4. **Maniability**:

   - **Positive Factors**:
     - **Car Balance**: Good car balance enhances maniability.
     - **Driver Skills**: Skilled drivers can make better use of maniability.
     - **Aerodynamics**: Good aerodynamics can improve handling.
   - **Negative Factors**:
     - **Speed**: Excessive speed can reduce the effectiveness of maniability in technical sections.
     - **Weather**: Poor weather conditions can reduce maniability effectiveness.
     - **Reliability**: Poor reliability can affect handling performance.

5. **Reliability**:

   - **Positive Factors**:
     - **Lap Length**: Longer tracks require higher reliability to maintain performance.
     - **Driver Skills**: Skilled drivers can make better use of the car's reliability.
     - **Brakes**: Reliable brakes perform consistently under different conditions.
   - **Negative Factors**:
     - **Speed**: High speed can strain reliability, especially over longer distances.
     - **Weather**: Poor weather conditions can strain reliability.
     - **Maniability**: Poor maniability can affect reliability over long distances.

6. **Driver Skills**:

   - **Positive Factors**:
     - **Speed**: Skilled drivers can make better use of high speed.
     - **Maniability**: Skilled drivers can make better use of maniability.
     - **Brakes**: Skilled drivers can make better use of brakes.
   - **Negative Factors**:
     - **Weather**: Poor weather conditions can challenge even skilled drivers.
     - **Random Variability**: Even skilled drivers have some degree of variability in performance.
     - **Reliability**: Poor reliability can affect a driver's performance.

7. **Car Balance**:

   - **Positive Factors**:
     - **Maniability**: Good car balance enhances maniability.
     - **Brakes**: Good car balance helps in effective braking.
     - **Aerodynamics**: Good car balance enhances aerodynamic stability.
   - **Negative Factors**:
     - **Speed**: Excessive speed can reduce the effectiveness of car balance.
     - **Weather**: Poor weather conditions can affect car balance.
     - **Driver Skills**: Poor driver skills can negate the benefits of good car balance.

8. **Weather**:
   - **Positive Factors**:
     - **Aerodynamics**: Good aerodynamics can partially mitigate the impact of poor weather.
     - **Driver Skills**: Skilled drivers can partially mitigate the impact of poor weather.
     - **Car Balance**: Good car balance can help manage poor weather conditions.
   - **Negative Factors**:
     - **Speed**: Poor weather conditions reduce the effectiveness of high speed.
     - **Maniability**: Poor weather conditions reduce maniability effectiveness.
     - **Brakes**: Poor weather conditions reduce braking effectiveness.

### Track Data:

In addition to car attributes, the track data and weather conditions significantly impact the lap times. Each track has specific characteristics, such as:

- Best Lap Time: The benchmark lap time for the track.
- Full Throttle: The percentage of the track that can be driven at full throttle.
- Longest Flat Out: The longest distance on the track that can be driven without braking.
- Max Speed: The maximum speed achievable on the track.
- Downforce Level: The required downforce level for optimal performance.
- Gear Changes Per Lap: The number of gear changes required per lap.
- Technical Factor: A measure of how technically challenging the track is.
- Lap Length: The length of the track.

### Calculating the Time:

1. Lap Time Calculation: For each lap, the car's attributes, track data, and weather conditions are used to calculate the lap time. The calculation considers the positive and negative factors for each attribute.

2. Total Race Time: The total race time is calculated by summing the lap times for 10 laps.

3. Random Variability: A random variability factor based on driver skills is applied to each lap time to simulate realistic race conditions.

### Example:

| Attributes Sets | Average Lap Time (ms) |
| --------------- | --------------------- |
| Set 1           | 91488.25              |
| Set 2           | 91432.10              |
| Set 3           | 92029.33              |
| Set 4           | 91802.90              |
| Set 5           | 92472.82              |

## About:

The main technologies used in the backend are:

- **Node.js**: to write the functions
- **Express.js**: to handle the API requests
- **Viem**: to communicate with the smart contracts
- **AWS Lambda**: to deploy the functions
- **Serverless Framework**: to deploy the functions
- **CloudWatch BridgeEvents**: to schedule the cron jobs and update the weather every hour

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

You can run the tests to see some simulation examples based on different car attribute sets and weather conditions with the following command:

```bash
node test/test.js
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
