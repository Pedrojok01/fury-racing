// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/Chainlink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Errors.sol";

abstract contract ChainlinkFeed is VRFConsumerBaseV2, ChainlinkClient, Ownable {
    using Strings for uint8;
    using Chainlink for Chainlink.Request;

    address private authorized;

    // VRF parameters
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 private s_subscriptionId;
    bytes32 private keyHash;
    uint32 private callbackGasLimit = 100_000; // Adjust gas limit based on the requirements
    uint16 private requestConfirmations = 3; // Number of confirmations the Chainlink node should
        // wait before responding
    uint32 private numWords = 1; // The number of random words to request

    // Weather API parameters
    bytes32 private jobId;
    uint256 private fee;
    string public weatherData; // To store the response of weather API

    // Mappings for requestId to raceId and whether it's a bet race
    mapping(bytes32 => uint256) internal requestIdToRaceId;
    mapping(bytes32 => bool) internal requestIdIsBetRace;

    // Events
    event RequestedRandomness(uint256 requestId);
    event RandomnessReceived(uint256 randomness);
    event WeatherRequestFulfilled(string weather);
    event RaceResultFulfilled(bytes32 indexed requestId, uint256[] values);

    modifier onlyAuthorized() {
        if (msg.sender != authorized) revert Racing__Unauthorized();
        _;
    }

    constructor(
        uint64 subscriptionId,
        address vrfCoordinator,
        address oracle,
        bytes32 _keyHash,
        bytes32 _jobId,
        uint256 _fee
    )
        VRFConsumerBaseV2(vrfCoordinator)
        Ownable(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;

        _setChainlinkToken(0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846); // LINK address on Avax Fuji
            // Testnet
        _setChainlinkOracle(oracle);
        jobId = _jobId;
        fee = _fee; // Typically 0.1 * 10 ** 18; // 0.1 LINK
            // fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /// @notice Random Number Request
    function requestRandomNumber() internal {
        // TODO: Fund subscription on both testnet and Mainnet.
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash, s_subscriptionId, requestConfirmations, callbackGasLimit, numWords
        );

        emit RequestedRandomness(requestId);
    }

    function fulfillRandomWords(
        uint256,
        /* requestId */
        uint256[] memory randomWords
    )
        internal
        override
    {
        uint256 randomResult = randomWords[0];
        emit RandomnessReceived(randomResult);
    }

    /// @notice Weather Data Request
    function requestWeatherData(string memory circuitName) internal returns (bytes32) {
        Chainlink.Request memory req =
            _buildChainlinkRequest(jobId, address(this), this.fulfillWeatherData.selector);
        req._add(
            "get",
            string.concat(
                "https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=", circuitName
            )
        );
        req._add("path", "data,weather"); // JSON path to retrieve weather from the response
        return _sendChainlinkRequest(req, fee);
    }

    function fulfillWeatherData(
        bytes32 _requestId,
        string memory _data
    )
        public
        recordChainlinkFulfillment(_requestId)
    {
        weatherData = _data;
        emit WeatherRequestFulfilled(_data);
    }

    /// @notice Race Result Data Request
    function requestRaceResult(uint256 circuit) internal returns (bytes32) {
        Chainlink.Request memory req =
            _buildChainlinkRequest(jobId, address(this), this.fulfillRaceResult.selector);
        req._add(
            "get",
            string.concat("https://api.yourracingapi.com/race_results/", Strings.toString(circuit))
        );
        req._add("path", "data,race_result"); // JSON path to retrieve race result from the response
        return _sendChainlinkRequest(req, fee);
    }

    /// @notice Receives race result.
    function fulfillRaceResult(
        bytes32 _requestId,
        uint256[] memory _values
    )
        public
        recordChainlinkFulfillment(_requestId)
        onlyAuthorized
    {
        uint256 raceId = getRaceIdFromRequestId(_requestId);
        bool isBetRace = isBetRaceFromRequestId(_requestId);

        emit RaceResultFulfilled(_requestId, _values);

        _finishRace(raceId, isBetRace, _values);
    }

    /// @notice Helper function to map requestId to raceId.
    function getRaceIdFromRequestId(bytes32 _requestId) internal view returns (uint256) {
        return requestIdToRaceId[_requestId];
    }

    /// @notice Helper function to determine if the race is a bet race.
    function isBetRaceFromRequestId(bytes32 _requestId) internal view returns (bool) {
        return requestIdIsBetRace[_requestId];
    }

    function _finishRace(
        uint256 raceId,
        bool isBetRace,
        uint256[] memory values
    )
        internal
        virtual;

    /// @notice Set authorized address to send the race results
    function setAuthorized(address _authorized) external onlyOwner {
        if (authorized == address(0)) revert Racing__AddressZero();
        authorized = _authorized;
    }
}
