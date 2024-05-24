import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (req.method !== "GET") {
      const errorMethod: WeatherResponse = {
        success: false,
        error: "Method Not Allowed",
        status: 405,
        data: null,
      };
      return NextResponse.json(errorMethod);
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    if (!city) {
      const errorResponse: WeatherResponse = {
        success: false,
        error: "City parameter is required",
        status: 400,
        data: null,
      };
      return NextResponse.json(errorResponse);
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      const errorResponse: WeatherResponse = {
        success: false,
        error: "WEATHER_API_KEY is not set in the environment variables",
        status: 500,
        data: null,
      };
      return NextResponse.json(errorResponse);
    }

    const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    const weatherResponse = await fetch(weatherApiUrl, {
      cache: "no-cache",
    });
    if (!weatherResponse.ok) {
      const errorResponse: WeatherResponse = {
        success: false,
        error: `Failed to fetch weather data: ${weatherResponse.statusText}`,
        status: weatherResponse.status,
        data: null,
      };
      return NextResponse.json(errorResponse);
    }

    const weatherData: Weather = await weatherResponse.json();

    const filteredWeatherData: Weather = {
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

    const responseData: WeatherResponse = {
      success: true,
      error: null,
      status: 200,
      data: filteredWeatherData,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch weather data: ", error);

    const errorResponseData: WeatherResponse = {
      success: false,
      error: `Failed to fetch weather data: ${(error as Error).message ?? error}`,
      status: 500,
      data: null,
    };
    return NextResponse.json(errorResponseData);
  }
}
