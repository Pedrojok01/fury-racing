const { calculateLapTime } = require("../utils/calculateLapTime");

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
  return Math.round(totalRaceTime);
}

module.exports = { calculateTotalRaceTime };
