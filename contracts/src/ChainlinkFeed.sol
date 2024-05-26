// SPDX-License-Identifier: BSL-1.1
pragma solidity 0.8.24;

import "./Errors.sol";
import { IRacing } from "./interface/IRacing.sol";

import { FunctionsClient } from "@chainlink/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

import { ConfirmedOwner } from "@chainlink/v0.8/shared/access/ConfirmedOwner.sol";
import { VRFConsumerBaseV2Plus } from "@chainlink/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { IVRFCoordinatorV2Plus } from "@chainlink/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import { VRFV2PlusClient } from "@chainlink/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { FunctionsSource } from "./FunctionsSource.sol";

/**
 * | Function Name             | Sighash  | Function Signature                 |
 * | ------------------------- | -------- | ---------------------------------- |
 * | getRandomRequestFromID    | 073afa16 | getRandomRequestFromID(uint256)    |
 * | getFunctionsRequestFromID | ef747798 | getFunctionsRequestFromID(bytes32) |
 */

/**
 * @title ChainlinkFeed - Abstract contract containing Chainlink VRF and Functions logic;
 * @author @Pedrojok01
 */
abstract contract ChainlinkFeed is
    FunctionsClient,
    ConfirmedOwner,
    VRFConsumerBaseV2Plus,
    IRacing
{
    using Strings for uint8;
    using FunctionsRequest for FunctionsRequest.Request;

    // Chainlink VRF parameters
    IVRFCoordinatorV2Plus internal immutable COORDINATOR;
    bytes32 internal immutable KEY_HASH;
    uint256 internal immutable VRF_SUBSCRIPTION_ID;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant VRF_GAS_LIMIT = 2_500_000;
    uint32 private constant NUM_WORDS = 2;

    // Chainlink Functions parameters
    address internal immutable ROUTER;
    uint64 internal immutable FUNCTIONS_SUBSCRIPTION_ID;
    uint32 private constant FUNCTIONS_GAS_LIMIT = 300_000;
    bytes32 internal immutable DON_ID;

    mapping(uint256 => RandomRequests) private requestIdToRandomRequests;
    mapping(bytes32 => FunctionsRequests) private requestIdToFunctionsRequests;
    mapping(bytes32 => RaceMode) private requestIdToRaceMode;
    mapping(bytes32 => uint256) private requestIdToRaceId;

    // Events
    event RequestedRandomness(uint256 requestId, uint32 numWords);
    event RandomnessReceived(uint256 requestId, uint256[] randomWords);
    event RaceResultFulfilled(bytes32 indexed requestId, uint256[] values);

    constructor(
        address _router,
        address _vrfCoordinator
    )
        VRFConsumerBaseV2Plus(_vrfCoordinator)
        FunctionsClient(_router)
    {
        COORDINATOR = IVRFCoordinatorV2Plus(_vrfCoordinator);
    }

    function getRandomRequestFromID(uint256 id) public view returns (RandomRequests memory) {
        return requestIdToRandomRequests[id];
    }

    function getFunctionsRequestFromID(bytes32 id) public view returns (FunctionsRequests memory) {
        return requestIdToFunctionsRequests[id];
    }

    /*//////////////////////////////////////////////////////////////
                            CHAINLINK VRF v2.5
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Request two random words from Chainlink VRF v2.5
     * @param raceId The ID of the race
     * @param mode The selected mode (SOLO, FREE, TOURNAMENT)
     * @return requestId The request ID for the Chainlink VRF request
     */
    function requestRandomNumber(
        uint256 raceId,
        RaceMode mode
    )
        internal
        returns (uint256 requestId)
    {
        requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: VRF_SUBSCRIPTION_ID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: VRF_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({ nativePayment: false })
                )
            })
        );

        requestIdToRandomRequests[requestId] =
            RandomRequests({ fulfilled: false, exists: true, randomWords: new uint256[](0) });

        requestIdToRaceMode[bytes32(requestId)] = mode;
        requestIdToRaceId[bytes32(requestId)] = raceId;

        emit RequestedRandomness(requestId, NUM_WORDS);
    }

    /**
     * @notice Receives random words from Chainlink VRF v2.5 callback
     * @param requestId The request ID for the Chainlink VRF request
     * @param randomWords The random words received from Chainlink VRF
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    )
        internal
        override
    {
        if (!requestIdToRandomRequests[requestId].exists) {
            revert ChainlinkFeed__InvalidRandomRequestId();
        }

        requestIdToRandomRequests[requestId].fulfilled = true;
        requestIdToRandomRequests[requestId].randomWords = randomWords;

        emit RandomnessReceived(requestId, randomWords);

        _startRace(
            randomWords,
            requestIdToRaceId[bytes32(requestId)], // raceId
            requestIdToRaceMode[bytes32(requestId)] // raceMode
        );
    }

    /*//////////////////////////////////////////////////////////////
                            CHAINLINK FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Request the player's times via Chainlink Functions
     * @param circuit The selected circuit index
     * @param raceId The ID of the race
     * @param weather The real-time weather for the selected circuit
     * @param mode The selected mode (SOLO, FREE, TOURNAMENT)
     * @param attributes The car attributes selected by the player (see IRacing.sol)
     */
    function requestRaceResult(
        uint256 circuit,
        uint256 raceId,
        uint256 weather,
        RaceMode mode,
        PlayerAttributes[] memory attributes
    )
        internal
        returns (bytes32 _requestId)
    {
        string[] memory args = new string[](1);
        args[0] = formatFunctionsArgs(circuit, weather, attributes);

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(FunctionsSource.getRaceResult());

        if (args.length > 0) req.setArgs(args);

        // Send the request and store the request ID
        _requestId =
            _sendRequest(req.encodeCBOR(), FUNCTIONS_SUBSCRIPTION_ID, FUNCTIONS_GAS_LIMIT, DON_ID);

        requestIdToFunctionsRequests[_requestId] =
            FunctionsRequests({ fulfilled: false, exists: true, results: new uint256[](0) });

        requestIdToRaceMode[_requestId] = mode;
        requestIdToRaceId[_requestId] = raceId;

        return _requestId;
    }

    /**
     * @notice Receives the race results from Chainlink Functions callback
     * @param requestId The request ID for the Chainlink Functions request
     * @param response The response received from Chainlink Functions
     * @param err The error received from Chainlink Functions, if any. Unused here.
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    )
        internal
        override
    {
        if (!requestIdToFunctionsRequests[requestId].exists) {
            revert ChainlinkFeed__InvalidFunctionRequestId();
        }

        requestIdToFunctionsRequests[requestId].fulfilled = true;

        uint256 combinedResult = abi.decode(response, (uint256));
        uint256 value1 = combinedResult >> 128;
        uint256 value2 = combinedResult & ((1 << 128) - 1);

        uint256[] memory values = new uint256[](2);
        values[0] = value1;
        values[1] = value2;

        requestIdToFunctionsRequests[requestId].results = values;

        emit RaceResultFulfilled(requestId, values);

        _finishRace(requestIdToRaceId[requestId], requestIdToRaceMode[requestId], values);
    }

    /*//////////////////////////////////////////////////////////////
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Formats the arguments for the Chainlink Functions request
     * @param circuit The selected circuit index
     * @param weather The real-time weather for the selected circuit
     * @param attributes The car attributes selected by the player (see IRacing.sol)
     */
    function formatFunctionsArgs(
        uint256 circuit,
        uint256 weather,
        PlayerAttributes[] memory attributes
    )
        private
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                _formatCircuitIndex(circuit),
                Strings.toString(weather),
                _formatPlayerAttributes(attributes[0]),
                _formatPlayerAttributes(attributes[1])
            )
        );
    }

    /**
     * @notice Formats the circuit index for the Chainlink Functions request
     * @param _circuitIndex The selected circuit index
     * @return The formatted circuit index into a 2 digits number
     */
    function _formatCircuitIndex(uint256 _circuitIndex) private pure returns (string memory) {
        if (_circuitIndex == 0) {
            revert ChainlinkFeed__InvalidCircuitIndex();
        }

        uint256 adjustedIndex = _circuitIndex - 1;

        // Format as two-digit string
        if (adjustedIndex < 10) {
            return string(abi.encodePacked("0", Strings.toString(adjustedIndex)));
        } else {
            return Strings.toString(adjustedIndex);
        }
    }

    /**
     * @notice Formats the player's attributes for the Chainlink Functions request
     * @param _attributes The car attributes selected by the player (see IRacing.sol)
     * @return The formatted player's attributes into a string (16 digits number
     *        with each two digit representing an attribute from 10 to 99 to account for a potential
     * decimal)
     */
    function _formatPlayerAttributes(PlayerAttributes memory _attributes)
        private
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                Strings.toString(_attributes.reliability),
                Strings.toString(_attributes.maniability),
                Strings.toString(_attributes.speed),
                Strings.toString(_attributes.breaks),
                Strings.toString(_attributes.car_balance),
                Strings.toString(_attributes.aerodynamics),
                Strings.toString(_attributes.driver_skills),
                Strings.toString(_attributes.luck)
            )
        );
    }

    function _startRace(uint256[] memory words, uint256 raceId, RaceMode modes) internal virtual;

    function _finishRace(uint256 raceId, RaceMode mode, uint256[] memory values) internal virtual;
}
