// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "openzeppelin/utils/Strings.sol";
import "chainlink/ChainlinkClient.sol";
import "Errors.sol";

contract Racing is ChainlinkClient {
    using Strings for uint8;
    using Chainlink for Chainlink.Request;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event PlayerCreated(TeamAttributes attributes, uint64 TeamId);
    event JoinedRace(uint64 TeamId);
    event StartedRace(uint64[] racers);
    event FinishedRace(uint8[] leaderboard);
    event RequestedLeaderboard(bytes32 indexed requestId, uint256 value);

    /*//////////////////////////////////////////////////////////////
                          CHAINLINK CONSTANTS
    //////////////////////////////////////////////////////////////*/

    string public id;
    bytes32 private jobId;
    uint256 private fee;

    /*//////////////////////////////////////////////////////////////
                         MISCELLANEOUS CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public playerBet = 0.1 ether;
    uint256 private playersCounter = 0;
    uint256 private startELO = 1200;

    /*//////////////////////////////////////////////////////////////
                               RACE STATE
    //////////////////////////////////////////////////////////////*/

    enum RaceState {
        WAITING,
        ONGOING,
        FINISHED
    }

    State public state; // The current state of the race: waiting for players, started, done.
    uint256 public races; // Count of completed races.
    uint256[] players; // Count of players

    /*//////////////////////////////////////////////////////////////
                             CIRCUIT STORAGE
    //////////////////////////////////////////////////////////////*/

    struct ExternalFactors {
        uint8 Weather; // Precipitation level as how many days it rains per year (0, 33: Low | 33, 66: Medimum | 66,
        // 100: High)
        uint8 Crashes; // Safest level (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint16 Full_Throttle; // Full throttle in % (0, 33: Low | 33, 66: Medimum | 66, 100: High)
        uint8 Downforce; // Downforce level (33: Low | 66: Medimum | 100: High)
        uint16 Top_Speed; // Top Speed in km/h
    }

    mapping(uint256 => ExternalFactors) public circuits;

    /*//////////////////////////////////////////////////////////////
                             TEAMS STORAGE
    //////////////////////////////////////////////////////////////*/

    struct PlayerAttributes {
        uint8 reliability;
        uint8 pitstops;
        uint8 speed;
        uint8 drivers;
        uint8 strategy;
        uint8 cornering;
        uint8 luck;
        uint8 car_balance;
        uint8 staff;
        uint8 aerodynamics;
        address player;
        uint16 ELO;
    }

    mapping(address => uint256) public AddressToPlayer;
    mapping(uint256 => PlayerAttributes) public AddressToAttributes;
    uint64[] private racers;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _link, address _oracle) {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = "7d80a6386ef543a3abb52817f6707e3b";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)

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
        PlayerToAttributes[playersCounter] = _attributes;

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
        PlayerToAttributes[AddressToPlayer[msg.sender]] = _attributes;
    }

    /*//////////////////////////////////////////////////////////////
                                RACES
    //////////////////////////////////////////////////////////////*/

    /// @notice Join the queue for the upcoming race.
    function joinRace() external onlyWhenWaiting {
        // Participation fee (requires approval).
        // TODO: Add adjusted fee based on GOO mechanic
        require(Goo.transferFrom(msg.sender, address(this), 0.01 ether));

        uint64 team = AddressToTeam[msg.sender];

        // Add team ID to the list of current racers.
        racers.push(team);

        emit JoinedRace(team);

        // Run race when it is full.
        if (racers.length == 5) {
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
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        // Set the URL to perform the GET request on
        req.add(
            "get",
            string.concat(
                "https://app.gradient.city/api/",
                Strings.toString(_circuit)
            )
        );

        req.add("path", "val"); // Chainlink nodes 1.0.0 and later support this format

        int256 timesAmount = 1;
        req.addInt("times", timesAmount);

        return sendChainlinkRequest(req, fee);
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
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyWhenWaiting() {
        require(state == State.WAITING, "RACE_IS_ACTIVE");

        _;
    }

    function _verifyAttributes(TeamAttributes memory _attributes) private pure {
        _checkAttribute(_attributes.Reliability);
        _checkAttribute(_attributes.Pitstops);
        _checkAttribute(_attributes.Speed);
        _checkAttribute(_attributes.Drivers);
        _checkAttribute(_attributes.Strategy);
        _checkAttribute(_attributes.Cornering);
        _checkAttribute(_attributes.Luck);
        _checkAttribute(_attributes.Car_balance);
        _checkAttribute(_attributes.Staff);
        _checkAttribute(_attributes.Aerodynamics);

        uint8 sum_of_attributes = _attributes.Reliability +
            _attributes.Pitstops +
            _attributes.Speed +
            _attributes.Drivers +
            _attributes.Strategy +
            _attributes.Cornering +
            _attributes.Luck +
            _attributes.Car_balance +
            _attributes.Staff +
            _attributes.Aerodynamics;

        if (sum_of_attributes < 10 || sum_of_attributes > 50) {
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
