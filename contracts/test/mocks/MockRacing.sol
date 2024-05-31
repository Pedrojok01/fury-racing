// SPDX-License-Identifier: BSL-1.1
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
    uint256 public constant MAX_BET_PLAYERS = 100;

    uint256 public betAmount = 0.1 ether;
    uint256 public currentPrizePool;
    uint256 public lastPrizeDistribution;
    uint256 public playersCounter;
    uint256 public tournamentPlayersCounter;
    uint256 public weeklyTournamentCounter = 1;

    mapping(uint256 => Race) public soloRaces;
    mapping(uint256 => Race) public freeRaces;
    mapping(uint256 => Race) public races;
    uint256 public soloRaceCounter = 1;
    uint256 public freeRaceCounter = 1;
    uint256 public raceCounter = 1;

    // Get any exisitng Player struct by address
    mapping(address => Player) public addressToPlayer;

    // Additonal mapping related to weekly tournament
    mapping(uint256 => mapping(uint256 => address)) public weeklyBetPlayerIndex;
    mapping(uint256 => mapping(address => uint256)) public weeklyBetPlayerAddressToIndex;
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
        _createPlayer(AI_PLAYER_ADDRESS, RaceMode.SOLO, PlayerAttributes(5, 5, 5, 5, 5, 5, 5, 5));
        lastPrizeDistribution = block.timestamp;
    }

    fallback() external payable { }
    receive() external payable { }

    /*//////////////////////////////////////////////////////////////
                                RACES
    //////////////////////////////////////////////////////////////*/

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

        uint256 raceId = soloRaceCounter;

        addressToPlayer[AI_PLAYER_ADDRESS].attributes = attributes2;
        Race memory race = _createNewRace(circuitId, RaceMode.SOLO);
        race.state = RaceState.ONGOING;
        soloRaces[raceId] = race;
        soloRaceCounter++;

        emit SoloRaceStarted(msg.sender, raceId);
        requestRandomNumber(raceId, RaceMode.SOLO);
    }

    function joinFreeRace(PlayerAttributes memory attributes, uint256 circuitId) public {
        _verifyAttributes(attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(msg.sender, RaceMode.FREE, attributes);
        } else {
            addressToPlayer[msg.sender].attributes = attributes;
        }

        uint256 raceId = freeRaceCounter;
        bool ongoing = _updateRace(circuitId, raceId, RaceMode.FREE);
        emit JoinedRace(msg.sender, raceId);

        // Run race when it is full.
        if (ongoing) {
            emit FreeRaceStarted(raceId);
            freeRaceCounter++;
            requestRandomNumber(raceId, RaceMode.FREE);
        }
    }

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
            _createPlayer(msg.sender, RaceMode.TOURNAMENT, _attributes);
        } else {
            _updatePlayerAttributes(msg.sender, _attributes);
        }

        // 5% goes to weekly prize pool
        currentPrizePool += (msg.value * 5) / 100;

        uint256 raceId = raceCounter;
        bool ongoing = _updateRace(circuitId, raceId, RaceMode.TOURNAMENT);
        emit JoinedRace(msg.sender, raceId);

        // Run race when it is full.
        if (ongoing) {
            emit RaceStarted(raceId);
            raceCounter++;
            requestRandomNumber(raceId, RaceMode.TOURNAMENT);
        }
    }

    function _startRace(uint256[] memory _words, uint256 _raceId, RaceMode _mode) public override {
        Race memory _race = _getRaceByMode(_raceId, _mode);
        uint256 weather = uint256(_getCircuit(_race.circuit).factors.weather);

        PlayerAttributes[] memory attributes = new PlayerAttributes[](2);
        attributes[0] = _applyLuckFactor(addressToPlayer[_race.player1].attributes, _words[0]);
        attributes[1] = _applyLuckFactor(addressToPlayer[_race.player2].attributes, _words[1]);

        requestRaceResult(_race.circuit, _raceId, weather, _mode, attributes);
    }

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

    function sponsorWeeklyPrizePool() public payable {
        currentPrizePool += msg.value;
    }

    function getSoloRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return soloRaces[raceId];
    }

    function getFreeRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return freeRaces[raceId];
    }

    function getRaceFromRaceID(uint256 raceId) public view returns (Race memory) {
        return races[raceId];
    }

    function getWeekAndPlayerAmount() public view returns (uint256, uint256) {
        return (weeklyTournamentCounter, tournamentPlayersCounter);
    }

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

    function addCircuit(ExternalFactors memory factors, string memory name) public onlyOwner {
        Circuits memory _circuit =
            Circuits({ factors: factors, index: circuits.length + 1, name: name });
        circuits.push(_circuit);
    }

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

    function _updateWeatherDataForCircuit(uint256 circuitIndex, uint256 data) public override {
        Circuits memory circuit = _getCircuit(circuitIndex);
        circuit.factors.weather = uint8(data);
        circuits[circuitIndex - 1] = circuit;

        _checkAndDistributePrizePool();
    }

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

        weeklyTournamentCounter++; // Increment the weekly tournament counter
        tournamentPlayersCounter = 0; // Reset the bet players counter

        if (topPlayer != address(0) && currentPrizePool > 0) {
            if (address(this).balance < currentPrizePool) {
                revert Racing__WeeklyPaymentInsufficientBalance();
            }
            uint256 prize = currentPrizePool;
            currentPrizePool = 0;
            (bool success,) = payable(topPlayer).call{ value: prize }("");
            if (!success) {
                revert Racing__WeeklyPaymentFailed();
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    function _updateRace(
        uint256 _circuitId,
        uint256 _raceId,
        RaceMode _mode
    )
        public
        returns (bool _ongoing)
    {
        if (_mode == RaceMode.FREE) {
            if (freeRaces[_raceId].state == RaceState.NON_EXISTENT) {
                // Create a new free race
                Race memory _race = _createNewRace(_circuitId, _mode);
                freeRaces[_raceId] = _race;
            } else {
                if (msg.sender == freeRaces[_raceId].player1) {
                    revert Racing__PlayerAlreadyJoined();
                }
                // Update the current free race
                Race storage currentRace = freeRaces[_raceId];
                currentRace.state = RaceState.ONGOING;
                currentRace.player2 = msg.sender;
                _ongoing = true;
            }
        } else {
            if (races[_raceId].state == RaceState.NON_EXISTENT) {
                // Create a new bet race
                Race memory _race = _createNewRace(_circuitId, _mode);
                races[_raceId] = _race;
            } else {
                if (msg.sender == races[_raceId].player1) {
                    revert Racing__PlayerAlreadyJoined();
                }
                // Update the current bet race
                Race storage currentRace = races[_raceId];
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

    function _updatePlayerAttributes(address _player, PlayerAttributes memory _attributes) public {
        addressToPlayer[_player].attributes = _attributes;

        if (weeklyBetPlayerAddressToIndex[weeklyTournamentCounter][_player] == 0) {
            tournamentPlayersCounter++;
            weeklyBetPlayerIndex[weeklyTournamentCounter][tournamentPlayersCounter] = _player;
            weeklyBetPlayerAddressToIndex[weeklyTournamentCounter][_player] =
                tournamentPlayersCounter;
        }
    }

    function _createPlayer(
        address _player,
        RaceMode _mode,
        PlayerAttributes memory _attributes
    )
        public
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
