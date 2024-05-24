// hooks/useWeather.ts
import { useEffect } from "react";

import useSWR from "swr";

import { useAnim } from "@/stores/useAnim";
import { mapWeatherData } from "@/utils/mapWeatherData";

type FetchError = {
  message: string;
  status: number;
};

const fetcher = async (url: string): Promise<WeatherResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    const error: FetchError = {
      message: `Failed to fetch: ${response.status} ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }
  return response.json();
};

function useWeather(city: string) {
  const { data, error, mutate } = useSWR<WeatherResponse, FetchError>(
    city ? `/api/getWeather?city=${city}` : null,
    fetcher,
    {
      revalidateOnFocus: true, // Revalidate when window is focused
      refreshInterval: 3600000, // Refresh every hour
    },
  );

  const { setWeather, setSky } = useAnim();

  useEffect(() => {
    if (data?.data) {
      const { weatherFx, skybox } = mapWeatherData(data.data);
      setWeather(weatherFx);
      setSky(skybox);
    }
  }, [data?.data, setWeather, setSky]);

  return {
    weather: data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    refetch: mutate,
  };
}

export default useWeather;
