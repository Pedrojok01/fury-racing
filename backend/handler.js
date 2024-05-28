const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const { updateWeather } = require("./controllers/updateWeather");

const app = express();

const routes = require("./routes");
const HttpError = require("./models/http-error");

app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/races/", routes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  next(error);
});

// middleware handling undefined error
app.use((error, req, res, next) => {
  if (res.headerSet) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

module.exports.handler = serverless(app);

module.exports.updateWeatherHandler = async (event) => {
  try {
    await updateWeather();
    return { statusCode: 200, body: JSON.stringify({ message: "Weather data updated successfully" }) };
  } catch (error) {
    console.error("Error updating weather data:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update weather data" }) };
  }
};
