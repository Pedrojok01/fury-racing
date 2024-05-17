// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

// ChainlinkFeed errors
error ChainlinkFeed__InvalidRandomRequestId();
error ChainlinkFeed__InvalidFunctionRequestId();

// Racing errors
error Racing__InvalidAttributesSum();
error Racing__InvalidAttribute();
error Racing__InvalidBetAmount();
error Racing__EmergencyWithdrawFailed();
error Racing__WinnerPaymentFailed();
error Racing__WeeklyPaymentFailed();
error Racing__WeeklyPaymentInsufficientBalance();
error Racing__CircuitNotFound();
