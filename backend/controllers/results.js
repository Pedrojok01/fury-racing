const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
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
 * @description Calculates the total race time for a player over 10 laps.
 * @param {Object} attributes - The player's car attributes.
 * @param {Object} trackData - The data of the track.
 * @param {number} weatherScore - The weather score.
 * @returns {number} - The total race time in milliseconds.
 */
function calculateTotalRaceTime(attributes, trackData, weatherScore) {
  let totalRaceTime = 0;
  for (let lap = 0; lap < 10; lap++) {
    totalRaceTime += calculateLapTime(attributes, trackData, weatherScore);
  }
  return totalRaceTime;
}

/**
 * @description Calculates the lap time for a player based on attributes, track data, and weather score.
 * @param {Object} attributes - The player's car attributes.
 * @param {Object} trackData - The data of the track.
 * @param {number} weatherScore - The weather score.
 * @returns {number} - The lap time in milliseconds.
 */
function calculateLapTime(attributes, trackData, weatherScore) {
  const baseLapTime = trackData.bestLapTime; // Use best lap time from track data

  // Impacts of various factors, ensuring no negative impacts
  const speedImpact = Math.max(
    0,
    (50 - attributes.speed) *
      (0.15 + trackData.fullThrottle * 0.03) *
      (1 - (attributes.brakes + attributes.aerodynamics + attributes.car_balance) / 300) *
      (weatherScore / 100) *
      (1 - trackData.maxSpeed / 100) *
      (1 - trackData.gearChangesPerLap / 100)
  );

  const maniabilityImpact = Math.max(
    0,
    (50 - attributes.maniability) *
      trackData.technicalFactor *
      0.3 *
      (1 - attributes.car_balance / 100) *
      (weatherScore / 100) *
      (1 - trackData.downforceLevel / 100) *
      (1 - trackData.gearChangesPerLap / 100)
  );

  const reliabilityImpact = Math.max(
    0,
    (50 - attributes.reliability) *
      (0.15 + trackData.lapLength * 0.01) *
      (1 - trackData.fullThrottle / 100) *
      (1 - trackData.gearChangesPerLap / 100)
  );

  const aerodynamicsImpact = Math.max(
    0,
    (50 - attributes.aerodynamics) *
      (0.15 + trackData.downforceLevel * 0.05) *
      (weatherScore / 100) *
      (1 - trackData.fullThrottle / 100) *
      (1 - trackData.longestFlatOut / 100)
  );

  const driverSkillsImpact = Math.max(
    0,
    (50 - attributes.driver_skills) * 0.2 * (1 - trackData.gearChangesPerLap / 100)
  );

  const brakesImpact = Math.max(
    0,
    (50 - attributes.brakes) *
      (0.15 + trackData.longestFlatOut * 0.01) *
      (1 - attributes.speed / 100) *
      (1 - trackData.lapLength / 100) *
      (1 - trackData.maxSpeed / 100)
  );

  const carBalanceImpact = Math.max(
    0,
    (50 - attributes.car_balance) *
      (0.15 + trackData.lapLength * 0.01) *
      (1 - trackData.longestFlatOut / 100) *
      (1 - trackData.downforceLevel / 100)
  );

  const weatherImpact = Math.max(0, (99 - weatherScore) * 0.4);

  let lapTime =
    baseLapTime +
    (speedImpact +
      maniabilityImpact +
      reliabilityImpact +
      aerodynamicsImpact +
      driverSkillsImpact +
      brakesImpact +
      carBalanceImpact +
      weatherImpact) *
      1000;

  // Add random variability based on driver skills
  const randomFactor = (Math.random() - 0.5) * 0.25 * 1000; // +/- 250 ms variability
  const adjustedRandomFactor = randomFactor * (1 - (attributes.driver_skills - 50) / 100); // Better driver reduces variability

  lapTime += adjustedRandomFactor;

  return Math.max(0, lapTime); // Ensure lapTime is not negative
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
