// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library FunctionsSource {
    function getRaceResult() internal pure returns (string memory) {
        return (
            "const attributes = args[0].toString();"
            "const raceResultRequest = await Functions.makeHttpRequest({"
            "  url: `https://racerback.azurewebsites.net/api/races/data/${attributes}`," "});"
            "if (raceResultRequest.error) {" "  throw new Error('Request failed');" "}"
            "const combinedResult = BigInt(raceResultRequest.data.combinedResult);"
            "return Functions.encodeUint256(combinedResult);"
        );
    }
}