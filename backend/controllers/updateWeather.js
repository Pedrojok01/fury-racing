const { createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { avalancheFuji } = require("viem/chains");
const { calculateWeatherScore } = require("../utils/calculateWeatherScore");
const { CIRCUIT, RACING_CONTRACT } = require("../data/config");
const HttpError = require("../models/http-error");

const apiKey = process.env.WEATHER_API_KEY;
const privateKey = process.env.PRIVATE_KEY;

const updateWeatherDataForCircuit = async (weatherScore) => {
  const client = createWalletClient({
    chain: avalancheFuji,
    transport: http(),
  });
  const account = privateKeyToAccount(privateKey);

  try {
    const hash = await client.writeContract({
      address: RACING_CONTRACT.address,
      abi: RACING_CONTRACT.abi,
      functionName: "updateWeatherDataForCircuit",
      args: [CIRCUIT.index, weatherScore],
      account,
    });
    console.log(`Weather data updated successfully. Hash: ${hash}`);
  } catch (error) {
    console.error("Error updating weather data:", error);
    throw new HttpError("Failed to update weather data on the blockchain.", 500);
  }
};

const fetchWeatherData = async () => {
  if (!apiKey || !privateKey) {
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

  const weatherScore = calculateWeatherScore(filteredWeatherData);
  console.log(`Weather score: ${weatherScore}`);

  await updateWeatherDataForCircuit(weatherScore);

  return weatherScore;
};

const updateWeather = async (req, res, next) => {
  try {
    await fetchWeatherData();
    res?.status(200).json({ message: "Weather data updated successfully" });
  } catch (err) {
    next?.(err) ?? console.error(err);
  }
};

module.exports = { updateWeather };
