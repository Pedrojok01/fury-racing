// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./Errors.sol";
import { IRacing } from "./interface/IRacing.sol";

import { FunctionsRequest } from "@chainlink/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import { FunctionsClient } from "@chainlink/v0.8/functions/v1_3_0/FunctionsClient.sol";

import { ConfirmedOwner } from "@chainlink/v0.8/shared/access/ConfirmedOwner.sol";
import { LinkTokenInterface } from "@chainlink/v0.8/shared/interfaces/LinkTokenInterface.sol";
import { VRFConsumerBaseV2Plus } from "@chainlink/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { IVRFCoordinatorV2Plus } from "@chainlink/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import { VRFV2PlusClient } from "@chainlink/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

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
    uint32 private constant CALLBACK_GAS_LIMIT = 2_500_000;
    uint32 private constant NUM_WORDS = 2;

    // Chainlink Functions parameters
    address internal immutable ROUTER;
    uint64 internal immutable FUNCTIONS_SUBSCRIPTION_ID;
    bytes32 internal immutable DON_ID;

    struct RandomRequests {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    struct FunctionsRequests {
        bool fulfilled;
        bool exists;
        uint256[] results;
    }

    mapping(uint256 => RandomRequests) private requestIdToRandomRequests;
    mapping(bytes32 => FunctionsRequests) private requestIdToFunctionsRequests;
    mapping(bytes32 => bool) private requestIdIsBetRace;
    mapping(bytes32 => uint256) private requestIdToRaceId;

    // Events
    event RequestedRandomness(uint256 requestId, uint32 numWords);
    event RandomnessReceived(uint256 requestId, uint256[] randomWords);
    event RaceResultFulfilled(bytes32 indexed requestId, uint256[] values);

    // JavaScript source code to fetch race results
    string private constant SOURCE_CODE = string(
        abi.encodePacked(
            "const data = args[0];",
            "const raceResultRequest = Functions.makeHttpRequest({",
            "url: 'https://racerback.azurewebsites.net/api/races/data',",
            "method: 'POST',",
            "data: { data: data }",
            "});",
            "const raceResultResponse = await raceResultRequest;",
            "const raceResult = raceResultResponse.data.race_result;",
            "return Functions.encodeUint256Array(raceResult);"
        )
    );

    constructor(
        address _router,
        address _vrfCoordinator
    )
        VRFConsumerBaseV2Plus(_vrfCoordinator)
        FunctionsClient(_router)
    {
        COORDINATOR = IVRFCoordinatorV2Plus(_vrfCoordinator);
    }

    /// @notice Random Number Request
    // TODO: Fund subscription on both testnet and Mainnet.
    function requestRandomNumber(
        uint256 raceId,
        bool isBetRace
    )
        internal
        returns (uint256 requestId)
    {
        requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: VRF_SUBSCRIPTION_ID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({ nativePayment: false })
                )
            })
        );

        requestIdToRandomRequests[requestId] =
            RandomRequests({ fulfilled: false, exists: true, randomWords: new uint256[](0) });

        requestIdIsBetRace[bytes32(requestId)] = isBetRace;
        requestIdToRaceId[bytes32(requestId)] = raceId;

        emit RequestedRandomness(requestId, NUM_WORDS);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
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
            requestIdIsBetRace[bytes32(requestId)] // isBetRace
        );
    }

    /// @notice Race Result Data Request
    function requestRaceResult(
        uint256 circuit,
        PlayerAttributes[] memory attributes
    )
        internal
        returns (bytes32 _requestId)
    {
        FunctionsRequest.Request memory req = initializeRequest(circuit, attributes);

        // Send the request and store the request ID
        _requestId =
            _sendRequest(req.encodeCBOR(), FUNCTIONS_SUBSCRIPTION_ID, CALLBACK_GAS_LIMIT, DON_ID);

        requestIdToFunctionsRequests[_requestId] =
            FunctionsRequests({ fulfilled: false, exists: true, results: new uint256[](0) });
    }

    /// @notice Receives race result.
    function _fulfillRequest(
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

        _finishRace(requestIdToRaceId[requestId], requestIdIsBetRace[requestId], values);
    }

    function initializeRequest(
        uint256 circuit,
        PlayerAttributes[] memory attributes
    )
        private
        pure
        returns (FunctionsRequest.Request memory req)
    {
        req.initializeRequest(
            FunctionsRequest.Location.Inline, FunctionsRequest.CodeLanguage.JavaScript, SOURCE_CODE
        );

        string[] memory args = new string[](1);
        args[0] = string(
            abi.encodePacked(
                Strings.toString(circuit),
                "00", // weather placeholder
                formatPlayerAttributes(attributes[0]),
                formatPlayerAttributes(attributes[1])
            )
        );

        req.setArgs(args);
        return req;
    }

    function formatPlayerAttributes(PlayerAttributes memory attributes)
        private
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                Strings.toString(attributes.reliability),
                Strings.toString(attributes.maniability),
                Strings.toString(attributes.speed),
                Strings.toString(attributes.breaks),
                Strings.toString(attributes.car_balance),
                Strings.toString(attributes.aerodynamics),
                Strings.toString(attributes.driver_skills),
                Strings.toString(attributes.luck)
            )
        );
    }

    function _startRace(uint256[] memory words, uint256 raceId, bool isBetRace) internal virtual;

    function _finishRace(
        uint256 raceId,
        bool isBetRace,
        uint256[] memory values
    )
        internal
        virtual;
}
