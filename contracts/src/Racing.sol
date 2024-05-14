// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ChainlinkFeed} from "./ChainlinkFeed.sol";
import {IRacing} from "./interface/IRacing.sol";
import "./Errors.sol";

contract Racing is IRacing, ChainlinkFeed {
    using Strings for uint8;

    uint256 public betAmount = 0.1 ether;
    uint256 private playersCounter = 0;
    uint256 private startELO = 1200;

    RaceState public raceState; // The current state of the race: waiting for players, started, done.
    uint256 public races; // Count of completed races.
    uint256[] players; // Count of players

    // mapping(uint256 => ExternalFactors) public circuits;
    ExternalFactors[] public circuits;

    /*//////////////////////////////////////////////////////////////
                             TEAMS STORAGE
    //////////////////////////////////////////////////////////////*/

    mapping(address => uint256) public AddressToPlayer;
    mapping(uint256 => PlayerAttributes) public AddressToAttributes;
    uint256[] private racers;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _link,
        address _oracle,
        uint64 subscriptionId,
        address vrfCoordinator,
        address oracle,
        bytes32 _keyHash,
        bytes32 _jobId,
        uint256 _fee
    )
        ChainlinkFeed(
            subscriptionId,
            vrfCoordinator,
            oracle,
            _keyHash,
            _jobId,
            _fee
        )
    {
        _setChainlinkToken(_link);
        _setChainlinkOracle(_oracle);

        /*//////////////////////////////////////////////////////////////
                                  CIRCUITS
        //////////////////////////////////////////////////////////////*/

        // Set the external attributes for the tracks

        // Bahrain = 0
        circuits.push(ExternalFactors(2, 8, 72, 66, 330));

        // Saudi Arabia = 1
        circuits.push(ExternalFactors(1, 66, 79, 66, 330));

        // Australia = 2
        circuits.push(ExternalFactors(25, 5, 70, 80, 310));
    }

    /*//////////////////////////////////////////////////////////////
                            TEAM MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a racing player with the given attributes.
    /// @param _attributes Attributes selected the racing player.
    function createPlayer(PlayerAttributes memory _attributes) external {
        // Only one team per address.
        if (AddressToPlayer[msg.sender] != 0) {
            revert Racing__PlayerAlreadyCreated();
        }

        // Verify the given attributes are valid.
        _verifyAttributes(_attributes);

        // Increase team count (using as ID).
        ++playersCounter;

        // Add team ID to the list of active teams.
        players.push(playersCounter);

        // Configure mappings with team attributes and principal address.
        AddressToPlayer[msg.sender] = playersCounter;
        AddressToAttributes[playersCounter] = _attributes;

        emit PlayerCreated(_attributes, playersCounter);
    }

    /// @notice Upgrade the attributes of an existing racing team. Charges a mechanic fee.
    /// @param _attributes New attributes for the racing team.
    function upgradePlayer(
        PlayerAttributes memory _attributes
    ) external onlyWhenWaiting {
        // Mechanic fee (requires approval).
        // TODO: Add adjusted fee based on GOO mechanic

        // Verify given team attributes.
        _verifyAttributes(_attributes);

        // Update team attributes.
        AddressToAttributes[AddressToPlayer[msg.sender]] = _attributes;
    }

    /*//////////////////////////////////////////////////////////////
                                RACES
    //////////////////////////////////////////////////////////////*/

    /// @notice Join the queue for the upcoming race.
    function joinRace() external onlyWhenWaiting {
        // Participation fee (requires approval).
        // TODO: Add adjusted fee based on GOO mechanic
        // require(Goo.transferFrom(msg.sender, address(this), 0.01 ether));

        uint256 player = AddressToPlayer[msg.sender];

        // Add team ID to the list of current racers.
        racers.push(player);

        emit JoinedRace(player);

        // Run race when it is full.
        if (racers.length == 2) {
            startRace();
        }
    }

    /// @notice Execute the run when it is full.
    function startRace() internal {
        emit StartedRace(racers);

        // Gets current circuit and calls simulations to generate leaderboard.
        requestLeaderboard(_getCircuit());
    }

    /// @notice Finishes the race and pays the winners following the received leaderboard.
    function finishRace(uint256 values) internal {
        // The leaderboard is sorted from the lowest average lap time for the 10 laps. Payouts are given when the
        // leaderboard is generated.
        // TODO: Create leaderboard array from uint256
        uint8[] memory leaderboard;

        emit FinishedRace(leaderboard);
    }

    /*//////////////////////////////////////////////////////////////
                               CHAINLINK
    //////////////////////////////////////////////////////////////*/

    /// @notice Calls for simulations.
    function requestLeaderboard(uint8 _circuit) internal returns (bytes32) {
        // Chainlink.Request memory req = _buildChainlinkRequest(
        //     jobId,
        //     address(this),
        //     this.fulfill.selector
        // );
        // // Set the URL to perform the GET request on
        // req.add(
        //     "get",
        //     string.concat(
        //         "https://app.gradient.city/api/",
        //         Strings.toString(_circuit)
        //     )
        // );
        // req.add("path", "val"); // Chainlink nodes 1.0.0 and later support this format
        // int256 timesAmount = 1;
        // req.addInt("times", timesAmount);
        // return _sendChainlinkRequest(req, fee);
    }

    /// @notice Receives leaderboard for race.
    function fulfill(
        bytes32 _requestId,
        uint256 _value
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestedLeaderboard(_requestId, _value);

        finishRace(_value);
    }

    /*//////////////////////////////////////////////////////////////
                                PRIVATE
    //////////////////////////////////////////////////////////////*/

    function setBetAmount(uint256 _betAmount) external onlyOwner {
        uint256 oldBetAmount = betAmount;
        betAmount = _betAmount;
        emit BetAmountUpdated(_betAmount, oldBetAmount);
    }

    /*//////////////////////////////////////////////////////////////
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyWhenWaiting() {
        if (raceState != RaceState.WAITING) {
            revert Racing__RaceAlreadyOngoing();
        }
        _;
    }

    function _verifyAttributes(
        PlayerAttributes memory _attributes
    ) private pure {
        _checkAttribute(_attributes.reliability);
        _checkAttribute(_attributes.speed);
        _checkAttribute(_attributes.driver);
        _checkAttribute(_attributes.strategy);
        _checkAttribute(_attributes.cornering);
        _checkAttribute(_attributes.car_balance);
        _checkAttribute(_attributes.aerodynamics);
        _checkAttribute(_attributes.luck);

        uint8 sum_of_attributes = _attributes.reliability +
            _attributes.speed +
            _attributes.driver +
            _attributes.strategy +
            _attributes.cornering +
            _attributes.car_balance +
            _attributes.aerodynamics +
            _attributes.luck;

        if (sum_of_attributes < 10 || sum_of_attributes > 40) {
            revert Racing__InvalidAttributesSum();
        }
    }

    function _checkAttribute(uint8 _attribute) private pure {
        if (_attribute < 1 || _attribute > 10) {
            revert Racing__InvalidAttribute();
        }
    }

    function _getCircuit() private returns (uint8) {
        // TODO: Implement circuit selection
    }
}
