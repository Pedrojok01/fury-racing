// SPDX-License-Identifier: BSL-1.1
pragma solidity 0.8.24;

import "../src/Errors.sol";
import { BaseTestSetup } from "./BaseTestSetup.sol";
import { Test, console2 } from "forge-std/Test.sol";

contract RacingTest is BaseTestSetup {
    uint256 circuitId = 1;
    uint256 prizePool = (0.2 ether * 5) / 100;

    function setUp() public {
        setUpBase();
    }

    function testWeeklyPrizePoolDistribution() public {
        uint256 initialContractBalance = address(racing).balance;
        uint256 initialPlayer1Balance = player1.balance;
        uint256 initialPlayer2Balance = player2.balance;
        uint256 initialPrizePool = racing.currentPrizePool();
        uint256 requestId = 1;

        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = uint256(keccak256(abi.encode(block.timestamp, 0)));
        randomWords[1] = uint256(keccak256(abi.encode(block.timestamp, 1)));

        // First bet race
        vm.prank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1, circuitId);

        vm.prank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2, circuitId);

        racing._fulfillRandomWords(requestId, randomWords);

        bytes32 functionsRequestId1 =
            keccak256(abi.encodePacked(uint256(1), RaceMode.TOURNAMENT, uint256(1)));
        uint256[] memory raceResults1 = new uint256[](2);
        raceResults1[0] = 100; // Player 1's time
        raceResults1[1] = 200; // Player 2's time
        racing._fulfillRequest(functionsRequestId1, abi.encode(raceResults1), "");

        verifyRaceState(requestId, RaceMode.TOURNAMENT, 100, 200);
        verifyELOScores(1203, 1201);
        verifyPrizeDistribution(player1, initialPlayer1Balance);
        verifyContractBalance(initialContractBalance);
        verifyPrizePool(initialPrizePool);

        assertEq(racing.currentPrizePool(), (0.2 ether * 5) / 100);

        // Move forward 1 week
        vm.warp(block.timestamp + 1 weeks + 1000);

        // Trigger weekly prize pool distribution
        racing._updateWeatherDataForCircuit(1, 75);

        // Verify prize pool distribution
        assertEq(
            player1.balance, initialPlayer1Balance - 0.1 ether + prizePool + (0.2 ether * 95) / 100
        );
        assertEq(racing.currentPrizePool(), 0);

        // Second bet race
        initialPlayer1Balance = player1.balance;
        initialPlayer2Balance = player2.balance;
        initialContractBalance = address(racing).balance;

        vm.prank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1, circuitId);

        vm.prank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2, circuitId);

        requestId++;

        uint256[] memory randomWords2 = new uint256[](2);
        randomWords2[0] = uint256(keccak256(abi.encode(block.timestamp, 2)));
        randomWords2[1] = uint256(keccak256(abi.encode(block.timestamp, 3)));
        racing._fulfillRandomWords(requestId, randomWords2);

        bytes32 functionsRequestId2 =
            keccak256(abi.encodePacked(uint256(2), RaceMode.TOURNAMENT, uint256(1)));
        uint256[] memory raceResults2 = new uint256[](2);
        raceResults2[0] = 200; // Player 1's time
        raceResults2[1] = 100; // Player 2's time
        racing._fulfillRequest(functionsRequestId2, abi.encode(raceResults2), "");

        verifyRaceState(requestId, RaceMode.TOURNAMENT, 200, 100);
        verifyELOScores(1201, 1203);
        verifyPrizeDistribution(player2, initialPlayer2Balance);
        verifyContractBalance(initialContractBalance);
        verifyPrizePool(initialPrizePool);

        // Move forward another week
        assertEq(racing.currentPrizePool(), prizePool);
        vm.warp(block.timestamp + 1 weeks + 1000);

        // Trigger weekly prize pool distribution again
        racing._updateWeatherDataForCircuit(1, 75);

        // Verify prize pool distribution
        assertEq(
            player2.balance, initialPlayer2Balance - 0.1 ether + prizePool + (0.2 ether * 95) / 100
        );
        assertEq(racing.currentPrizePool(), 0);
    }
}
