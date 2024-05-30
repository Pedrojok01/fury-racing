// SPDX-License-Identifier: BSL-1.1
pragma solidity 0.8.24;

import { Script, console2 } from "forge-std/Script.sol";

import "../../src/Errors.sol";
import { IRacing } from "../../src/interface/IRacing.sol";

import { FunctionsClient } from "@chainlink/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

import { ConfirmedOwner } from "@chainlink/v0.8/shared/access/ConfirmedOwner.sol";
import { VRFConsumerBaseV2Plus } from "@chainlink/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { IVRFCoordinatorV2Plus } from "@chainlink/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import { VRFV2PlusClient } from "@chainlink/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { FunctionsSource } from "../../src/FunctionsSource.sol";

abstract contract MockChainlinkFeed is
    Script,
    FunctionsClient,
    ConfirmedOwner,
    VRFConsumerBaseV2Plus,
    IRacing
{
    using Strings for uint8;
    using FunctionsRequest for FunctionsRequest.Request;

    // Chainlink VRF parameters
    IVRFCoordinatorV2Plus public immutable COORDINATOR;
    bytes32 public immutable KEY_HASH;
    uint256 public immutable VRF_SUBSCRIPTION_ID;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant VRF_GAS_LIMIT = 2_500_000;
    uint32 public constant NUM_WORDS = 2;

    // Chainlink Functions parameters
    address public immutable ROUTER;
    uint64 public immutable FUNCTIONS_SUBSCRIPTION_ID;
    uint32 private constant FUNCTIONS_GAS_LIMIT = 300_000;
    bytes32 public immutable DON_ID;

    mapping(uint256 => RandomRequests) public requestIdToRandomRequests;
    mapping(bytes32 => FunctionsRequests) public requestIdToFunctionsRequests;
    mapping(bytes32 => RaceMode) public requestIdToRaceMode;
    mapping(bytes32 => uint256) public requestIdToRaceId;

    mapping(RaceMode => mapping(uint256 => uint256)) private raceIdModeToRandomRequestId;
    mapping(RaceMode => mapping(uint256 => bytes32)) private raceIdModeToFunctionsRequestId;

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

    function getRandomWords(uint256 raceId, RaceMode mode) public view returns (uint256[] memory) {
        uint256 requestId = raceIdModeToRandomRequestId[mode][raceId];
        return requestIdToRandomRequests[requestId].randomWords;
    }

    function getRaceResults(uint256 raceId, RaceMode mode) public view returns (uint256[] memory) {
        bytes32 requestId = raceIdModeToFunctionsRequestId[mode][raceId];
        return requestIdToFunctionsRequests[requestId].results;
    }

    /*//////////////////////////////////////////////////////////////
                            CHAINLINK VRF v2.5
    //////////////////////////////////////////////////////////////*/

    function requestRandomNumber(
        uint256 raceId,
        RaceMode mode
    )
        public
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
        raceIdModeToRandomRequestId[mode][raceId] = requestId;

        emit RequestedRandomness(requestId, NUM_WORDS);
    }

    function _fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) public {
        fulfillRandomWords(requestId, randomWords);
    }

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

    function requestRaceResult(
        uint256 circuit,
        uint256 raceId,
        uint256 weather,
        RaceMode mode,
        PlayerAttributes[] memory attributes
    )
        public
        returns (bytes32 _requestId)
    {
        // Logic modified for testing purposes: requestId hardcoded
        _requestId = keccak256(abi.encodePacked(raceId, mode, circuit));

        requestIdToFunctionsRequests[_requestId] =
            FunctionsRequests({ fulfilled: false, exists: true, results: new uint256[](0) });

        requestIdToRaceMode[_requestId] = mode;
        requestIdToRaceId[_requestId] = raceId;
        raceIdModeToFunctionsRequestId[mode][raceId] = _requestId;

        return _requestId;
    }

    function _fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) public {
        fulfillRequest(requestId, response, err);
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory
    )
        internal
        override
    {
        if (!requestIdToFunctionsRequests[requestId].exists) {
            revert ChainlinkFeed__InvalidFunctionRequestId();
        }

        requestIdToFunctionsRequests[requestId].fulfilled = true;

        // Decode the response bytes into an array of uint256 values
        uint256[] memory values = abi.decode(response, (uint256[]));
        requestIdToFunctionsRequests[requestId].results = values;

        emit RaceResultFulfilled(requestId, values);

        _finishRace(requestIdToRaceId[requestId], requestIdToRaceMode[requestId], values);
    }

    /*//////////////////////////////////////////////////////////////
                                HELPERS
    //////////////////////////////////////////////////////////////*/

    function formatFunctionsArgs(
        uint256 circuit,
        uint256 weather,
        PlayerAttributes[] memory attributes
    )
        public
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

    function _formatCircuitIndex(uint256 _circuitIndex) public pure returns (string memory) {
        if (_circuitIndex == 0) {
            revert ChainlinkFeed__InvalidCircuitIndex();
        }

        // Adjust for the array index
        uint256 adjustedIndex = _circuitIndex - 1;

        // Format as two-digit string
        if (adjustedIndex < 10) {
            return string(abi.encodePacked("0", Strings.toString(adjustedIndex)));
        } else {
            return Strings.toString(adjustedIndex);
        }
    }

    function _formatPlayerAttributes(PlayerAttributes memory _attributes)
        public
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

    function _startRace(uint256[] memory words, uint256 raceId, RaceMode mode) public virtual;

    function _finishRace(uint256 raceId, RaceMode mode, uint256[] memory values) public virtual;
}
