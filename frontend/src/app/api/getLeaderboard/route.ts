import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (req.method !== "GET") {
      const errorMethod: LeaderboardResponse = {
        success: false,
        error: "Method Not Allowed",
        status: 405,
        data: [],
      };
      return NextResponse.json(errorMethod);
    }

    const leaderboardApiUrl = "https://racerback.azurewebsites.net/api/races/players/rank";

    const leaderboardResponse = await fetch(leaderboardApiUrl, {
      cache: "no-cache",
    });
    if (!leaderboardResponse.ok) {
      const errorResponse: WeatherResponse = {
        success: false,
        error: `Failed to fetch weather data: ${leaderboardResponse.statusText}`,
        status: leaderboardResponse.status,
        data: null,
      };
      return NextResponse.json(errorResponse);
    }

    const leaderboardData = await leaderboardResponse.json();

    const responseData: LeaderboardResponse = {
      success: true,
      error: null,
      status: 200,
      data: leaderboardData.ranking,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch data: ", error);

    const errorResponseData: LeaderboardResponse = {
      success: false,
      error: `Failed to fetch data: ${(error as Error).message ?? error}`,
      status: 500,
      data: [],
    };
    return NextResponse.json(errorResponseData);
  }
}
