// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/Chainlink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainlinkFeed is VRFConsumerBaseV2, ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    // VRF parameters
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100_000; // Adjust gas limit based on the requirements
    uint16 requestConfirmations = 3; // Number of confirmations the Chainlink node should wait before responding
    uint32 numWords = 1; // The number of random words to request

    // Weather API parameters
    bytes32 public jobId;
    uint256 public fee;
    string public weatherData; // To store the response of weather API

    // Events
    event RandomnessRequestSent(uint256 requestId);
    event RandomnessReceived(uint256 randomness);
    event WeatherRequestFulfilled(string weather);

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

        _setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB); // LINK token address on Polygon (Mumbai Testnet
            // example)
        _setChainlinkOracle(oracle);
        jobId = _jobId;
        fee = _fee; // Typically 0.1 * 10 ** 18; // 0.1 LINK
            // fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    // Random Number Request
    function requestRandomNumber() external onlyOwner {
        // Will revert if subscription is not set and funded.
        uint256 requestId =
            COORDINATOR.requestRandomWords(keyHash, s_subscriptionId, requestConfirmations, callbackGasLimit, numWords);

        emit RandomnessRequestSent(requestId);
    }

    function fulfillRandomWords(uint256, /* requestId */ uint256[] memory randomWords) internal override {
        uint256 randomResult = randomWords[0];
        emit RandomnessReceived(randomResult);
    }

    // Weather Data Request
    function requestWeatherData(string memory url) public onlyOwner {
        Chainlink.Request memory request =
            _buildChainlinkRequest(jobId, address(this), this.fulfillWeatherData.selector);
        request._add("get", url);
        request._add("path", "data,weather"); // JSON path to retrieve weather from the response
        _sendChainlinkRequest(request, fee);
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
}
