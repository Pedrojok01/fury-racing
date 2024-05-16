// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ChainlinkFeed } from "./ChainlinkFeed.sol";
import { IRacing } from "./interface/IRacing.sol";
import "./Errors.sol";

contract Racing is ChainlinkFeed, Pausable, IRacing {
    uint256 private constant TOURNAMENT_DURATION = 1 weeks; // TODO: handle prize pool every week
    uint256 private constant START_ELO = 1200;

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
        address _link,
        address _oracle,
        uint64 _subscriptionId,
        address _vrfCoordinator,
        address oracle,
        bytes32 _keyHash,
        bytes32 _jobId,
        uint256 _fee
    )
        ChainlinkFeed(_subscriptionId, _vrfCoordinator, oracle, _keyHash, _jobId, _fee)
    {
        _setChainlinkToken(_link);
        _setChainlinkOracle(_oracle);

        // TODO: Add function to update weather data
        // Monaco = 1
        circuits[0] = Circuits({ factors: ExternalFactors(17, 66, 59, 90, 290), name: "Monaco" });
        lastPrizeDistribution = block.timestamp;
    }

    /*//////////////////////////////////////////////////////////////
                                RACES
    //////////////////////////////////////////////////////////////*/

    /// @notice Join the queue for the upcoming free race or start the free race.
    function joinFreeRace(PlayerAttributes memory _attributes) public {
        // Validate input attributes.
        _verifyAttributes(_attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(_attributes);
        } else {
            addressToPlayer[msg.sender].attributes = _attributes;

            
        }

        bool ongoing = _updateFreeRace();
        emit JoinedRace(msg.sender);

        // Run race when it is full.
        if (ongoing) {
            emit FreeRaceStarted(freeRaceCounter);
            _startRace(0, freeRaceCounter, false); // TODO: handle multiple circuits
        }
    }

    /// @notice Join the queue for the upcoming race or start the race.
    function joinRace(PlayerAttributes memory _attributes) public payable whenNotPaused {
        // Validate input bet amount.
        if (msg.value != betAmount) {
            revert Racing__InvalidBetAmount();
        }

        // Validate input attributes.
        _verifyAttributes(_attributes);

        // Create new player if it doesn't exist.
        if (addressToPlayer[msg.sender].playerAddress == address(0)) {
            _createPlayer(_attributes);
        } else {
            addressToPlayer[msg.sender].attributes = _attributes;

          if (betPlayerAddressToIndex[msg.sender] == 0) {
                betPlayerIndex[++betPlayersCounter] = msg.sender;
                betPlayerAddressToIndex[msg.sender] = betPlayersCounter;
            }

        }

        // 5% goes to weekly prize pool
        currentPrizePool += (msg.value * 5) / 100;

        bool ongoing = _updateRace();

        emit JoinedRace(msg.sender);

        // Run race when it is full.
        if (ongoing) {
            emit RaceStarted(raceCounter);
            _startRace(0, raceCounter, true);
             _checkAndDistributePrizePool();
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
        address loser = race.player1 == winner ? race.player2 : race.player1;
        uint256 toPay = betAmount == 0 ? 0 : ((betAmount * 2) * 95) / 100;

        // Update racers ELO
        addressToPlayer[winner].ELO += 3;
        addressToPlayer[loser].ELO += 1;

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
        if (circuitIndex >= circuits.length) {
            revert Racing__CircuitNotFound();
        }
        Circuits memory circuit = _getCircuit(circuitIndex);
        circuit.factors.weather = uint8(data);

        circuits[circuitIndex] = circuit;
    }

    /// @notice Allows to add a new circuits
    function addCircuit(Circuits memory _circuit) external onlyOwner {
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
        (bool success,) = payable(owner()).call{ value: address(this).balance }("");
        if (!success) {
            revert Racing__EmergencyWithdrawFailed();
        }
    }

    /*//////////////////////////////////////////////////////////////
                               PRIVATE
    //////////////////////////////////////////////////////////////*/

    /// @notice Calls for simulations.
    function _startRace(uint256 index, uint256 raceId, bool isBetRace) internal {
        // Request random number and weather data
        requestRandomNumber();

        // Request race result (Data to be added)
        requestRaceResult(index, raceId, isBetRace);
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

        // TODO: Find a way to handle this without looping through all players
        // chainlink function from backend to get top player?
        uint256 length = betPlayersCounter >= 200 ? 200 : betPlayersCounter;
        for (uint256 i = 0; i < length;) {
            address playerAddress = betPlayerIndex[i];
            Player memory player = addressToPlayer[playerAddress];

            uint16 playerELO = player.ELO;
            player.ELO = uint16(START_ELO); // Reset ELO
            addressToPlayer[playerAddress] = player; // Update player

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
    function _updateFreeRace() private returns (bool _ongoing) {
        // Check if there is an ongoing race
        if (freeRaces[freeRaceCounter].state == RaceState.WAITING) {
            // Update the current race
            Race memory currentRace = freeRaces[freeRaceCounter];
            currentRace.state = RaceState.ONGOING;
            currentRace.player2 = msg.sender;

            freeRaces[freeRaceCounter] = currentRace;
            _ongoing = true;
        } else {
            // Create a new race
            ++freeRaceCounter;
            freeRaces[freeRaceCounter] = Race({
                state: RaceState.WAITING,
                player1: msg.sender,
                player2: address(0),
                player1Time: 0,
                player2Time: 0
            });
        }
    }

    /// @notice Create a racing player with the given attributes.
    function _updateRace() private returns (bool _ongoing) {
        // Check if there is an ongoing race
        if (races[raceCounter].state == RaceState.WAITING) {
            // Update the current race
            Race memory currentRace = races[raceCounter];
            currentRace.state = RaceState.ONGOING;
            currentRace.player2 = msg.sender;

            races[raceCounter] = currentRace;
            _ongoing = true;
        } else {
            // Create a new race
            ++raceCounter;
            races[raceCounter] = Race({
                state: RaceState.WAITING,
                player1: msg.sender,
                player2: address(0),
                player1Time: 0,
                player2Time: 0
            });
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

    function _getCircuit(uint256 index) private view returns (Circuits memory) {
        return circuits[index];
    }

    function _createPlayer(PlayerAttributes memory _attributes) private {
        ++playersCounter;
        Player memory newPlayer =
            Player({ attributes: _attributes, playerAddress: msg.sender, ELO: uint16(START_ELO) });
        addressToPlayer[msg.sender] = newPlayer;
        emit PlayerCreated(msg.sender, _attributes, playersCounter);
    }
}
