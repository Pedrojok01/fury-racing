// SPDX-License-Identifier: BSL-1.1
pragma solidity 0.8.24;

import { ChainlinkFeed } from "./ChainlinkFeed.sol";

import "./Errors.sol";

import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Racing - Main contract containing the game logic for Fury Racing.
 * @author @Pedrojok01
 */

/**
 * | Function Name                       | Sighash    | Function Signature                           |
 * | ----------------------------------- | ---------- | --------------------------------------------
 * |
 * | joinSoloRace                        | 73197373   |
 * joinSoloRace((uint8,uint8,uint8,uint8,uint8,uint8,uint8,uint8),(uint8,uint8,uint8,uint8,uint8,uint8,uint8,uint8),uint256)
 * |
 * | joinFreeRace                        | 3436f847   |
 * joinFreeRace((uint8,uint8,uint8,uint8,uint8,uint8,uint8,uint8),uint256) |
 * | joinRace                            | 896caa4a   |
 * joinRace((uint8,uint8,uint8,uint8,uint8,uint8,uint8,uint8),uint256) |
 * | sponsorWeeklyPrizePool              | e68a37c5   | sponsorWeeklyPrizePool()                     |
 * | getSoloRaceFromRaceID               | eab8ff7a   | getSoloRaceFromRaceID(uint256)               |
 * | getFreeRaceFromRaceID               | ccb3d9ee   | getFreeRaceFromRaceID(uint256)               |
 * | getRaceFromRaceID                   | e2a5ac42   | getRaceFromRaceID(uint256)                   |
 * | getWeekAndPlayerAmount              | 192e74c6   | getWeekAndPlayerAmount()                     |
 * | getPlayerAddressForWeeklyTournament | 3aaeb807   |
 * getPlayerAddressForWeeklyTournament(uint256,uint256) |
 * | updateWeatherDataForCircuit         | 9c7ae2db   | updateWeatherDataForCircuit(uint256,uint256)
 * |
 * | addCircuit                          | e0b2b785   |
 * addCircuit((uint8,uint8,uint16,uint8,uint16),string) |
 * | setBetAmount                        | 53a79d74   | setBetAmount(uint256)                        |
 * | pause                               | 8456cb59   | pause()                                      |
 * | unpause                             | 3f4ba83a   | unpause()                                    |
 * | emergencyWithdraw                   | db2e21bc   | emergencyWithdraw()                          |
 */
contract Racing is ChainlinkFeed, Pausable, ReentrancyGuard {
    address private constant AI_PLAYER_ADDRESS = 0x00000000000000000000000000000000000000A1;
    uint256 private constant TOURNAMENT_DURATION = 1 weeks;
    uint256 private constant START_ELO = 1200;
    uint256 private constant MAX_BET_PLAYERS = 100; // Prevent DoS during prize pool distributing

    uint256 public betAmount = 0.001 ether;
    uint256 public currentPrizePool;
    uint256 public lastPrizeDistribution;
    uint256 public playersCounter;
    uint256 public tournamentPlayersCounter; // Separate counter for weekly tournament
    uint256 public weeklyTournamentCounter = 1;

    mapping(uint256 => Race) private soloRaces;
    mapping(uint256 => Race) private freeRaces;
    mapping(uint256 => Race) private races;
    uint256 public soloRaceCounter = 1;
    uint256 public freeRaceCounter = 1;
    uint256 public raceCounter = 1;

    // Get any exisitng Player struct by address
    mapping(address => Player) public addressToPlayer;

    // Additonal mapping related to weekly tournament
    mapping(uint256 => mapping(uint256 => address)) private weeklyBetPlayerIndex;
    mapping(uint256 => mapping(address => uint256)) private weeklyBetPlayerAddressToIndex;
    Circuits[] public circuits;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _router,
        address _vrfCoordinator,
        uint256 _vrfSubscriptionId,
        uint64 _functionSubscriptionId,
        bytes32 _keyHash,
        bytes32 _donID
    )
        ChainlinkFeed(_router, _vrfCoordinator)
    {
        ROUTER = _router;
        VRF_SUBSCRIPTION_ID = _vrfSubscriptionId;
        FUNCTIONS_SUBSCRIPTION_ID = _functionSubscriptionId;
        KEY_HASH = _keyHash;
        DON_ID = _donID;

        addCircuit(ExternalFactors(17, 66, 59, 90, 290), "Monaco");
        _createPlayer(AI_PLAYER_ADDRESS, RaceMode.SOLO, PlayerAttributes(5, 5, 5, 5, 5, 5, 5, 5));
        lastPrizeDistribution = block.timestamp;
    }

    fallback() external payable { }
    receive() external payable { }

    /*//////////////////////////////////////////////////////////////
                                RACES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Allows to play a solo race against an AI player.
     * @param attributes1 The player's attributes.
     * @param attributes2 The AI player's attributes, randomly generated.
     * @param circuitId The circuit ID.
     */
    function joinSoloRace(
        PlayerAttributes memory attributes1,
        PlayerAttributes memory attributes2,
        uint256 circuitId
    )
        public
    {
        _verifyAttributes(attributes1);
        _verifyAttributes(attributes2);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, RaceMode.SOLO, attributes1);
        } else {
            addressToPlayer[msg.sender].attributes = attributes1;
        }

        addressToPlayer[AI_PLAYER_ADDRESS].attributes = attributes2;
        Race memory race = _createNewRace(circuitId, RaceMode.SOLO);
        race.state = RaceState.ONGOING;
        soloRaces[soloRaceCounter] = race;

        emit SoloRaceStarted(msg.sender, soloRaceCounter);
        requestRandomNumber(soloRaceCounter, RaceMode.SOLO);
        soloRaceCounter++;
    }

    /**
     * @notice Allows to join a free race against another player. Create a new race if it doesn't
     * exist. Update the current race if it exists, then start the game.
     * @param attributes The player's attributes.
     * @param circuitId The circuit ID.
     */
    function joinFreeRace(PlayerAttributes memory attributes, uint256 circuitId) public {
        _verifyAttributes(attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, RaceMode.FREE, attributes);
        } else {
            addressToPlayer[msg.sender].attributes = attributes;
        }
        bool ongoing = _updateRace(circuitId, RaceMode.FREE);
        emit JoinedRace(msg.sender, freeRaceCounter);

        // Run race when it is full.
        if (ongoing) {
            emit FreeRaceStarted(freeRaceCounter);
            requestRandomNumber(freeRaceCounter, RaceMode.FREE);
            freeRaceCounter++;
        }
    }

    /**
     * @notice Allows to join a tournament race against another player. Requires to pay the bet
     * amount. Will increase the weekly prize pool by 5%. The player's ELO will be updated based on
     * the result.
     * @param attributes The player's attributes.
     * @param circuitId The circuit ID.
     */
    function joinRace(
        PlayerAttributes memory attributes,
        uint256 circuitId
    )
        public
        payable
        whenNotPaused
        nonReentrant
    {
        if (msg.value != betAmount) {
            revert Racing__InvalidBetAmount();
        }

        _verifyAttributes(attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, RaceMode.TOURNAMENT, attributes);
        } else {
            updatePlayerAttributes(msg.sender, attributes);
        }

        // 5% goes to weekly prize pool
        currentPrizePool += (msg.value * 5) / 100;

        bool ongoing = _updateRace(circuitId, RaceMode.TOURNAMENT);
        emit JoinedRace(msg.sender, raceCounter);

        // Run race when it is full.
        if (ongoing) {
            emit RaceStarted(raceCounter);
            requestRandomNumber(raceCounter, RaceMode.TOURNAMENT);
            raceCounter++;
        }
    }

    /**
     * @notice Internal functions called by the Chainlink VRF callback to start the
     * race with the received random words. The random words are used to adjust the player's
     * attributes from -5% to +5%.
     * @param _words The random words received from the Chainlink VRV v2.5.
     * @param _raceId The ID of the race.
     * @param _mode The mode of the race (SOLO, FREE, TOURNAMENT)
     */
    function _startRace(
        uint256[] memory _words,
        uint256 _raceId,
        RaceMode _mode
    )
        internal
        override
    {
        Race memory _race = _getRaceByMode(_raceId, _mode);
        uint256 weather = uint256(_getCircuit(_race.circuit).factors.weather);

        PlayerAttributes[] memory attributes = new PlayerAttributes[](2);
        attributes[0] = _applyLuckFactor(addressToPlayer[_race.player1].attributes, _words[0]);
        attributes[1] = _applyLuckFactor(addressToPlayer[_race.player2].attributes, _words[1]);

        requestRaceResult(_race.circuit, _raceId, weather, _mode, attributes);
    }

    /**
     * @notice Internal functions called by the Chainlink Functions callback to finish the
     * race with the received values. The values are the time in milliseconds for each player.
     * The player with the lowest time wins.
     * @param _raceId The ID of the race.
     * @param _mode The mode of the race (SOLO, FREE, TOURNAMENT)
     * @param _values The time in milliseconds for each player.
     */
    function _finishRace(
        uint256 _raceId,
        RaceMode _mode,
        uint256[] memory _values
    )
        internal
        override
    {
        Race memory race = _getRaceByMode(_raceId, _mode);
        race.player1Time = uint40(_values[0]);
        race.player2Time = uint40(_values[1]);

        // take the lowest value as the winner
        address winner = race.player1Time <= race.player2Time ? race.player1 : race.player2;
        address loser = race.player1 == winner ? race.player2 : race.player1;

        race.state = RaceState.FINISHED;
        emit FinishedRace(_raceId, winner, loser);

        if (_mode == RaceMode.SOLO) {
            soloRaces[_raceId] = race;
        } else if (_mode == RaceMode.FREE) {
            freeRaces[_raceId] = race;
        } else {
            // Update racers ELO
            addressToPlayer[winner].ELO += 3;
            addressToPlayer[race.player1 == winner ? race.player2 : race.player1].ELO += 1;

            races[_raceId] = race;
            uint256 toPay = betAmount == 0 ? 0 : ((betAmount * 2) * 95) / 100;

            // Pay the winner
            (bool success,) = payable(winner).call{ value: toPay }("");
            if (!success) {
                revert Racing__WinnerPaymentFailed();
            }
        }
    }

    /**
     * @notice Allows to sponsorize the weekly prize pool with an arbitrary amount.
     */
    function sponsorWeeklyPrizePool() public payable {
        currentPrizePool += msg.value;
    }

    /*//////////////////////////////////////////////////////////////
                            GETTERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get the Race data for a solo race.
     * @param raceId The ID of the race.
     * @return The Race data struct for the given race ID.
     */
    function getSoloRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return soloRaces[raceId];
    }

    /**
     * @notice Get the Race data for a free race.
     * @param raceId The ID of the race.
     * @return The Race data struct for the given race ID.
     */
    function getFreeRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return freeRaces[raceId];
    }

    /**
     * @notice Get the Race data for a tournament race.
     * @param raceId The ID of the race.
     * @return The Race data struct for the given race ID.
     */
    function getRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return races[raceId];
    }

    /**
     * @notice Getter function to simplify the leaderboard creation every week.
     * Returns the parameters needed to get all player's address in the current weekly tournament.
     */
    function getWeekAndPlayerAmount() public view returns (uint256, uint256) {
        return (weeklyTournamentCounter, tournamentPlayersCounter);
    }

    /**
     * @notice Get the player's address for the weekly tournament.
     * @param week The week of the tournament. Starts at 1. Obtainable from getWeekAndPlayerAmount.
     * @param index The index of the player. Starts at 1. Obtainable from getWeekAndPlayerAmount.
     */
    function getPlayerAddressForWeeklyTournament(
        uint256 week,
        uint256 index
    )
        public
        view
        returns (address)
    {
        return weeklyBetPlayerIndex[week][index];
    }

    /*//////////////////////////////////////////////////////////////
                                RESTRICTED
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Allows to update the weather data for a circuit. Is also responsable for
     * distributing the prize pool every week. Called every hour for each circuit.
     * @param circuitIndex The index of the circuit.
     * @param data The new weather data for the circuit. Uint from 00 to 99 to represent a percent.
     */
    function updateWeatherDataForCircuit(uint256 circuitIndex, uint256 data) public onlyOwner {
        Circuits memory circuit = _getCircuit(circuitIndex);
        circuit.factors.weather = uint8(data);
        circuits[circuitIndex - 1] = circuit;

        _checkAndDistributePrizePool();
    }

    /**
     * @notice Allows to add new circuits to the game.
     * @param factors The external factors for the circuit. (see IRacing interface)
     * @param name The name of the circuit.
     */
    function addCircuit(ExternalFactors memory factors, string memory name) public onlyOwner {
        Circuits memory _circuit =
            Circuits({ factors: factors, index: circuits.length + 1, name: name });
        circuits.push(_circuit);
    }

    /**
     * @notice Allows to adjust the bet amount. Added for convenience.
     * @param _betAmount The new bet amount.
     */
    function setBetAmount(uint256 _betAmount) public onlyOwner {
        uint256 oldBetAmount = betAmount;
        betAmount = _betAmount;
        emit BetAmountUpdated(_betAmount, oldBetAmount);
    }

    /**
     * @notice Allows to pause the contract if any issues arise.
     * (see Pausable from openzeppelin contracts)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @notice Allows to unpause the contract. (see Pausable from openzeppelin contracts)
     *
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Allows to withdraws funds from the contract if needed.
     * Added for convenience. Ideally placed behind a multisig with a timelock.
     */
    function emergencyWithdraw() public onlyOwner {
        if (address(this).balance > 0) {
            (bool success,) = payable(owner()).call{ value: address(this).balance }("");
            if (!success) {
                revert Racing__EmergencyWithdrawFailed();
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                               PRIVATE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Adjusts the player attributes based on the luck factor. The total luck factor
     * can range from -9% to +10%. -5% to +5% is based on the random number, and the rest is
     * based on the player's luck attribute.
     * @param _attributes The player's attributes.
     * @param _randomNumber A random word received from the Chainlink VRF v2.5.
     * @return The adjusted player attributes.
     */
    function _applyLuckFactor(
        PlayerAttributes memory _attributes,
        uint256 _randomNumber
    )
        private
        pure
        returns (PlayerAttributes memory)
    {
        // Range from -5% to +5% based on the random number
        int256 baseLuck = int256((_randomNumber % 101) / 10) - 5;

        // Calculate final luck factor with influence from player's luck attribute
        // The luck influence ranges from -5 to +5
        int256 luckInfluence = (int256(uint256(_attributes.luck)) - 5);
        int256 luckFactor = baseLuck + luckInfluence;

        _attributes.reliability = _adjustAttribute(_attributes.reliability, luckFactor);
        _attributes.maniability = _adjustAttribute(_attributes.maniability, luckFactor);
        _attributes.speed = _adjustAttribute(_attributes.speed, luckFactor);
        _attributes.breaks = _adjustAttribute(_attributes.breaks, luckFactor);
        _attributes.car_balance = _adjustAttribute(_attributes.car_balance, luckFactor);
        _attributes.aerodynamics = _adjustAttribute(_attributes.aerodynamics, luckFactor);
        _attributes.driver_skills = _adjustAttribute(_attributes.driver_skills, luckFactor);
        _attributes.luck = _adjustAttribute(_attributes.luck, luckFactor); // Not used

        return _attributes;
    }

    /// @notice Adjusts the attribute based on the luck factor with two-digit precision.
    function _adjustAttribute(uint8 _attribute, int256 _luckFactor) private pure returns (uint8) {
        int256 adjusted = int256(uint256(_attribute) * 10) + _luckFactor;
        if (adjusted < 10) adjusted = 10; // Ensure minimum value of 1.0
        if (adjusted > 99) adjusted = 99; // Ensure maximum value of 9.9
        return uint8(uint256(adjusted));
    }

    /**
     * @notice Check that the timestamp is greater than the last prize distribution timestamp plus
     * the tournament
     * duration. If it is, one week has passed and the prize pool distribution will be triggered.
     */
    function _checkAndDistributePrizePool() private {
        if (block.timestamp >= lastPrizeDistribution + TOURNAMENT_DURATION) {
            lastPrizeDistribution = block.timestamp;
            _distributePrizePool();
        }
    }

    /**
     * @notice Distributes the prize pool every week. The player with the highest ELO will receive
     * the prize pool. The ELO of all playera will be reset to 1200. Each tournament is limited
     * to 100 players to prevent running out of gas during the prize pool distribution.
     */
    function _distributePrizePool() private {
        address topPlayer;
        uint16 highestELO = uint16(START_ELO);

        uint256 length =
            tournamentPlayersCounter >= MAX_BET_PLAYERS ? MAX_BET_PLAYERS : tournamentPlayersCounter;
        for (uint256 i = 1; i <= length;) {
            address playerAddress = weeklyBetPlayerIndex[weeklyTournamentCounter][i];
            Player memory player = addressToPlayer[playerAddress];

            uint16 playerELO = player.ELO;
            player.ELO = uint16(START_ELO); // Reset ELO
            addressToPlayer[playerAddress] = player;

            if (playerELO > highestELO) {
                highestELO = playerELO;
                topPlayer = player.playerAddress;
            }

            unchecked {
                ++i;
            }
        }

        if (topPlayer != address(0) && currentPrizePool > 0) {
            if (address(this).balance < currentPrizePool) {
                revert Racing__WeeklyPaymentInsufficientBalance();
            }
            (bool success,) = payable(topPlayer).call{ value: currentPrizePool }("");
            if (!success) {
                revert Racing__WeeklyPaymentFailed();
            }
            currentPrizePool = 0;
        }

        weeklyTournamentCounter++; // Increment the weekly tournament counter
        tournamentPlayersCounter = 0; // Reset the bet players counter
    }

    /*//////////////////////////////////////////////////////////////
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Handle the race status logic when a player join. Create a new
     * race if it doesn't exist. Update the current one if a player is waiting.
     * @param _circuitId The circuit ID.
     * @param _mode The mode of the race (SOLO, FREE, TOURNAMENT).
     * @return _ongoing A boolean indicating if the race has started or not.
     */
    function _updateRace(uint256 _circuitId, RaceMode _mode) private returns (bool _ongoing) {
        if (_mode == RaceMode.FREE) {
            if (freeRaces[freeRaceCounter].state == RaceState.NON_EXISTENT) {
                // Create a free new race
                Race memory _race = _createNewRace(_circuitId, _mode);
                freeRaces[freeRaceCounter] = _race;
            } else {
                if (msg.sender == freeRaces[freeRaceCounter].player1) {
                    revert Racing__PlayerAlreadyJoined();
                }
                // Update the current free race
                Race storage currentRace = freeRaces[freeRaceCounter];
                currentRace.state = RaceState.ONGOING;
                currentRace.player2 = msg.sender;
                _ongoing = true;
            }
        } else {
            if (races[raceCounter].state == RaceState.NON_EXISTENT) {
                // Create a new bet race
                Race memory _race = _createNewRace(_circuitId, _mode);
                races[raceCounter] = _race;
            } else {
                if (msg.sender == races[raceCounter].player1) {
                    revert Racing__PlayerAlreadyJoined();
                }
                // Update the current bet race
                Race storage currentRace = races[raceCounter];
                currentRace.state = RaceState.ONGOING;
                currentRace.player2 = msg.sender;
                _ongoing = true;
            }
        }
    }

    /**
     * @notice Handle the creation of a new race and update the appropriate mappings and counters.
     * @param _circuitId The circuit ID.
     * @param _mode The mode of the race (SOLO, FREE, TOURNAMENT).
     * @return Race struct with all the data updated.
     */
    function _createNewRace(
        uint256 _circuitId,
        RaceMode _mode
    )
        private
        view
        returns (Race memory)
    {
        return Race({
            circuit: _circuitId,
            mode: _mode,
            state: RaceState.WAITING,
            player1: msg.sender,
            player2: address(0),
            player1Time: 0,
            player2Time: 0
        });
    }

    /**
     * @notice Internal getter function to retrieve a Race struct based on the race ID and mode.
     * @param _raceId The ID of the race.
     * @param _mode The mode of the race (SOLO, FREE, TOURNAMENT)
     * @return Race struct of the race.
     */
    function _getRaceByMode(uint256 _raceId, RaceMode _mode) internal view returns (Race memory) {
        if (_mode == RaceMode.TOURNAMENT) {
            return races[_raceId];
        } else if (_mode == RaceMode.FREE) {
            return freeRaces[_raceId];
        } else {
            return soloRaces[_raceId];
        }
    }

    /**
     * @notice Internal function to verify the player's attributes received by the contract. The sum
     * of all attributes must be
     * equal to 40. Each attribute must be between 1 and 10.
     */
    function _verifyAttributes(PlayerAttributes memory _attributes) private pure {
        _checkAttribute(_attributes.reliability);
        _checkAttribute(_attributes.maniability);
        _checkAttribute(_attributes.speed);
        _checkAttribute(_attributes.breaks);
        _checkAttribute(_attributes.car_balance);
        _checkAttribute(_attributes.aerodynamics);
        _checkAttribute(_attributes.driver_skills);
        _checkAttribute(_attributes.luck);

        uint8 sum_of_attributes = _attributes.reliability + _attributes.maniability
            + _attributes.speed + _attributes.breaks + _attributes.car_balance
            + _attributes.aerodynamics + _attributes.driver_skills + _attributes.luck;

        if (sum_of_attributes != 40) {
            revert Racing__InvalidAttributesSum();
        }
    }

    function _checkAttribute(uint8 _attribute) private pure {
        if (_attribute < 1 || _attribute > 10) {
            revert Racing__InvalidAttribute();
        }
    }

    /**
     * @notice Internal function to retrieve a Circuit struct based on the circuit ID.
     * @param _circuitId The ID of the circuit.
     * @return Circuit struct of the circuit.
     */
    function _getCircuit(uint256 _circuitId) private view returns (Circuits memory) {
        uint256 index = _circuitId - 1;

        if (index > circuits.length) {
            revert Racing__CircuitNotFound();
        }
        return circuits[index];
    }

    /**
     * @notice Internal function to update the player's attributes with each new race. If the player
     * doesn't exist, a
     * new player will be created.
     * @param _player The player's address.
     * @param _attributes The player's attributes.
     */
    function updatePlayerAttributes(address _player, PlayerAttributes memory _attributes) private {
        addressToPlayer[_player].attributes = _attributes;

        if (weeklyBetPlayerAddressToIndex[weeklyTournamentCounter][_player] == 0) {
            tournamentPlayersCounter++;
            weeklyBetPlayerIndex[weeklyTournamentCounter][tournamentPlayersCounter] = _player;
            weeklyBetPlayerAddressToIndex[weeklyTournamentCounter][_player] =
                tournamentPlayersCounter;
        }
    }

    /**
     * @notice Internal function to create a new player and update the appropriate mappings and
     * counters.
     * @param _player The player's address.
     * @param _mode The mode of the race (SOLO, FREE, TOURNAMENT).
     * @param _attributes The player's attributes.
     */
    function _createPlayer(
        address _player,
        RaceMode _mode,
        PlayerAttributes memory _attributes
    )
        private
    {
        playersCounter++;
        Player memory newPlayer =
            Player({ attributes: _attributes, playerAddress: _player, ELO: uint16(START_ELO) });
        addressToPlayer[_player] = newPlayer;
        emit PlayerCreated(_player, _attributes, playersCounter);

        if (_mode == RaceMode.TOURNAMENT) {
            tournamentPlayersCounter++;
            weeklyBetPlayerIndex[weeklyTournamentCounter][tournamentPlayersCounter] = _player;
            weeklyBetPlayerAddressToIndex[weeklyTournamentCounter][_player] =
                tournamentPlayersCounter;
        }
    }
}
