// hooks/useWeather.ts
import useSWR from "swr";

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
  );

  return {
    weather: data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    refetch: mutate,
  };
}

export default useWeather;
