const { normalizeTrackData } = require("../utils/normalizeTrackData");

/**
 * @description Calculates the lap time for a player based on attributes, track data, and weather score.
 * @param {Object} attributes - The player's car attributes.
 * @param {Object} trackData - The data of the track.
 * @param {number} weatherScore - The weather score.
 * @returns {number} - The lap time in milliseconds.
 */
function calculateLapTime(attributes, trackData, weatherScore) {
  const baseLapTime = trackData.bestLapTime; // Use best lap time from track data

  // Normalize the track data
  const normalizedTrack = normalizeTrackData(trackData);

  // Adjusted Speed Calculation
  const speedFactor1 = (100 - attributes.speed) / 100;
  const speedFactor2 = 0.2 + normalizedTrack.fullThrottle * 0.05;
  const speedFactor3 = 1 - (attributes.brakes + attributes.aerodynamics + attributes.car_balance) / 300;
  const speedFactor4 = weatherScore / 100;
  const speedFactor5 = 1 - normalizedTrack.maxSpeed;
  const speedFactor6 = 1 - normalizedTrack.gearChangesPerLap;

  const speedImpact = Math.max(
    0,
    speedFactor1 * speedFactor2 * speedFactor3 * speedFactor4 * speedFactor5 * speedFactor6
  );

  // Adjusted Maniability Calculation
  const maniabilityFactor1 = attributes.maniability / 50; // Normalized to [0.2, 1.98]
  const maniabilityFactor2 = normalizedTrack.technicalFactor + normalizedTrack.downforceLevel * 0.01;
  const maniabilityFactor3 = 1 - attributes.car_balance / 100;
  const maniabilityFactor4 = weatherScore / 100;
  const maniabilityFactor5 = 1 - normalizedTrack.gearChangesPerLap;

  // Base impact calculation
  const baseImpact = maniabilityFactor2 * maniabilityFactor3 * maniabilityFactor4 * maniabilityFactor5;

  // Adjust for maniability attribute
  const maniabilityImpact = maniabilityFactor1 * baseImpact;

  // Adjusted Reliability Calculation
  const reliabilityFactor1 = (100 - attributes.reliability) / 100;
  const reliabilityFactor2 = 0.15 + normalizedTrack.lapLength * 0.01;
  const reliabilityFactor3 = 1 - normalizedTrack.fullThrottle;
  const reliabilityFactor4 = 1 - normalizedTrack.gearChangesPerLap;

  const reliabilityImpact = Math.max(
    0,
    reliabilityFactor1 * reliabilityFactor2 * reliabilityFactor3 * reliabilityFactor4
  );

  // Adjusted Aerodynamics Calculation
  const aerodynamicsFactor1 = (100 - attributes.aerodynamics) / 100;
  const aerodynamicsFactor2 = 0.15 + normalizedTrack.downforceLevel * 0.05;
  const aerodynamicsFactor3 = weatherScore / 100;
  const aerodynamicsFactor4 = 1 - normalizedTrack.fullThrottle;
  const aerodynamicsFactor5 = 1 - normalizedTrack.longestFlatOut;

  const aerodynamicsImpact = Math.max(
    0,
    aerodynamicsFactor1 * aerodynamicsFactor2 * aerodynamicsFactor3 * aerodynamicsFactor4 * aerodynamicsFactor5
  );

  // Adjusted Driver Skills Calculation
  const driverSkillsFactor1 = (100 - attributes.driver_skills) / 100;
  const driverSkillsFactor2 = 0.2;
  const driverSkillsFactor3 = 1 - normalizedTrack.gearChangesPerLap;

  const driverSkillsImpact = Math.max(0, driverSkillsFactor1 * driverSkillsFactor2 * driverSkillsFactor3);

  // Adjusted Brakes Calculation
  const brakesFactor1 = (100 - attributes.brakes) / 100;
  const brakesFactor2 = 0.15 + normalizedTrack.longestFlatOut * 0.01;
  const brakesFactor3 = 1 - attributes.speed / 100;
  const brakesFactor4 = 1 - normalizedTrack.lapLength / 50;
  const brakesFactor5 = 1 - normalizedTrack.maxSpeed;

  const brakesImpact = Math.max(0, brakesFactor1 * brakesFactor2 * brakesFactor3 * brakesFactor4 * brakesFactor5);

  // Adjusted Car Balance Calculation
  const carBalanceFactor1 = (100 - attributes.car_balance) / 100;
  const carBalanceFactor2 = 0.15 + normalizedTrack.lapLength * 0.01;
  const carBalanceFactor3 = 1 - normalizedTrack.longestFlatOut;
  const carBalanceFactor4 = 1 - normalizedTrack.downforceLevel / 100;

  const carBalanceImpact = Math.max(0, carBalanceFactor1 * carBalanceFactor2 * carBalanceFactor3 * carBalanceFactor4);

  // Weather Impact Calculation
  const weatherImpact = Math.max(0, (99 - weatherScore) * 0.3);

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

  return Math.max(0, Math.round(lapTime)); // Ensure lapTime is not negative
}

module.exports = { calculateLapTime };
