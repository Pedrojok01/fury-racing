// SPDX-License-Identifier: BSL-1.1
pragma solidity 0.8.24;

import "../src/Errors.sol";
import { BaseTestSetup } from "./BaseTestSetup.sol";
import { Test, console2 } from "forge-std/Test.sol";

contract RacingTest is BaseTestSetup {
    function setUp() public {
        setUpBase();
    }

    function testPauseAndUnpause() public {
        // Only owner can pause
        vm.prank(racing.owner());
        racing.pause();
        assertEq(racing.paused(), true);

        // Only owner can unpause
        vm.prank(racing.owner());
        racing.unpause();
        assertEq(racing.paused(), false);
    }

    function testSetBetAmount() public {
        uint256 newBetAmount = 0.2 ether;

        // Only owner can set bet amount
        vm.prank(racing.owner());
        racing.setBetAmount(newBetAmount);
        assertEq(racing.betAmount(), newBetAmount);
    }

    function testAddCircuit() public {
        ExternalFactors memory factors = ExternalFactors({
            weather: 30,
            crashes: 40,
            full_Throttle: 50,
            downforce: 25,
            top_Speed: 300
        });

        string memory name = "Test Circuit";

        // Only owner can add circuit
        vm.prank(racing.owner());
        racing.addCircuit(factors, name);

        Circuits memory addedCircuit = racing._getCircuit(2);
        assertEq(addedCircuit.name, "Test Circuit");
        assertEq(addedCircuit.factors.weather, 30);
        assertEq(addedCircuit.factors.crashes, 40);
        assertEq(addedCircuit.factors.full_Throttle, 50);
        assertEq(addedCircuit.factors.downforce, 25);
        assertEq(addedCircuit.factors.top_Speed, 300);
    }

    function testupdateWeatherDataForCircuit() public {
        uint256 circuitIndex = 1;
        uint256 newWeatherData = 30;

        // Only owner can update weather data
        vm.prank(racing.owner());
        racing._updateWeatherDataForCircuit(circuitIndex, newWeatherData);

        Circuits memory updatedCircuit = racing._getCircuit(circuitIndex);
        assertEq(updatedCircuit.factors.weather, newWeatherData);
    }

    function testEmergencyWithdraw() public {
        vm.deal(address(racing), 10 ether);

        uint256 initialBalance = owner.balance;

        address contractOwner = racing.owner();
        assertEq(contractOwner, owner);

        // Expect revert if not owner
        vm.startPrank(player1);
        vm.expectRevert("Only callable by owner");
        racing.emergencyWithdraw();
        vm.stopPrank();

        // Only owner can withdraw funds
        vm.startPrank(racing.owner());
        racing.emergencyWithdraw();
        vm.stopPrank();

        uint256 finalBalance = owner.balance;
        assert(finalBalance > initialBalance);
        assertEq(address(racing).balance, 0);
    }
}
