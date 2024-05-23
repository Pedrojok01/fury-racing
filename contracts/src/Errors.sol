// SPDX-License-Identifier: BSL-1.1
pragma solidity 0.8.24;

// ChainlinkFeed errors
error ChainlinkFeed__InvalidRandomRequestId();
error ChainlinkFeed__InvalidFunctionRequestId();
error ChainlinkFeed__InvalidCircuitIndex();

// Racing errors
error Racing__PlayerAlreadyJoined();
error Racing__InvalidAttributesSum();
error Racing__InvalidAttribute();
error Racing__InvalidBetAmount();
error Racing__EmergencyWithdrawFailed();
error Racing__WinnerPaymentFailed();
error Racing__WeeklyPaymentFailed();
error Racing__WeeklyPaymentInsufficientBalance();
error Racing__CircuitNotFound();
