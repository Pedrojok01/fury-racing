const { createPublicClient, http } = require("viem");
const { avalancheFuji } = require("viem/chains");
const { RACING_CONTRACT } = require("../data/config");
const HttpError = require("../models/http-error");

const leaderboard = async (req, res, next) => {
  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(),
  });

  try {
    const [week, players] = await publicClient.readContract({
      address: RACING_CONTRACT.address,
      abi: RACING_CONTRACT.abi,
      functionName: "getWeekAndPlayerAmount",
    });

    const totalPlayers = Number(players);

    if (totalPlayers === 0) {
      return res.status(200).json({ players: [], scores: [] });
    }

    const getPlayerAddressForWeeklyTournament = async (index) => {
      return publicClient.readContract({
        address: RACING_CONTRACT.address,
        abi: RACING_CONTRACT.abi,
        functionName: "getPlayerAddressForWeeklyTournament",
        args: [week, index],
      });
    };

    const getAddressToPlayer = async (address) => {
      return publicClient.readContract({
        address: RACING_CONTRACT.address,
        abi: RACING_CONTRACT.abi,
        functionName: "addressToPlayer",
        args: [address],
      });
    };

    if (totalPlayers === 1) {
      const playerAddress = await getPlayerAddressForWeeklyTournament(1);
      const [attributes, address, elo] = await getAddressToPlayer(playerAddress);

      return res.status(200).json({ players: [address], scores: [elo.toString()] });
    }

    // get player addresses
    const batchSize = 10;
    let addressesResults = [];

    for (let i = 0; i < totalPlayers; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, totalPlayers - i) }, (_, j) => ({
        ...RACING_CONTRACT,
        functionName: "getPlayerAddressForWeeklyTournament",
        args: [week, i + j + 1],
      }));

      const batchResults = await publicClient.multicall({ contracts: batch });
      addressesResults = addressesResults.concat(batchResults);
    }

    const playerAddresses = addressesResults.map((result) => result.result.toString());

    // retunr all players' scores
    let scoreResults = [];

    for (let i = 0; i < playerAddresses.length; i += batchSize) {
      const batch = playerAddresses.slice(i, i + batchSize).map((address) => ({
        ...RACING_CONTRACT,
        functionName: "addressToPlayer",
        args: [address],
      }));

      const batchResults = await publicClient.multicall({ contracts: batch });
      scoreResults = scoreResults.concat(batchResults);
    }

    const getPlayersScore = scoreResults.map((result) => result.result);

    let playersScores = getPlayersScore.map((player) => ({
      address: player[1],
      score: player[2],
    }));

    playersScores = playersScores
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        id: index + 1,
        ...player,
      }));

    res.status(200).json({ ranking: playersScores });
  } catch (error) {
    console.error("Error calling leaderboard:", error);
    const err = new HttpError("Error calling leaderboard: " + error, 500);
    return next(err);
  }
};

module.exports = { leaderboard };
