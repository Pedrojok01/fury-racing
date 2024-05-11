type RequestResponse = {
  success: boolean;
  error: string | null;
  status: number;
  data: Leaderboard;
};

type PlayerScore = {
  _id: string;
  user_address: `0x${string}`;
  score: number;
};

type Leaderboard = PlayerScore[];
