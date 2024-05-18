// SPDX-License-Identifier: MIT
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
        vm.startPrank(player1);
        racing.joinFreeRace(attributes1);
        vm.stopPrank();

        (PlayerAttributes memory attributes, address player1Address, uint16 player1ELO) =
            racing.addressToPlayer(player1);
        assertEq(player1Address, player1);
        assertEq(player1ELO, 1200);
    }

    function testJoinBetRace() public {
        vm.startPrank(player1);
        racing.joinRace{ value: 0.1 ether }(attributes1);
        vm.stopPrank();

        vm.startPrank(player2);
        racing.joinRace{ value: 0.1 ether }(attributes2);
        vm.stopPrank();

        (PlayerAttributes memory _attributes1, address player1Address, uint16 player1ELO) =
            racing.addressToPlayer(player1);
        assertEq(player1Address, player1);
        assertEq(player1ELO, 1200);

        (PlayerAttributes memory _attributes2, address player2Address, uint16 player2ELO) =
            racing.addressToPlayer(player2);
        assertEq(player2Address, player2);
        assertEq(player2ELO, 1200);

        // Assuming the request ID is stored in the contract (as it should be)
        uint256 requestId = 1; // Adjust based on your contract logic
        uint256[] memory randomWords = new uint256[](2);
        randomWords[0] = uint256(keccak256(abi.encode(block.timestamp, 0)));
        randomWords[1] = uint256(keccak256(abi.encode(block.timestamp, 1)));

        // Fulfill the request
        racing._fulfillRandomWords(requestId, randomWords);

        // Add assertions here to check if fulfillRandomWords worked correctly
        // For example, check if the race results are updated as expected
    }
}
