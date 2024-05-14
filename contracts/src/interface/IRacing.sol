// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRacing {
    enum RaceState {
        WAITING,
        ONGOING,
        FINISHED
    }

    struct ExternalFactors {
        uint8 Weather; // Real time precipitation level in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint8 Crashes; // Safest level in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint16 Full_Throttle; // Full throttle in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint8 Downforce; // Downforce level in % (33: Low | 66: Medimum | 100: High)
        uint16 Top_Speed; // Top Speed in km/h
    }

    struct PlayerAttributes {
        uint8 reliability;
        uint8 pitstops;
        uint8 speed;
        uint8 driver;
        uint8 strategy;
        uint8 cornering;
        uint8 luck;
        uint8 car_balance;
        uint8 staff;
        uint8 aerodynamics;
        address player;
        uint16 ELO;
    }

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event PlayerCreated(PlayerAttributes attributes, uint256 PlayerId);
    event JoinedRace(uint256 PlayerId);
    event StartedRace(uint256[] racers);
    event FinishedRace(uint8[] leaderboard);
    event RequestedLeaderboard(bytes32 indexed requestId, uint256 value);
    event BetAmountUpdated(uint256 newBetAmount, uint256 oldBetAmount);
}
