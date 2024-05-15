// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRacing {
    enum RaceState {
        NON_EXISTENT,
        WAITING,
        ONGOING,
        FINISHED
    }

    struct ExternalFactors {
        uint8 Weather; // Real time precipitation level in % (0, 33: Low | 33, 66: Medimum | 66,
            // 100: High)
        uint8 Crashes; // Safest level in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint16 Full_Throttle; // Full throttle in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint8 Downforce; // Downforce level in % (33: Low | 66: Medimum | 100: High)
        uint16 Top_Speed; // Top Speed in km/h
    }

    struct Circuits {
        ExternalFactors factors;
        string name;
    }

    struct Player {
        PlayerAttributes attributes;
        address playerAddress;
        uint16 ELO;
    }

    struct PlayerAttributes {
        uint8 reliability;
        uint8 maniability;
        uint8 speed;
        uint8 breaks;
        uint8 car_balance;
        uint8 aerodynamics;
        uint8 driver_skills;
        uint8 luck;
    }

    struct Race {
        RaceState state;
        address player1;
        address player2;
        uint40 player1Time;
        uint40 player2Time;
    }

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event PlayerCreated(address indexed player, PlayerAttributes attributes, uint256 playerId);
    event BetAmountUpdated(uint256 newBetAmount, uint256 oldBetAmount);
    event JoinedRace(address player);
    event FreeRaceStarted(uint256 raceId);
    event RaceStarted(uint256 raceId);
    event FinishedRace(uint256 raceId, address winner);
}
