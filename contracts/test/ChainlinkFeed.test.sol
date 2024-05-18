// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/Errors.sol";
import { BaseTestSetup } from "./BaseTestSetup.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Test, console2 } from "forge-std/Test.sol";

contract ChainlinkFeedTest is BaseTestSetup {
    using Strings for uint8;

    function setUp() public {
        setUpBase();
    }

    function testRequestRandomNumber() public {
        vm.startPrank(player1);
        uint256 raceId = 1;
        bool isBetRace = true;

        uint256 requestId = racing.requestRandomNumber(raceId, isBetRace);

        RandomRequests memory request = racing.getRandomRequestFromID(requestId);
        assert(request.exists);
        assert(!request.fulfilled);
        assertEq(request.randomWords.length, 0);

        bool betRace = racing.requestIdIsBetRace(bytes32(requestId));
        uint256 storedRaceId = racing.requestIdToRaceId(bytes32(requestId));
        assertEq(betRace, isBetRace);
        assertEq(storedRaceId, raceId);

        vm.stopPrank();
    }

    function testFulfillRandomWords() public {
        vm.startPrank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1);
        vm.stopPrank();

        vm.startPrank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2);
        vm.stopPrank();

        uint256 raceId = 1;
        bool isBetRace = true;

        uint256 requestId = racing.requestRandomNumber(raceId, isBetRace);
        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = uint256(keccak256(abi.encodePacked("random_word_1")));
        randomWords[1] = uint256(keccak256(abi.encodePacked("random_word_2")));

        racing._fulfillRandomWords(requestId, randomWords);

        RandomRequests memory request = racing.getRandomRequestFromID(requestId);
        assert(request.exists);
        assert(request.fulfilled);
        assertEq(request.randomWords[0], randomWords[0]);
        assertEq(request.randomWords[1], randomWords[1]);

        vm.stopPrank();
    }

    function testFormatFunctionsArgs() public view {
        uint256 circuit = 1;
        PlayerAttributes[] memory attributes = new PlayerAttributes[](2);
        attributes[0] = attributesAfterLuck1;
        attributes[1] = attributesAfterLuck2;

        string memory expectedArg = string(
            abi.encodePacked(
                racing.formatCircuitIndex(circuit),
                "00",
                racing.formatPlayerAttributes(attributes[0]),
                racing.formatPlayerAttributes(attributes[1])
            )
        );

        string memory manualArg = "000050505050505050508070605040303040";
        string memory arg = racing.formatFunctionsArgs(circuit, attributes);
        assertEq(expectedArg, manualArg);
        assertEq(arg, manualArg);
    }

    function testFormatPlayerAttributes() public view {
        string memory formattedAttributes = racing.formatPlayerAttributes(attributesAfterLuck1);

        string memory expected = string(
            abi.encodePacked(
                Strings.toString(attributesAfterLuck1.reliability),
                Strings.toString(attributesAfterLuck1.maniability),
                Strings.toString(attributesAfterLuck1.speed),
                Strings.toString(attributesAfterLuck1.breaks),
                Strings.toString(attributesAfterLuck1.car_balance),
                Strings.toString(attributesAfterLuck1.aerodynamics),
                Strings.toString(attributesAfterLuck1.driver_skills),
                Strings.toString(attributesAfterLuck1.luck)
            )
        );

        string memory manualString = "5050505050505050";
        assertEq(formattedAttributes, manualString);
        assertEq(formattedAttributes, expected);
    }

    function testFormatCircuitIndex() public view {
        // Test for single-digit circuit indices
        string memory formattedIndex1 = racing.formatCircuitIndex(1);
        string memory expectedIndex1 = "00";
        assertEq(formattedIndex1, expectedIndex1);

        string memory formattedIndex2 = racing.formatCircuitIndex(2);
        string memory expectedIndex2 = "01";
        assertEq(formattedIndex2, expectedIndex2);

        string memory formattedIndex9 = racing.formatCircuitIndex(10);
        string memory expectedIndex9 = "09";
        assertEq(formattedIndex9, expectedIndex9);

        // Test for double-digit circuit indices
        string memory formattedIndex10 = racing.formatCircuitIndex(11);
        string memory expectedIndex10 = "10";
        assertEq(formattedIndex10, expectedIndex10);

        string memory formattedIndex15 = racing.formatCircuitIndex(16);
        string memory expectedIndex15 = "15";
        assertEq(formattedIndex15, expectedIndex15);
    }

    function testFulfillRequest() public {
        vm.startPrank(player1);
        uint256 circuit = 1;
        PlayerAttributes[] memory attributes = new PlayerAttributes[](2);
        attributes[0] = attributesAfterLuck1;
        attributes[1] = attributesAfterLuck2;

        bytes32 requestId = racing.requestRaceResult(circuit, attributes);

        uint256[] memory raceResults = new uint256[](2);
        raceResults[0] = 100;
        raceResults[1] = 200;

        // Fulfill the request
        racing.fulfillRequest(requestId, abi.encode(raceResults), "");

        // Verify the function behavior
        FunctionsRequests memory request = racing.getFunctionsRequestFromID(requestId);
        assert(request.exists);
        assert(request.fulfilled);
        assertEq(request.results[0], raceResults[0]);
        assertEq(request.results[1], raceResults[1]);

        vm.stopPrank();
    }
}
