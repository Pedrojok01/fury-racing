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
    VRFCoordinatorV2Interface immutable COORDINATOR;
    uint64 private immutable s_subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private immutable callbackGasLimit = 100_000; // Adjust gas limit based on the
        // requirements
    uint16 private immutable requestConfirmations = 3; // Confirmations the Chainlink node should
        // wait
    uint32 private immutable numWords = 1; // Number of random words to request

    // Chainlink parameters
    bytes32 private jobId;
    uint256 private fee;

    mapping(bytes32 => bool) internal requestIdIsBetRace; // RequestId to isBetRace
    mapping(bytes32 => mapping(bool => uint256)) internal requestIdToRaceId; // RequestId to
        // isBetRace to raceId

    // Events
    event RequestedRandomness(uint256 requestId);
    event RandomnessReceived(uint256 randomness);
    event RaceResultFulfilled(bytes32 indexed requestId, uint256[] values);
    event AuthorizedAddressUpdated(address indexed newAuthorized, address indexed oldAuthorized);

    modifier onlyAuthorized() {
        if (msg.sender != authorized) revert Racing__Unauthorized();
        _;
    }

    constructor(
        uint64 _subscriptionId,
        address _vrfCoordinator,
        address oracle,
        bytes32 _keyHash,
        bytes32 _jobId,
        uint256 _fee
    )
        VRFConsumerBaseV2(_vrfCoordinator)
        Ownable(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        s_subscriptionId = _subscriptionId;
        keyHash = _keyHash;

        _setChainlinkToken(0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846); // LINK address on Avax Fuji
            // Testnet
        _setChainlinkOracle(oracle);
        jobId = _jobId;
        fee = _fee; // Typically 0.1 * 10 ** 18; // 0.1 LINK
    }

    /// @notice Random Number Request
    // TODO: Fund subscription on both testnet and Mainnet.
    function requestRandomNumber() internal {
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

    /// @notice Race Result Data Request
    function requestRaceResult(
        uint256 circuit,
        uint256 raceId,
        bool isBetRace
    )
        internal
        returns (bytes32)
    {
        Chainlink.Request memory req =
            _buildChainlinkRequest(jobId, address(this), this.fulfillRaceResult.selector);
        req._add(
            "get",
            string.concat("https://api.yourracingapi.com/race_results/", Strings.toString(circuit))
        );
        req._add("path", "data,race_result"); // JSON path to retrieve race result from the response
        bytes32 requestId = _sendChainlinkRequest(req, fee);
        requestIdIsBetRace[requestId] = isBetRace;
        requestIdToRaceId[requestId][isBetRace] = raceId;

        return requestId;
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
        bool isBetRace = isBetRaceFromRequestId(_requestId);
        uint256 raceId = getRaceIdFromRequestId(_requestId, isBetRace);

        emit RaceResultFulfilled(_requestId, _values);

        _finishRace(raceId, isBetRace, _values);
    }

    /// @notice Helper function to determine if the race is a bet race.
    function isBetRaceFromRequestId(bytes32 _requestId) internal view returns (bool) {
        return requestIdIsBetRace[_requestId];
    }

    /// @notice Helper function to map requestId to raceId.
    function getRaceIdFromRequestId(
        bytes32 _requestId,
        bool isBetRace
    )
        internal
        view
        returns (uint256)
    {
        return requestIdToRaceId[_requestId][isBetRace];
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
        if (_authorized == address(0)) revert Racing__AddressZero();
        address old = authorized;
        authorized = _authorized;
        emit AuthorizedAddressUpdated(_authorized, old);
    }
}
