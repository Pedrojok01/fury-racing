type WeatherFx = "none" | "fog" | "rain";
type Sky = "sunny" | "cloudy" | "storm" | "night";

type PlayerScore = {
  _id: string;
  user_address: `0x${string}`;
  score: number;
};

type Leaderboard = PlayerScore[];

type CarAttributes = {
  reliability: number;
  maniability: number;
  speed: number;
  breaks: number;
  car_balance: number;
  aerodynamics: number;
  driver_skills: number;
  luck: number;
};

type ExternalFactors = {
  weather: number; // (0, 33: Low | 33, 66: Medimum | 66, 100: High)
  crashes: number; // Safest level (0, 33: Low | 33, 66: Medimum | 66, 100: High)
  full_throttle: number; // Full throttle in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
  downforce: number; // Downforce level (33: Low | 66: Medimum | 100: High)
  top_speed: number; // Top Speed in km/h
};

type TrackAnim = {
  tiles: string;
  startPosition: {
    x: number;
    y: number;
    direction: string;
  };
};

type DisplayStatData = {
  name: string;
  length: number;
  lengthFormatted: string;
  bestTimeInSeconds: number;
  bestTimeFormatted: string;
  maxSpeed: number;
  fullThrottle: number;
  downforce: number;
  animData: TrackAnim;
};

type Tracks = DisplayStatData[];

type CarMetadata = {
  path: string;
  scale: number;
  offset: {
    x: number;
    y: number;
    z: number;
  };
  attributes: CarAttributes;
  description: string;
};

type DecorationMetadata = {
  path: string;
  scale: number;
  offset: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    y: number;
  }
};

interface Weather {
  location: {
    name: string;
    country: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
  };
}

type LeaderboardResponse = {
  success: boolean;
  error: string | null;
  status: number;
  data: Leaderboard;
};

type WeatherResponse = {
  success: boolean;
  error: string | null;
  status: number;
  data: Weather | null;
};

type FetchError = {
  message: string;
  status: number;
};

type RaceMode = "SOLO" | "FREE" | "TOURNAMENT";

type EventData = {
  raceId: bigint;
  winner: `0x${string}`;
  loser: `0x${string}`;
};

type RaceState = "WAITING" | "ONGOING" | "FINISHED";

type RaceInfo = {
  circuit: bigint;
  mode: RaceMode;
  state: RaceState;
  player1: `0x${string}`;
  player2: `0x${string}`;
  player1Time: number;
  player2Time: number;
};

type PlayerInfo = {
  attributes: CarAttributes;
  playerAddress: `0x${string}`;
  ELO: number;
};
