/**
 * @description Calculate a weather score based on temperature, wind, precipitation, humidity, and cloud cover.
 * @param {Weather} weather The weather data to calculate the score for.
 * @returns {number} The weather score as an integer percentage from 0 to 99.
 */
const calculateWeatherScore = (weather) => {
  const { temp_c, wind_kph, precip_mm, humidity, cloud } = weather.current;

  // Weights per factor
  const weights = {
    temperature: 0.3,
    wind: 0.2,
    precipitation: 0.3,
    humidity: 0.1,
    cloud: 0.1,
  };

  // Normalize each factor to a 0-99 scale
  const normalizedTemp = normalize(temp_c, -10, 40); // Assuming -10°C to 40°C as extreme
  const normalizedWind = normalize(wind_kph, 0, 100); // Assuming 0 kph to 100 kph as extreme
  const normalizedPrecip = normalize(precip_mm, 0, 50); // Assuming 0 mm to 50 mm as extreme
  const normalizedHumidity = normalize(humidity, 0, 100);
  const normalizedCloud = normalize(cloud, 0, 100);

  // Calculate the weighted score
  const score =
    normalizedTemp * weights.temperature +
    (99 - normalizedWind) * weights.wind +
    (99 - normalizedPrecip) * weights.precipitation +
    (99 - normalizedHumidity) * weights.humidity +
    (99 - normalizedCloud) * weights.cloud;

  return Math.round(score);
};

/**
 * @description Normalize a value to a 0-99 scale.
 * @param {number} value The value to normalize.
 * @param {number} min The minimum value of the range.
 * @param {number} max The maximum value of the range.
 * @returns {number} The normalized value.
 */
function normalize(value, min, max) {
  return ((value - min) / (max - min)) * 99;
}

module.exports = { calculateWeatherScore };
