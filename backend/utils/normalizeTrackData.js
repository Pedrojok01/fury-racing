function normalizeTrackData(track) {
  const maxFlatOut = 1500;
  const maxSpeedRange = [290, 360];
  const maxGearChangesRange = [30, 70];

  const rawMaxSpeed = track.maxSpeed;
  const rawGearChangesPerLap = track.gearChangesPerLap;

  const normalizedMaxSpeed = ((rawMaxSpeed - maxSpeedRange[0]) / (maxSpeedRange[1] - maxSpeedRange[0])) * 0.9 + 0.1;
  const normalizedGearChangesPerLap =
    (rawGearChangesPerLap - maxGearChangesRange[0]) / (maxGearChangesRange[1] - maxGearChangesRange[0]);

  return {
    ...track,
    maxSpeed: Math.max(0.1, Math.min(1, normalizedMaxSpeed)), // Normalize to 0.1-1
    longestFlatOut: Math.max(0, Math.min(1, track.longestFlatOut / maxFlatOut)), // Normalize to 0-1
    gearChangesPerLap: Math.max(0, Math.min(1, normalizedGearChangesPerLap)), // Normalize to 0-1
  };
}

module.exports = { normalizeTrackData };
