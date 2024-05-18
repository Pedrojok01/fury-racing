// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ChainlinkFeed } from "./ChainlinkFeed.sol";

import "./Errors.sol";

import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Racing is ChainlinkFeed, Pausable, ReentrancyGuard {
    uint256 private constant TOURNAMENT_DURATION = 1 weeks;
    uint256 private constant START_ELO = 1200;
    uint256 private constant MAX_BET_PLAYERS = 200; // TODO: Find alternate way to remove hard cap

    uint256 public betAmount = 0.1 ether;
    uint256 public currentPrizePool;
    uint256 public lastPrizeDistribution;
    uint256 public playersCounter;
    uint256 public betPlayersCounter;

    mapping(uint256 => Race) private freeRaces;
    mapping(uint256 => Race) private races;
    uint256 public freeRaceCounter;
    uint256 public raceCounter;

    mapping(address => Player) public addressToPlayer;
    mapping(uint256 => address) private betPlayerIndex;
    mapping(address => uint256) public betPlayerAddressToIndex;
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

        addCircuit(ExternalFactors(17, 66, 59, 90, 290), "Monaco"); // 1
        lastPrizeDistribution = block.timestamp;
    }

    fallback() external payable { }
    receive() external payable { }

    /*//////////////////////////////////////////////////////////////
                                RACES
    //////////////////////////////////////////////////////////////*/

    /// @notice Join the queue for the upcoming free race or start the free race.
    // TODO: Allow multiple circuits
    function joinFreeRace(PlayerAttributes memory _attributes) public {
        _verifyAttributes(_attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, _attributes);
        } else {
            addressToPlayer[msg.sender].attributes = _attributes;
        }

        emit JoinedRace(freeRaceCounter, msg.sender);

        // Run race when it is full.
        if (_updateFreeRace(1)) {
            emit FreeRaceStarted(freeRaceCounter);
            requestRandomNumber(freeRaceCounter, false);
        }
    }

    /// @notice Join the queue for the upcoming race or start the race.
    function joinRace(PlayerAttributes memory _attributes)
        public
        payable
        whenNotPaused
        nonReentrant
    {
        // Validate input bet amount.
        if (msg.value != betAmount) {
            revert Racing__InvalidBetAmount();
        }

        // Validate input attributes.
        _verifyAttributes(_attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, _attributes);
        } else {
            updatePlayerAttributes(msg.sender, _attributes);
        }

        // 5% goes to weekly prize pool
        currentPrizePool += (msg.value * 5) / 100;

        emit JoinedRace(raceCounter, msg.sender);

        // Run race when it is full.
        if (_updateRace(1)) {
            emit RaceStarted(raceCounter);
            requestRandomNumber(raceCounter, true);
        }
    }

    /// @notice Finishes the race and pays the winners following the received race result.
    function _finishRace(
        uint256 raceId,
        bool isBetRace,
        uint256[] memory values
    )
        internal
        override
    {
        Race memory race = isBetRace ? races[raceId] : freeRaces[raceId];

        // Update the race times
        race.player1Time = uint40(values[0]);
        race.player2Time = uint40(values[1]);

        // take the lowest value as the winner
        address winner = race.player1Time <= race.player2Time ? race.player1 : race.player2;
        uint256 toPay = betAmount == 0 ? 0 : ((betAmount * 2) * 95) / 100;

        // Update racers ELO
        addressToPlayer[winner].ELO += 3;
        addressToPlayer[race.player1 == winner ? race.player2 : race.player1].ELO += 1;

        race.state = RaceState.FINISHED;
        emit FinishedRace(raceId, winner);

        if (!isBetRace) {
            freeRaces[raceId] = race;
        } else {
            races[raceId] = race;

            // Pay the winner
            (bool success,) = payable(winner).call{ value: toPay }("");
            if (!success) {
                revert Racing__WinnerPaymentFailed();
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                                RESTRICTED
    //////////////////////////////////////////////////////////////*/

    /// @notice Allows to add a new circuits
    function UpdateWeatherDataForCircuit(uint256 circuitIndex, uint256 data) external onlyOwner {
        Circuits memory circuit = _getCircuit(circuitIndex);
        circuit.factors.weather = uint8(data);
        circuits[circuitIndex - 1] = circuit;

        _checkAndDistributePrizePool();
    }

    //// @notice Allows to add a new circuits
    function addCircuit(ExternalFactors memory factors, string memory name) public onlyOwner {
        Circuits memory _circuit =
            Circuits({ factors: factors, index: circuits.length + 1, name: name });
        circuits.push(_circuit);
    }

    /// @notice Allows to adjust the bet amount per tournament race
    function setBetAmount(uint256 _betAmount) external onlyOwner {
        uint256 oldBetAmount = betAmount;
        betAmount = _betAmount;
        emit BetAmountUpdated(_betAmount, oldBetAmount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Allows to withdraws funds from the contract if needed.
    function emergencyWithdraw() external onlyOwner {
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

    /// @notice Calls for simulations.
    function _startRace(uint256[] memory words, uint256 raceId, bool isBetRace) internal override {
        Race memory _race = isBetRace ? races[raceId] : freeRaces[raceId];

        PlayerAttributes[] memory attributes = new PlayerAttributes[](2);
        attributes[0] = _applyLuckFactor(addressToPlayer[_race.player1].attributes, words[0]);
        attributes[1] = _applyLuckFactor(addressToPlayer[_race.player2].attributes, words[1]);

        // Request race result (TODO: add weather data)
        requestRaceResult(_race.circuit, attributes);
    }

    /// @notice Adjusts the player attributes based on the luck factor.
    function _applyLuckFactor(
        PlayerAttributes memory _attributes,
        uint256 randomNumber
    )
        private
        pure
        returns (PlayerAttributes memory)
    {
        // Range from -5% to +5% based on the random number
        int256 baseLuck = int256((randomNumber % 101) / 10) - 5;

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
    function _adjustAttribute(uint8 attribute, int256 luckFactor) private pure returns (uint8) {
        int256 adjusted = int256(uint256(attribute) * 10) + luckFactor;
        if (adjusted < 10) adjusted = 10; // Ensure minimum value of 1.0
        if (adjusted > 99) adjusted = 99; // Ensure maximum value of 9.9
        return uint8(uint256(adjusted));
    }

    function _checkAndDistributePrizePool() private {
        if (block.timestamp >= lastPrizeDistribution + TOURNAMENT_DURATION) {
            lastPrizeDistribution = block.timestamp;
            _distributePrizePool();
        }
    }

    function _distributePrizePool() private {
        address topPlayer;
        uint16 highestELO = uint16(START_ELO);

        uint256 length = betPlayersCounter >= MAX_BET_PLAYERS ? MAX_BET_PLAYERS : betPlayersCounter;
        for (uint256 i = 1; i <= length;) {
            address playerAddress = betPlayerIndex[i];
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
    }

    /*//////////////////////////////////////////////////////////////
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a racing player with the given attributes.
    function _updateFreeRace(uint256 _circuitIndex) private returns (bool _ongoing) {
        // Check if there is an ongoing race
        if (freeRaces[freeRaceCounter].state == RaceState.WAITING) {
            // Update the current race
            Race storage currentRace = freeRaces[freeRaceCounter];
            currentRace.state = RaceState.ONGOING;
            currentRace.player2 = msg.sender;
            _ongoing = true;
        } else {
            // Create a new race
            ++freeRaceCounter;
            freeRaces[freeRaceCounter] = Race({
                state: RaceState.WAITING,
                circuit: _circuitIndex,
                player1: msg.sender,
                player2: address(0),
                player1Time: 0,
                player2Time: 0
            });
        }
    }

    /// @notice Create a racing player with the given attributes.
    function _updateRace(uint256 _circuitIndex) private returns (bool _ongoing) {
        // Check if there is an ongoing race
        if (races[raceCounter].state == RaceState.WAITING) {
            // Update the current race
            Race storage currentRace = races[raceCounter];
            currentRace.state = RaceState.ONGOING;
            currentRace.player2 = msg.sender;
            _ongoing = true;
        } else {
            // Create a new race
            ++raceCounter;

            Race memory _race = Race({
                state: RaceState.WAITING,
                circuit: _circuitIndex,
                player1: msg.sender,
                player2: address(0),
                player1Time: 0,
                player2Time: 0
            });

            races[raceCounter] = _race;
        }
    }

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

    function _getCircuit(uint256 circuit) private view returns (Circuits memory) {
        uint256 circuitIndex = circuit - 1;

        if (circuitIndex > circuits.length) {
            revert Racing__CircuitNotFound();
        }
        return circuits[circuitIndex];
    }

    function updatePlayerAttributes(address player, PlayerAttributes memory _attributes) private {
        addressToPlayer[player].attributes = _attributes;

        if (betPlayerAddressToIndex[player] == 0) {
            betPlayerIndex[++betPlayersCounter] = player;
            betPlayerAddressToIndex[player] = betPlayersCounter;
        }
    }

    function _createPlayer(address player, PlayerAttributes memory _attributes) private {
        ++playersCounter;
        Player memory newPlayer =
            Player({ attributes: _attributes, playerAddress: player, ELO: uint16(START_ELO) });
        addressToPlayer[player] = newPlayer;
        emit PlayerCreated(player, _attributes, playersCounter);
    }
}
