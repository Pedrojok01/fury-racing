const { calculateWeatherScore } = require("../utils/calculateWeatherScore");
const { CIRCUIT } = require("../data/config");
const HttpError = require("../models/http-error");

const apiKey = process.env.WEATHER_API_KEY;

const fetchWeatherData = async () => {
  if (!apiKey) {
    console.error(`Some environment variables are missing.`);
    throw new HttpError("Environment variables are missing.", 500);
  }

  const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${CIRCUIT.name}&aqi=no`;
  let response;

  try {
    response = await fetch(weatherApiUrl, { cache: "no-cache" });
  } catch (err) {
    throw new HttpError("Failed to fetch weather data.", 500);
  }

  if (!response.ok) {
    throw new HttpError(`Failed to fetch weather data: ${response.statusText}`, response.status);
  }

  const weatherData = await response.json();
  const filteredWeatherData = {
    location: {
      name: weatherData.location.name,
      country: weatherData.location.country,
      localtime_epoch: weatherData.location.localtime_epoch,
      localtime: weatherData.location.localtime,
    },
    current: {
      temp_c: weatherData.current.temp_c,
      temp_f: weatherData.current.temp_f,
      is_day: weatherData.current.is_day,
      condition: {
        text: weatherData.current.condition.text,
        icon: weatherData.current.condition.icon,
      },
      wind_mph: weatherData.current.wind_mph,
      wind_kph: weatherData.current.wind_kph,
      wind_degree: weatherData.current.wind_degree,
      wind_dir: weatherData.current.wind_dir,
      precip_mm: weatherData.current.precip_mm,
      precip_in: weatherData.current.precip_in,
      humidity: weatherData.current.humidity,
      cloud: weatherData.current.cloud,
      feelslike_c: weatherData.current.feelslike_c,
      feelslike_f: weatherData.current.feelslike_f,
    },
  };

  return calculateWeatherScore(filteredWeatherData);
};

const calculateWeather = async (req, res, next) => {
  try {
    const weatherScore = await fetchWeatherData();
    console.log(`Weather score: ${weatherScore}`);
    res
      ?.status(200)
      .json({ message: `Weather data calculated successfully: ${weatherScore}`, weatherScore: weatherScore });
  } catch (err) {
    next?.(err) ?? console.error(err);
  }
};

module.exports = { calculateWeather };
