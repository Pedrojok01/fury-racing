import { NextRequest, NextResponse } from "next/server";

import { mockLeaderboard } from "@/data/mockLeaderboard";

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

    const responseData: LeaderboardResponse = {
      success: true,
      error: null,
      status: 200,
      data: mockLeaderboard,
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
