const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const config = require("../config");
const { ethers } = require("ethers");

const submit = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Inavlid input passed. Please check and try again", 422));
  }

  const { attributes } = req.params;
  const circuit = attributes.slice(0, 2);
  const weather = attributes.slice(2, 4);
  const player1Attributes = attributes.slice(4, 20);
  const player2Attributes = attributes.slice(20);

  console.log(circuit);
  console.log(weather);
  console.log(player1Attributes);
  console.log(player2Attributes);

  let player1Result, player2Result;
  try {
    player1Result = Math.floor(Math.random() * 96) + 5;
    player2Result = Math.floor(Math.random() * 96) + 5;
  } catch (err) {
    const error = new HttpError("Processing players attributes failed, please try again.", 500);
    return next(error);
  }

  const combinedResult = combineToUint256(player1Result, player2Result);
  console.log(`Combined Result (uint256): ${combinedResult}`);

  res.status(200).json({ combinedResult: combinedResult.toString() });
};

// Function to combine two uint128 values into a single uint256
function combineToUint256(player1Result, player2Result) {
  const player1BigInt = BigInt(player1Result);
  const player2BigInt = BigInt(player2Result);

  // Shift player1Result left by 128 bits and add player2Result
  const combinedResult = (player1BigInt << 128n) | player2BigInt;

  return combinedResult;
}

const getScores = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.INFURA_FUJI_NODE);
    const contractAddress = config.CONTRACT_ADDRESS;
    const contractABI = config.RACING_ABI;

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const [week, players] = await contract.getWeekAndPlayerAmount();
    console.log(`week: ${week}, players: ${players}`);

    const theWeek = week.toNumber();
    const totalPlayers = players.toNumber();

    if (totalPlayers === 0) {
      return { players: [], scores: [] };
    } else if (totalPlayers === 1) {
      const playerAddress = await contract.getPlayerAddressForWeeklyTournament(
        week,
        ethers.BigNumber.from(totalPlayers)
      );

      const [attrbutes, theAddress, elo] = await contract.addressToPlayer(playerAddress);

      console.log(playerAddress);
      console.log(attrbutes.toString());
      console.log(theAddress.toString());
      console.log(elo);

      return { players: [playerAddress], scores: [elo.toString()] };
    } else {
      // get player addresses
      let calls = [];
      for (let i = 0; i < totalPlayers; i++) {
        console.log(theWeek, i + 1);
        calls[i] = contract.getPlayerAddressForWeeklyTournament(week, ethers.BigNumber.from(i + 1));
      }

      const playerAddresses = await Promise.all(calls);
      console.log(playerAddresses);

      // retunr all players' scores
      calls = [];
      for (let i = 0; i < totalPlayers; i++) {
        calls[i] = contract.addressToPlayer(playerAddresses[i]);
      }

      let results = await Promise.all(calls);
      // results = Object.values(results)
      // console.log((results[0])[0]);
      dashboard(results);
    }
  } catch (error) {
    console.error("Error calling getWeekAndPlayerAmount:", error);
  }
};

module.exports = { submit, getScores };

const dashboard = (results) => {
  console.log();
  const playersScores = [];

  results.map((x, i) => {
    const toArray = Object.entries(x);

    const addressArr = toArray[4];
    const scoreArr = toArray[5];
    playersScores[i] = { address: addressArr[1], score: scoreArr[1] };
  });

  // Sort the data in descending order based on the 'score' property
  playersScores.sort((a, b) => b.score - a.score);

  console.log(playersScores);
};
