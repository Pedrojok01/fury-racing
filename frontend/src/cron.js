/* eslint-disable */
const cron = require("node-cron");
const { createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { avalancheFuji } = require("viem/chains");

const { calculateWeatherScore } = require("./utils/calculateWeatherScore.js");

const apiKey = process.env.WEATHER_API_KEY;
const privateKey = process.env.PRIVATE_KEY;

const RACING_CONTRACT = "0xba9d10112e4cedb056feb6700090f287af0b66b9";
const RACING_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "circuitIndex", type: "uint256" },
      { internalType: "uint256", name: "data", type: "uint256" },
    ],
    name: "updateWeatherDataForCircuit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const circuit = {
  name: "Monaco",
  index: 1,
};

if (!apiKey) {
  throw new Error("WEATHER_API_KEY is not set in the environment variables");
}
if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set in the environment variables");
}

const updateWeatherDataForCircuit = async (weatherScore) => {
  const client = createWalletClient({
    chain: avalancheFuji,
    transport: http(),
  });
  const account = privateKeyToAccount(privateKey);

  try {
    const hash = await client.writeContract({
      address: RACING_CONTRACT,
      abi: RACING_ABI,
      functionName: "updateWeatherDataForCircuit",
      args: [circuit.index, weatherScore],
      account,
    });
    console.log(` Weather data updated successfully. Hash: ${hash}`);
  } catch (error) {
    console.error("Error updating weather data:", error);
  }
};

const fetchAndUpdateWeather = async () => {
  const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${circuit.name}&aqi=no`;
  const response = await fetch(weatherApiUrl, { cache: "no-cache" });

  if (!response.ok) {
    return {
      success: false,
      error: `Failed to fetch weather data: ${response.statusText}`,
      status: response.status,
      data: null,
    };
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
};

// Schedule the task to run every hour
cron.schedule("0 * * * *", fetchAndUpdateWeather);
console.log("Cron job scheduled: Weather data will be updated every hour.");
