const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const config = require('../config');
const { Contract, Provider } = require('ethers-multicall');

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

const getScores = () => {
  const provider = new ethers.providers.JsonRpcProvider(
    config.AVALANCHE_NODE
  );
  const contractAddress = config.CONTRACT_ADDRESS;
  const contractABI = config.ABI;

  const contract = new Contract(contractAddress, contractABI);

  const call1 = contract.function1();
  const call2 = contract.function2();
  const call3 = contract.function3();
}

module.exports = { submit };