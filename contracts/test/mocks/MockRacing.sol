// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import { MockChainlinkFeed } from "./MockChainlinkFeed.sol";
import { Script, console2 } from "forge-std/Script.sol";

import "../../src/Errors.sol";

import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MockRacing is Script, MockChainlinkFeed, Pausable, ReentrancyGuard {
    address constant AI_PLAYER_ADDRESS = 0x00000000000000000000000000000000000000A1;
    uint256 public constant TOURNAMENT_DURATION = 1 weeks;
    uint256 public constant START_ELO = 1200;
    uint256 public constant MAX_BET_PLAYERS = 200; // TODO: Find alternate way to remove hard cap

    uint256 public betAmount = 0.1 ether;
    uint256 public currentPrizePool;
    uint256 public lastPrizeDistribution;
    uint256 public playersCounter;
    uint256 public betPlayersCounter;

    mapping(uint256 => Race) public soloRaces;
    mapping(uint256 => Race) public freeRaces;
    mapping(uint256 => Race) public races;
    uint256 public soloRaceCounter = 1;
    uint256 public freeRaceCounter = 1;
    uint256 public raceCounter = 1;

    mapping(address => Player) public addressToPlayer;
    mapping(uint256 => address) public betPlayerIndex;
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
        MockChainlinkFeed(_router, _vrfCoordinator)
    {
        ROUTER = _router;
        VRF_SUBSCRIPTION_ID = _vrfSubscriptionId;
        FUNCTIONS_SUBSCRIPTION_ID = _functionSubscriptionId;
        KEY_HASH = _keyHash;
        DON_ID = _donID;

        addCircuit(ExternalFactors(17, 66, 59, 90, 290), "Monaco");
        _createPlayer(AI_PLAYER_ADDRESS, PlayerAttributes(5, 5, 5, 5, 5, 5, 5, 5));
        lastPrizeDistribution = block.timestamp;
    }

    fallback() external payable { }
    receive() external payable { }

    /*//////////////////////////////////////////////////////////////
                                RACES
    //////////////////////////////////////////////////////////////*/

    /// @notice Play for fun instantly against the AI.
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
            _createPlayer(msg.sender, attributes1);
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

    /// @notice Join the queue for the upcoming free race or start the free race.
    function joinFreeRace(PlayerAttributes memory attributes, uint256 circuitId) public {
        _verifyAttributes(attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, attributes);
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

    /// @notice Join the queue for the upcoming race or start the race.
    function joinRace(
        PlayerAttributes memory _attributes,
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

        _verifyAttributes(_attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, _attributes);
        } else {
            updatePlayerAttributes(msg.sender, _attributes);
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

    /// @notice Calls for simulations.
    function _startRace(uint256[] memory _words, uint256 _raceId, RaceMode _mode) public override {
        Race memory _race = _getRaceByMode(_raceId, _mode);
        uint256 weather = uint256(_getCircuit(_race.circuit).factors.weather);

        PlayerAttributes[] memory attributes = new PlayerAttributes[](2);
        attributes[0] = _applyLuckFactor(addressToPlayer[_race.player1].attributes, _words[0]);
        attributes[1] = _applyLuckFactor(addressToPlayer[_race.player2].attributes, _words[1]);

        requestRaceResult(_race.circuit, _raceId, weather, _mode, attributes);
    }

    /// @notice Finishes the race and pays the winners following the received race result.
    function _finishRace(
        uint256 _raceId,
        RaceMode _mode,
        uint256[] memory _values
    )
        public
        override
    {
        Race memory race = _getRaceByMode(_raceId, _mode);
        race.player1Time = uint40(_values[0]);
        race.player2Time = uint40(_values[1]);

        // take the lowest value as the winner
        address winner = race.player1Time <= race.player2Time ? race.player1 : race.player2;

        race.state = RaceState.FINISHED;
        emit FinishedRace(_raceId, winner);

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

    function getSoloRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return soloRaces[raceId];
    }

    function getRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return races[raceId];
    }

    function getFreeRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return freeRaces[raceId];
    }

    /*//////////////////////////////////////////////////////////////
                                RESTRICTED
    //////////////////////////////////////////////////////////////*/

    /// @notice Allows to add a new circuits
    function updateWeatherDataForCircuit(uint256 circuitIndex, uint256 data) public onlyOwner {
        Circuits memory circuit = _getCircuit(circuitIndex);
        circuit.factors.weather = uint8(data);
        circuits[circuitIndex - 1] = circuit;

        _checkAndDistributePrizePool();
    }

    /// @notice Allows to add a new circuits
    function addCircuit(ExternalFactors memory factors, string memory name) public onlyOwner {
        Circuits memory _circuit =
            Circuits({ factors: factors, index: circuits.length + 1, name: name });
        circuits.push(_circuit);
    }

    /// @notice Allows to adjust the bet amount per tournament race
    function setBetAmount(uint256 _betAmount) public onlyOwner {
        uint256 oldBetAmount = betAmount;
        betAmount = _betAmount;
        emit BetAmountUpdated(_betAmount, oldBetAmount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Allows to withdraws funds from the contract if needed.
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

    /// @notice Adjusts the player attributes based on the luck factor.
    function _applyLuckFactor(
        PlayerAttributes memory _attributes,
        uint256 _randomNumber
    )
        public
        pure
        returns (PlayerAttributes memory)
    {
        // Range from -5% to +5% based on the random number
        int256 baseLuck = int256((_randomNumber % 101) / 10) - 5;

        // Calculate final luck factor with influence from player's luck attribute
        // The luck influence ranges from -5 to +5
        int256 luckInfluence = (int256(uint256(_attributes.luck)) - 5);
        int256 luckFactor = baseLuck + luckInfluence;

        // Adjust all attributes based on the luck factor
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
    function _adjustAttribute(uint8 _attribute, int256 _luckFactor) public pure returns (uint8) {
        int256 adjusted = int256(uint256(_attribute) * 10) + _luckFactor;
        if (adjusted < 10) adjusted = 10; // Ensure minimum value of 1.0
        if (adjusted > 99) adjusted = 99; // Ensure maximum value of 9.9
        return uint8(uint256(adjusted));
    }

    function _checkAndDistributePrizePool() public {
        if (block.timestamp >= lastPrizeDistribution + TOURNAMENT_DURATION) {
            lastPrizeDistribution = block.timestamp;
            _distributePrizePool();
        }
    }

    function _distributePrizePool() public {
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
    function _updateRace(uint256 _circuitId, RaceMode _mode) public returns (bool _ongoing) {
        if (_mode == RaceMode.FREE) {
            if (freeRaces[freeRaceCounter].state == RaceState.NON_EXISTENT) {
                // Create a new free race
                Race memory _race = _createNewRace(_circuitId, _mode);
                freeRaces[freeRaceCounter] = _race;
            } else {
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
                // Update the current bet race
                Race storage currentRace = races[raceCounter];
                currentRace.state = RaceState.ONGOING;
                currentRace.player2 = msg.sender;
                _ongoing = true;
            }
        }
    }

    function _createNewRace(
        uint256 _circuitId,
        RaceMode _mode
    )
        internal
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

    function _getRaceByMode(uint256 _raceId, RaceMode _mode) public view returns (Race memory) {
        if (_mode == RaceMode.TOURNAMENT) {
            return races[_raceId];
        } else if (_mode == RaceMode.FREE) {
            return freeRaces[_raceId];
        } else {
            return soloRaces[_raceId];
        }
    }

    function _verifyAttributes(PlayerAttributes memory _attributes) public pure {
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

    function _checkAttribute(uint8 _attribute) public pure {
        if (_attribute < 1 || _attribute > 10) {
            revert Racing__InvalidAttribute();
        }
    }

    function _getCircuit(uint256 _circuitId) public view returns (Circuits memory) {
        uint256 index = _circuitId - 1;

        if (index > circuits.length) {
            revert Racing__CircuitNotFound();
        }
        return circuits[index];
    }

    function updatePlayerAttributes(address _player, PlayerAttributes memory _attributes) public {
        addressToPlayer[_player].attributes = _attributes;

        if (betPlayerAddressToIndex[_player] == 0) {
            betPlayerIndex[++betPlayersCounter] = _player;
            betPlayerAddressToIndex[_player] = betPlayersCounter;
        }
    }

    function _createPlayer(address _player, PlayerAttributes memory _attributes) public {
        ++playersCounter;
        Player memory newPlayer =
            Player({ attributes: _attributes, playerAddress: _player, ELO: uint16(START_ELO) });
        addressToPlayer[_player] = newPlayer;
        emit PlayerCreated(_player, _attributes, playersCounter);
    }
}
