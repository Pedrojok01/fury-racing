const parser = require('cron-parser');
const config = require('../config');

const readWeather = () => {
    const interval = parser.parseExpression('*/1 * * * *');

    setInterval(async() => {
        
        console.log('60 minutes passed - ', new Date().toLocaleString());

        const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${config.WEATHER_API_KEY}&q=${config.WEATHER_CITY}&aqi=no`;
        const response = await fetch(weatherApiUrl);
        const data = await response.json();
        
        
        const weatherScore = calculateWeatherScore(data);
        console.log(`Weather score: ${weatherScore}`);
   
    }, interval.next().getTime() - Date.now());

}

/**
 * @description Calculate a weather score based on temperature, wind, precipitation, humidity, and cloud cover.
 * @param weather The weather data to calculate the score for.
 * @returns The weather score as an integer percentage.
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
  
  // Normalize a value to a 0-99 scale
  function normalize(value, min, max) {
    return ((value - min) / (max - min)) * 99;
  }
  

module.exports = readWeather;