// SPDX-License-Identifier: BSL-1.1
pragma solidity 0.8.24;

/**
 * @title IRacing - Interface for Racing.sol contract;
 * @author @Pedrojok01
 * @notice Defines structs, enums and events for Racing.sol contract
 */
interface IRacing {
    /*//////////////////////////////////////////////////////////////
                               RACES
    //////////////////////////////////////////////////////////////*/

    enum RaceMode {
        SOLO,
        FREE,
        TOURNAMENT
    }

    enum RaceState {
        NON_EXISTENT,
        WAITING,
        ONGOING,
        FINISHED
    }

    /**
     * @notice Struct containing all data per Race
     * @param state The state of race
     * @param circuit The index of the circuit used for the current race (starts at 1)
     * @param player1 The address of the first player
     * @param player2 The address of the second player
     * @param player1Time The time in milli seconds of the first player
     * @param player2Time The time in milli seconds of the second player
     */
    struct Race {
        uint256 circuit;
        RaceMode mode;
        RaceState state;
        address player1;
        address player2;
        uint40 player1Time;
        uint40 player2Time;
    }

    /*//////////////////////////////////////////////////////////////
                               CIRCUITS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Struct containing all external factors per Circuit
     * @dev The waether is dynamic and is updated every hours for each circuit
     * @param weather The real-time weather for the circuit in %
     * @param crashes The average crashes for the circuit in %
     * @param full_Throttle The full throttle average for the circuit in %
     * @param downforce The downforce level average for the circuit in %
     * @param top_Speed The top speed average for the circuit in km/h
     */
    struct ExternalFactors {
        uint8 weather; // Precipitation in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint8 crashes; // Safest level in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint16 full_Throttle; // Full throttle in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint8 downforce; // Downforce level in % (33: Low | 66: Medimum | 100: High)
        uint16 top_Speed; // Top Speed in km/h
    }

    /**
     * @notice Struct containing all data per Circuit
     * @param factors The external factors for the circuit
     * @param index The index of the circuit (starts at 1)
     * @param name The name of the circuit
     */
    struct Circuits {
        ExternalFactors factors;
        uint256 index;
        string name;
    }

    /*//////////////////////////////////////////////////////////////
                               PLAYERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Struct containing all the car attributes selected by a Player
     * @param reliability The reliability of the car from 1 to 9
     * @param maniability The maniability of the car from 1 to 9
     * @param speed The speed of the car from 1 to 9
     * @param breaks The breaks of the car from 1 to 9
     * @param car_balance The car balance of the car from 1 to 9
     * @param aerodynamics The aerodynamics of the car from 1 to 9
     * @param driver_skills The driver skills of the car from 1 to 9
     * @param luck The luck of the car from 1 to 9
     */
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

    /**
     * @notice Struct containing all data per Player
     * @param attributes The car attributes selected by the player
     * @param playerAddress The address of the player
     * @param ELO The ELO of the player (starts at 1200, resets every week)
     */
    struct Player {
        PlayerAttributes attributes;
        address playerAddress;
        uint16 ELO;
    }

    /*//////////////////////////////////////////////////////////////
                            CHAINLINK REQUESTS
    //////////////////////////////////////////////////////////////*/

    struct RandomRequests {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    struct FunctionsRequests {
        bool fulfilled;
        bool exists;
        uint256[] results;
    }

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event PlayerCreated(address indexed player, PlayerAttributes attributes, uint256 playerId);
    event BetAmountUpdated(uint256 newBetAmount, uint256 oldBetAmount);
    event JoinedRace(address indexed player, uint256 raceId);
    event SoloRaceStarted(address indexed player, uint256 raceId);
    event FreeRaceStarted(uint256 raceId);
    event RaceStarted(uint256 raceId);
    event FinishedRace(uint256 indexed raceId, address winner, address loser);
}
