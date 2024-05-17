// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/interface/IRacing.sol";
import "./mocks/MockRacing.sol";
import { Test, console2 } from "forge-std/Test.sol";

contract RacingTest is Test, IRacing {
    MockRacing public racing;

    address public owner = address(0x1);
    address public player1 = address(0x2);

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(player1, 10 ether);

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
        Circuits memory newCircuit = Circuits({
            factors: ExternalFactors({
                weather: 30,
                crashes: 40,
                full_Throttle: 50,
                downforce: 25,
                top_Speed: 300
            }),
            index: 1,
            name: "Test Circuit"
        });

        // Only owner can add circuit
        vm.prank(racing.owner());
        racing.addCircuit(newCircuit);

        Circuits memory addedCircuit = racing._getCircuit(1);
        assertEq(addedCircuit.name, "Test Circuit");
        assertEq(addedCircuit.factors.weather, 30);
        assertEq(addedCircuit.factors.crashes, 40);
        assertEq(addedCircuit.factors.full_Throttle, 50);
        assertEq(addedCircuit.factors.downforce, 25);
        assertEq(addedCircuit.factors.top_Speed, 300);
    }

    function testUpdateWeatherDataForCircuit() public {
        uint256 circuitIndex = 0;
        uint256 newWeatherData = 30;

        // Only owner can update weather data
        vm.prank(racing.owner());
        racing.UpdateWeatherDataForCircuit(circuitIndex, newWeatherData);

        Circuits memory updatedCircuit = racing._getCircuit(circuitIndex);
        assertEq(updatedCircuit.factors.weather, newWeatherData);
    }

    function testEmergencyWithdraw() public {
        vm.deal(address(racing), 10 ether);

        uint256 initialBalance = owner.balance;
        uint256 initialContractBalance = address(racing).balance;

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
