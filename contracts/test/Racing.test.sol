// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import "../src/Errors.sol";
import { BaseTestSetup } from "./BaseTestSetup.sol";
import { Test, console2 } from "forge-std/Test.sol";

contract RacingTest is BaseTestSetup {
    function setUp() public {
        setUpBase();
    }

    function testJoinBetRaceInvalidAttributes() public {
        PlayerAttributes memory _attributes3 = PlayerAttributes({
            reliability: 8,
            maniability: 5,
            speed: 6,
            breaks: 5,
            car_balance: 4,
            aerodynamics: 3,
            driver_skills: 3,
            luck: 4
        });

        vm.startPrank(player3);
        vm.expectRevert(Racing__InvalidAttributesSum.selector);
        racing.joinRace{ value: 0.1 ether }(_attributes3);
        vm.stopPrank();
    }

    function testJoinFreeRace() public {
        vm.prank(player1);
        racing.joinFreeRace(attributes1);

        vm.prank(player2);
        racing.joinFreeRace(attributes2);

        (, address player1Address, uint16 player1ELO) = racing.addressToPlayer(player1);
        assertEq(player1Address, player1);
        assertEq(player1ELO, 1200);

        // Mock VRF Coordinator callback
        uint256 requestId = 1;
        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = uint256(keccak256(abi.encodePacked(block.timestamp, uint256(0))));
        randomWords[1] = uint256(keccak256(abi.encodePacked(block.timestamp, uint256(1))));
        racing._fulfillRandomWords(requestId, randomWords);

        // Mock Chainlink Functions callback
        bytes32 functionsRequestId = keccak256(abi.encodePacked(uint256(1), false, uint256(1)));
        uint256[] memory raceResults = new uint256[](2);
        raceResults[0] = 100; // Player 1's time
        raceResults[1] = 200; // Player 2's time
        racing.fulfillRequest(functionsRequestId, abi.encode(raceResults), "");

        // Verify race state
        Race memory race = racing.getFreeRaceFromRaceID(1);
        assertEq(uint256(race.state), uint256(RaceState.FINISHED));
        assertEq(race.player1Time, 100);
        assertEq(race.player2Time, 200);
    }

    function testJoinBetRace() public {
        vm.prank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1);

        vm.prank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2);

        (, address player1Address, uint16 player1ELO) = racing.addressToPlayer(player1);
        assertEq(player1Address, player1);
        assertEq(player1ELO, 1200);

        (, address player2Address, uint16 player2ELO) = racing.addressToPlayer(player2);
        assertEq(player2Address, player2);
        assertEq(player2ELO, 1200);

        // Mock VRF Coordinator callback
        uint256 requestId = 1;
        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = uint256(keccak256(abi.encode(block.timestamp, 0)));
        randomWords[1] = uint256(keccak256(abi.encode(block.timestamp, 1)));
        racing._fulfillRandomWords(requestId, randomWords);

        // Mock Chainlink Functions callback
        bytes32 functionsRequestId = keccak256(abi.encodePacked(uint256(1), true, uint256(1)));
        uint256[] memory raceResults = new uint256[](2);
        raceResults[0] = 100; // Player 1's time
        raceResults[1] = 200; // Player 2's time
        uint256 player1InitialBalance = player1.balance;
        racing.fulfillRequest(functionsRequestId, abi.encode(raceResults), "");

        // Verify race state
        Race memory race = racing.getRaceFromRaceID(1);
        assertEq(uint256(race.state), uint256(RaceState.FINISHED));
        assertEq(race.player1Time, 100);
        assertEq(race.player2Time, 200);

        // Verify ELO scores
        (,, uint16 updatedPlayer1ELO) = racing.addressToPlayer(player1);
        (,, uint16 updatedPlayer2ELO) = racing.addressToPlayer(player2);
        assertEq(updatedPlayer1ELO, 1203); // Winner +3
        assertEq(updatedPlayer2ELO, 1201); // Loser +1

        // Verify prize distribution
        uint256 prize = (0.1 ether * 2 * 95) / 100;
        assertEq(player1.balance, player1InitialBalance + prize); // Player1 receive prize
    }

    function testThreeBetRacesInARow() public {
        InitialBalances memory initialBalances = InitialBalances({
            contractBalance: address(racing).balance,
            player1Balance: player1.balance,
            player2Balance: player2.balance,
            prizePool: racing.currentPrizePool() // 0
         });

        uint256 requestId = 1;
        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = uint256(keccak256(abi.encode(block.timestamp, 0)));
        randomWords[1] = uint256(keccak256(abi.encode(block.timestamp, 1)));

        // First bet race
        vm.prank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1);

        vm.prank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2);

        racing._fulfillRandomWords(requestId, randomWords);

        bytes32 functionsRequestId1 = keccak256(abi.encodePacked(uint256(1), true, uint256(1)));
        uint256[] memory raceResults1 = new uint256[](2);
        raceResults1[0] = 100; // Player 1's time
        raceResults1[1] = 200; // Player 2's time
        racing.fulfillRequest(functionsRequestId1, abi.encode(raceResults1), "");

        verifyRaceState(requestId, 100, 200);
        verifyELOScores(1203, 1201); // Winner +3, loser +1
        verifyPrizeDistribution(player1, initialBalances.player1Balance);
        verifyContractBalance(initialBalances.contractBalance);
        verifyPrizePool(initialBalances.prizePool); // 0

        // Update initial balances after the first race
        initialBalances.player1Balance = player1.balance;
        initialBalances.player2Balance = player2.balance;
        initialBalances.contractBalance = address(racing).balance;
        initialBalances.prizePool = racing.currentPrizePool(); // 0.01 ether

        // Second bet race
        requestId++;

        vm.prank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1);

        vm.prank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2);

        uint256[] memory randomWords2 = new uint256[](2);
        randomWords2[0] = uint256(keccak256(abi.encode(block.timestamp, 2)));
        randomWords2[1] = uint256(keccak256(abi.encode(block.timestamp, 3)));
        racing._fulfillRandomWords(requestId, randomWords2);

        bytes32 functionsRequestId2 = keccak256(abi.encodePacked(uint256(2), true, uint256(1)));
        uint256[] memory raceResults2 = new uint256[](2);
        raceResults2[0] = 200; // Player 1's time
        raceResults2[1] = 100; // Player 2's time
        racing.fulfillRequest(functionsRequestId2, abi.encode(raceResults2), "");

        verifyRaceState(requestId, 200, 100);
        verifyELOScores(1204, 1204); // Winner +3, loser +1
        verifyPrizeDistribution(player2, initialBalances.player2Balance);
        verifyContractBalance(initialBalances.contractBalance);
        verifyPrizePool(initialBalances.prizePool);

        // Update initial balances after the second race
        initialBalances.player1Balance = player1.balance;
        initialBalances.player2Balance = player2.balance;
        initialBalances.contractBalance = address(racing).balance;
        initialBalances.prizePool = racing.currentPrizePool();

        // Third bet race
        requestId++;

        vm.prank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1);

        vm.prank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2);

        uint256[] memory randomWords3 = new uint256[](2);
        randomWords3[0] = uint256(keccak256(abi.encode(block.timestamp, 4)));
        randomWords3[1] = uint256(keccak256(abi.encode(block.timestamp, 5)));
        racing._fulfillRandomWords(requestId, randomWords3);

        bytes32 functionsRequestId3 = keccak256(abi.encodePacked(uint256(3), true, uint256(1)));
        uint256[] memory raceResults3 = new uint256[](2);
        raceResults3[0] = 150; // Player 1's time
        raceResults3[1] = 100; // Player 2's time
        racing.fulfillRequest(functionsRequestId3, abi.encode(raceResults3), "");

        verifyRaceState(requestId, 150, 100);
        verifyELOScores(1205, 1207); // Winner +3, loser +1
        verifyPrizeDistribution(player2, initialBalances.player2Balance);
        verifyContractBalance(initialBalances.contractBalance);
        verifyPrizePool(initialBalances.prizePool);

        // Update initial balances after the third race
        initialBalances.player1Balance = player1.balance;
        initialBalances.player2Balance = player2.balance;
        initialBalances.contractBalance = address(racing).balance;
        initialBalances.prizePool = racing.currentPrizePool();

        // Move forward in time by one week and trigger prize pool distribution
        uint256 oneWeekInSeconds = 7 days;
        vm.warp(block.timestamp + oneWeekInSeconds);

        uint256 initialTopPlayerBalance =
            player1.balance > player2.balance ? player1.balance : player2.balance;
        address topPlayer = player1.balance > player2.balance ? player1 : player2;

        vm.prank(owner);
        racing.updateWeatherDataForCircuit(1, 17); // Trigger prize pool distribution

        // Verify that the prize pool was distributed to the top player
        assertEq(topPlayer.balance, initialTopPlayerBalance + initialBalances.prizePool);
        assertEq(racing.currentPrizePool(), 0);
    }

    function verifyRaceState(uint256 raceId, uint256 winnerTime, uint256 loserTime) internal view {
        Race memory race = racing.getRaceFromRaceID(raceId);
        assertEq(uint256(race.state), uint256(RaceState.FINISHED));
        assertEq(race.player1Time, winnerTime);
        assertEq(race.player2Time, loserTime);
    }

    function verifyELOScores(uint256 expectedScore1, uint256 expectedScore2) internal view {
        (,, uint16 updatedPlayer1ELO) = racing.addressToPlayer(player1);
        (,, uint16 updatedPlayer2ELO) = racing.addressToPlayer(player2);
        assertEq(updatedPlayer1ELO, expectedScore1);
        assertEq(updatedPlayer2ELO, expectedScore2);
    }

    // Winner should receive the prize
    function verifyPrizeDistribution(address winner, uint256 initialWinnerBalance) internal view {
        uint256 prize = (0.1 ether * 2 * 95) / 100;
        assertEq(winner.balance, initialWinnerBalance + prize - 0.1 ether); // substract bet amount
    }

    // Contract balance should decrease
    function verifyContractBalance(uint256 initialContractBalance) internal view {
        uint256 prize = (0.1 ether * 2 * 95) / 100;
        assertEq(address(racing).balance, initialContractBalance + 0.2 ether - prize);
    }

    // Prize pool increases by 5% of the bet amount per race
    function verifyPrizePool(uint256 initialPrizePool) internal view {
        uint256 updatedPrizePool = racing.currentPrizePool();
        assertEq(updatedPrizePool, initialPrizePool + (0.2 ether * 5) / 100);
    }
}
