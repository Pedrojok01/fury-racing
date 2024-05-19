export function mapWeatherData(weatherData: Weather): { weatherFx: WeatherFx; skybox: Sky } {
  const { current } = weatherData;

  let weatherFx: WeatherFx = "none";
  let skybox: Sky = "sunny";

  const conditionText = current.condition.text.toLowerCase();
  const cloudCoverage = current.cloud;
  const isDay = current.is_day === 1;

  if (
    conditionText.includes("rain") ||
    conditionText.includes("shower") ||
    conditionText.includes("drizzle")
  ) {
    weatherFx = "rain";
  } else if (
    conditionText.includes("fog") ||
    conditionText.includes("mist") ||
    conditionText.includes("haze")
  ) {
    weatherFx = "fog";
  }

  if (!isDay) {
    skybox = "night";
  } else if (conditionText.includes("storm") || conditionText.includes("thunder")) {
    skybox = "storm";
  } else if (cloudCoverage > 80) {
    skybox = "cloudy";
  } else if (cloudCoverage > 20) {
    skybox = "cloudy";
  } else {
    skybox = "sunny";
  }

  return { weatherFx, skybox };
}
