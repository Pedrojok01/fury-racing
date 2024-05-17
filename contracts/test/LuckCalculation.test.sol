// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/interface/IRacing.sol";
import "./mocks/MockRacing.sol";
import { Test, console2 } from "forge-std/Test.sol";

contract RacingTest is Test, IRacing {
    MockRacing public racing;

    address public owner = address(0x1);
    address public player1 = address(0x2);
    address public player2 = address(0x3);
    address public player3 = address(0x4);

    PlayerAttributes public attributes1;
    PlayerAttributes public attributes2;
    PlayerAttributes public attributes3;

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
        vm.deal(player3, 10 ether);

        vm.startPrank(owner);
        racing = new MockRacing(
            address(0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0), // router
            address(0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE), // vrfCoordinator
            4734827867964001365405830055140988844088387107361042566903892685164165989088, // vrfSubscriptionId
            8170, // functionSubscriptionId
            bytes32(0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887), // keyHash
            bytes32("fun-avalanche-fuji-1") // donID
        );
        vm.stopPrank();

        attributes1 = PlayerAttributes({
            reliability: 5,
            maniability: 5,
            speed: 5,
            breaks: 5,
            car_balance: 5,
            aerodynamics: 5,
            driver_skills: 5,
            luck: 5
        });

        attributes2 = PlayerAttributes({
            reliability: 9,
            maniability: 7,
            speed: 6,
            breaks: 5,
            car_balance: 4,
            aerodynamics: 3,
            driver_skills: 3,
            luck: 3
        });

        attributes3 = PlayerAttributes({
            reliability: 4,
            maniability: 7,
            speed: 6,
            breaks: 5,
            car_balance: 4,
            aerodynamics: 3,
            driver_skills: 3,
            luck: 8
        });
    }

    function testApplyLuckFactor() public view {
        uint256 randomWord = 0x1c3fc56c17a36c7a281f77a6fbc2824b283c737418c5d81b52a93e25726d12ef;

        PlayerAttributes memory adjustedAttributes =
            racing._applyLuckFactor(attributes1, randomWord);
        console2.log("LUCK ATTRIBUTES PLAYER 1: ", "5 (+0)");

        assert(adjustedAttributes.reliability >= 10 && adjustedAttributes.reliability <= 99);
        assert(adjustedAttributes.maniability >= 10 && adjustedAttributes.maniability <= 99);
        assert(adjustedAttributes.speed >= 10 && adjustedAttributes.speed <= 99);
        assert(adjustedAttributes.breaks >= 10 && adjustedAttributes.breaks <= 99);
        assert(adjustedAttributes.car_balance >= 10 && adjustedAttributes.car_balance <= 99);
        assert(adjustedAttributes.aerodynamics >= 10 && adjustedAttributes.aerodynamics <= 99);
        assert(adjustedAttributes.driver_skills >= 10 && adjustedAttributes.driver_skills <= 99);
        assert(adjustedAttributes.luck >= 10 && adjustedAttributes.luck <= 99);

        PlayerAttributes memory adjustedAttributes2 =
            racing._applyLuckFactor(attributes2, randomWord);
        console2.log("LUCK ATTRIBUTES PLAYER 2: ", "3 (-2)");

        assert(adjustedAttributes2.reliability >= 10 && adjustedAttributes2.reliability <= 99);
        assert(adjustedAttributes2.maniability >= 10 && adjustedAttributes2.maniability <= 99);
        assert(adjustedAttributes2.speed >= 10 && adjustedAttributes2.speed <= 99);
        assert(adjustedAttributes2.breaks >= 10 && adjustedAttributes2.breaks <= 99);
        assert(adjustedAttributes2.car_balance >= 10 && adjustedAttributes2.car_balance <= 99);
        assert(adjustedAttributes2.aerodynamics >= 10 && adjustedAttributes2.aerodynamics <= 99);
        assert(adjustedAttributes2.driver_skills >= 10 && adjustedAttributes2.driver_skills <= 99);
        assert(adjustedAttributes2.luck >= 10 && adjustedAttributes2.luck <= 99);
    }

    function testApplyLuckFactorPlayer2() public view {
        uint256 randomWord = 0x2c3fc56c17a36c7a281f77a6fbc2824b283c737418c5d81b52a93e25726d12ef;

        PlayerAttributes memory adjustedAttributes =
            racing._applyLuckFactor(attributes2, randomWord);
        console2.log("LUCK ATTRIBUTES PLAYER 2: ", "3 (-2)");

        assert(adjustedAttributes.reliability >= 10 && adjustedAttributes.reliability <= 99);
        assert(adjustedAttributes.maniability >= 10 && adjustedAttributes.maniability <= 99);
        assert(adjustedAttributes.speed >= 10 && adjustedAttributes.speed <= 99);
        assert(adjustedAttributes.breaks >= 10 && adjustedAttributes.breaks <= 99);
        assert(adjustedAttributes.car_balance >= 10 && adjustedAttributes.car_balance <= 99);
        assert(adjustedAttributes.aerodynamics >= 10 && adjustedAttributes.aerodynamics <= 99);
        assert(adjustedAttributes.driver_skills >= 10 && adjustedAttributes.driver_skills <= 99);
        assert(adjustedAttributes.luck >= 10 && adjustedAttributes.luck <= 99);

        PlayerAttributes memory adjustedAttributes2 =
            racing._applyLuckFactor(attributes3, randomWord);
        console2.log("LUCK ATTRIBUTES PLAYER 3: ", "8 (+3)");

        assert(adjustedAttributes2.reliability >= 10 && adjustedAttributes2.reliability <= 99);
        assert(adjustedAttributes2.maniability >= 10 && adjustedAttributes2.maniability <= 99);
        assert(adjustedAttributes2.speed >= 10 && adjustedAttributes2.speed <= 99);
        assert(adjustedAttributes2.breaks >= 10 && adjustedAttributes2.breaks <= 99);
        assert(adjustedAttributes2.car_balance >= 10 && adjustedAttributes2.car_balance <= 99);
        assert(adjustedAttributes2.aerodynamics >= 10 && adjustedAttributes2.aerodynamics <= 99);
        assert(adjustedAttributes2.driver_skills >= 10 && adjustedAttributes2.driver_skills <= 99);
        assert(adjustedAttributes2.luck >= 10 && adjustedAttributes2.luck <= 99);
    }

    function testApplyLuckFactorNegativeLuck() public view {
        uint256 randomWord = 0x000000000000000000000000000000000000000000000000000000000000002a;

        PlayerAttributes memory adjustedAttributes =
            racing._applyLuckFactor(attributes2, randomWord);
        console2.log("LUCK ATTRIBUTES PLAYER 2: ", "3 (-2)");

        assert(adjustedAttributes.reliability >= 10 && adjustedAttributes.reliability <= 99);
        assert(adjustedAttributes.maniability >= 10 && adjustedAttributes.maniability <= 99);
        assert(adjustedAttributes.speed >= 10 && adjustedAttributes.speed <= 99);
        assert(adjustedAttributes.breaks >= 10 && adjustedAttributes.breaks <= 99);
        assert(adjustedAttributes.car_balance >= 10 && adjustedAttributes.car_balance <= 99);
        assert(adjustedAttributes.aerodynamics >= 10 && adjustedAttributes.aerodynamics <= 99);
        assert(adjustedAttributes.driver_skills >= 10 && adjustedAttributes.driver_skills <= 99);
        assert(adjustedAttributes.luck >= 10 && adjustedAttributes.luck <= 99);

        PlayerAttributes memory adjustedAttributes2 =
            racing._applyLuckFactor(attributes3, randomWord);
        console2.log("LUCK ATTRIBUTES PLAYER 3: ", "8 (+3)");

        assert(adjustedAttributes2.reliability >= 10 && adjustedAttributes2.reliability <= 99);
        assert(adjustedAttributes2.maniability >= 10 && adjustedAttributes2.maniability <= 99);
        assert(adjustedAttributes2.speed >= 10 && adjustedAttributes2.speed <= 99);
        assert(adjustedAttributes2.breaks >= 10 && adjustedAttributes2.breaks <= 99);
        assert(adjustedAttributes2.car_balance >= 10 && adjustedAttributes2.car_balance <= 99);
        assert(adjustedAttributes2.aerodynamics >= 10 && adjustedAttributes2.aerodynamics <= 99);
        assert(adjustedAttributes2.driver_skills >= 10 && adjustedAttributes2.driver_skills <= 99);
        assert(adjustedAttributes2.luck >= 10 && adjustedAttributes2.luck <= 99);
    }

    function testAdjustAttribute() public view {
        uint8 adjusted = racing._adjustAttribute(5, 10);
        assertEq(adjusted, 60);

        adjusted = racing._adjustAttribute(5, -10);
        assertEq(adjusted, 40);

        adjusted = racing._adjustAttribute(5, -50);
        assertEq(adjusted, 10);

        adjusted = racing._adjustAttribute(5, 50);
        assertEq(adjusted, 99);
    }
}
