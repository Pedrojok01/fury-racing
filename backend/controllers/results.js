const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const { calculateTotalRaceTime } = require("../utils/calculateTotalRaceTime");
const tracks = require("../data/tracks");

/**
 * @description Handles the race results calculation based on input attributes.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Sends the combined result or an error response.
 */
const results = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed. Please check and try again", 422));
  }

  const { attributes } = req.params;
  const circuitIndex = parseInt(attributes.slice(0, 2)) + 1; // Index starts from 0 in the Contracts
  const weather = parseInt(attributes.slice(2, 4));
  const player1Attributes = parseAttributes(attributes.slice(4, 20));
  const player2Attributes = parseAttributes(attributes.slice(20));

  const trackData = getTrackData(circuitIndex);
  if (!trackData) {
    return next(new HttpError("Invalid circuit index provided", 422));
  }

  try {
    const player1Result = Math.round(calculateTotalRaceTime(player1Attributes, trackData, weather));
    const player2Result = Math.round(calculateTotalRaceTime(player2Attributes, trackData, weather));

    console.log("Player 1 Total Race Time:", player1Result);
    console.log("Player 2 Total Race Time:", player2Result);

    const combinedResult = combineToUint256(player1Result, player2Result);

    res.status(200).json({ combinedResult: combinedResult.toString() });
  } catch (err) {
    console.error("Error processing player attributes:", err);
    return next(new HttpError("Processing players attributes failed, please try again.", 500));
  }
};

/**
 * @description Parses the player attributes from a string to an object.
 * @param {string} attributes - The string of attributes.
 * @returns {Object} - The parsed attributes as an object.
 */
function parseAttributes(attributes) {
  return {
    reliability: parseInt(attributes.slice(0, 2)),
    maniability: parseInt(attributes.slice(2, 4)),
    speed: parseInt(attributes.slice(4, 6)),
    brakes: parseInt(attributes.slice(6, 8)),
    car_balance: parseInt(attributes.slice(8, 10)),
    aerodynamics: parseInt(attributes.slice(10, 12)),
    driver_skills: parseInt(attributes.slice(12, 14)),
    luck: parseInt(attributes.slice(14, 16)),
  };
}

/**
 * @description Retrieves the track data based on the circuit index.
 * @param {number} circuitIndex - The index of the circuit.
 * @returns {Object} - The track data object.
 */
function getTrackData(circuitIndex) {
  return tracks.find((track) => track.index === circuitIndex);
}

/**
 * @description Combines the race results of two players into a single uint256 value.
 * @param {number} player1Result - The total race time for player 1.
 * @param {number} player2Result - The total race time for player 2.
 * @returns {BigInt} - The combined result as a uint256 value.
 */
function combineToUint256(player1Result, player2Result) {
  const player1BigInt = BigInt(player1Result);
  const player2BigInt = BigInt(player2Result);

  const combinedResult = (player1BigInt << 128n) | player2BigInt;
  return combinedResult;
}

module.exports = { results };
