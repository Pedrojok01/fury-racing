// hooks/useLeaderboard.ts
import useSWR from "swr";

const fetcher = async (url: string): Promise<LeaderboardResponse> => {
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

function useLeaderboard() {
  const { data, error, mutate } = useSWR<LeaderboardResponse, FetchError>("/api/getLeaderboard", fetcher);

  return {
    leaderboard: data?.data ?? [],
    isLoading: !error && !data,
    isError: error,
    refetch: mutate,
  };
}

export default useLeaderboard;
