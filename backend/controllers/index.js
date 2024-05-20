const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const submit = async (req, res, next) => {
    // accept the result of validation attached to the routes
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors);
        return next(new HttpError('Inavlid input passed. Please check and try again', 422));
    }

    const { attributes } = req.params;
    const circuit = attributes.slice(0, 2);
    const weather = attributes.slice(2, 4);
    const player1Attributes = attributes.slice(4, 20);
    const player2Attributes = attributes.slice(20);

    console.log(circuit);
    console.log(weather);
    console.log(player1Attributes);
    console.log(player2Attributes);

    let player1Result, player2Result;
    try {
        player1Result = Math.floor(Math.random() * 96) + 5
        player2Result = Math.floor(Math.random() * 96) + 5;
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    const combinedResult = combineToUint256(player1Result, player2Result);
    const encodedHex = encodeUint256ToHex(combinedResult);

    console.log(`Combined Result (uint256): ${combinedResult}`);
    console.log(`Encoded Hex: ${encodedHex}`);

    res.status(200).json({ encodedHex });
}

// Function to combine two uint128 values into a single uint256
function combineToUint256(player1Result, player2Result) {
    // Ensure the results are BigInt
    const player1BigInt = BigInt(player1Result);
    const player2BigInt = BigInt(player2Result);

    // Shift player1Result left by 128 bits and add player2Result
    const combinedResult = (player1BigInt << 128n) | player2BigInt;

    return combinedResult;
}

// Function to encode the combined uint256 as a hex string
function encodeUint256ToHex(combinedResult) {
    // Convert the BigInt to a hex string, remove the '0x' prefix and pad to 64 characters
    const hexString = combinedResult.toString(16).padStart(64, '0');

    return `0x${hexString}`;
}

module.exports = { submit }