const { calculateTotalRaceTime } = require("../utils/calculateTotalRaceTime");
const tracks = require("../data/tracks");

const testRaceTime = () => {
  const goodWeatherScore = 90;
  const badWeatherScore = 30;

  const attributeSets = [
    {
      reliability: 50,
      maniability: 50,
      speed: 50,
      brakes: 50,
      car_balance: 50,
      aerodynamics: 50,
      driver_skills: 50,
      luck: 50,
    },
    {
      reliability: 99,
      maniability: 10,
      speed: 99,
      brakes: 10,
      car_balance: 10,
      aerodynamics: 99,
      driver_skills: 10,
      luck: 50,
    },
    {
      reliability: 10,
      maniability: 99,
      speed: 10,
      brakes: 99,
      car_balance: 99,
      aerodynamics: 10,
      driver_skills: 99,
      luck: 50,
    },
    {
      reliability: 80,
      maniability: 20,
      speed: 90,
      brakes: 30,
      car_balance: 60,
      aerodynamics: 70,
      driver_skills: 40,
      luck: 50,
    },
    {
      reliability: 20,
      maniability: 80,
      speed: 30,
      brakes: 70,
      car_balance: 40,
      aerodynamics: 60,
      driver_skills: 90,
      luck: 50,
    },
  ];

  const results = [];

  attributeSets.forEach((attributes) => {
    const goodWeatherTime = calculateTotalRaceTime(attributes, tracks[0], goodWeatherScore);
    const badWeatherTime = calculateTotalRaceTime(attributes, tracks[0], badWeatherScore);
    results.push({ attributes, goodWeatherTime, badWeatherTime });
  });

  console.log("Results:", results);
};

testRaceTime();
