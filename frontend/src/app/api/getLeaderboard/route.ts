import { NextRequest, NextResponse } from "next/server";

import { mockLeaderboard } from "@/data/mockLeaderboard";


export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    if (req.method !== "GET") {
      const errorMethod: RequestResponse = {
        success: false,
        error: "Method Not Allowed",
        status: 405,
        data: [],
      };
      return NextResponse.json(errorMethod);
    }

    const responseData: RequestResponse = {
      success: true,
      error: null,
      status: 200,
      data: mockLeaderboard,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch data: ", error);

    const errorResponseData: RequestResponse = {
      success: false,
      error: `Failed to fetch data: ${(error as Error).message ?? error}`,
      status: 500,
      data: [],
    };
    return NextResponse.json(errorResponseData);
  }
}
