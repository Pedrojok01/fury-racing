// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/Errors.sol";
import { BaseTestSetup } from "./BaseTestSetup.sol";
import { Test, console2 } from "forge-std/Test.sol";

contract RacingTest is BaseTestSetup {
    function setUp() public {
        setUpBase();
    }

    function testApplyLuckFactor() public view {
        uint256 randomWord = 0x1c3fc56c17a36c7a281f77a6fbc2824b283c737418c5d81b52a93e25726d12ef;

        PlayerAttributes memory adjustedAttributes =
            racing._applyLuckFactor(attributes1, randomWord);
        assertAttributesInRange(adjustedAttributes);

        PlayerAttributes memory adjustedAttributes2 =
            racing._applyLuckFactor(attributes2, randomWord);

        assertAttributesInRange(adjustedAttributes2);
    }

    function testApplyLuckFactorPlayer2() public view {
        uint256 randomWord = 0x2c3fc56c17a36c7a281f77a6fbc2824b283c737418c5d81b52a93e25726d12ef;

        PlayerAttributes memory adjustedAttributes =
            racing._applyLuckFactor(attributes2, randomWord);
        assertAttributesInRange(adjustedAttributes);

        PlayerAttributes memory adjustedAttributes2 =
            racing._applyLuckFactor(attributes3, randomWord);
        assertAttributesInRange(adjustedAttributes2);
    }

    function testApplyLuckFactorNegativeLuck() public view {
        uint256 randomWord = 0x000000000000000000000000000000000000000000000000000000000000002a;

        PlayerAttributes memory adjustedAttributes =
            racing._applyLuckFactor(attributes2, randomWord);
        assertAttributesInRange(adjustedAttributes);

        PlayerAttributes memory adjustedAttributes2 =
            racing._applyLuckFactor(attributes3, randomWord);
        assertAttributesInRange(adjustedAttributes2);
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

    function assertAttributesInRange(PlayerAttributes memory attributes) internal pure {
        assert(attributes.reliability >= 10 && attributes.reliability <= 99);
        assert(attributes.maniability >= 10 && attributes.maniability <= 99);
        assert(attributes.speed >= 10 && attributes.speed <= 99);
        assert(attributes.breaks >= 10 && attributes.breaks <= 99);
        assert(attributes.car_balance >= 10 && attributes.car_balance <= 99);
        assert(attributes.aerodynamics >= 10 && attributes.aerodynamics <= 99);
        assert(attributes.driver_skills >= 10 && attributes.driver_skills <= 99);
        assert(attributes.luck >= 10 && attributes.luck <= 99);
    }
}
