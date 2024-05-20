const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const submit = async (req, res, next) => {
    // accept the result of validation attached to the routes
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors);
        return next(new HttpError('Inavlid input passed. Please check and try again', 422));
    }

    const { attributes } = req.body;
    const circuit = attributes.slice(0, 2);
    const weather = attributes.slice(2, 4);
    const player1Attributes = attributes.slice(4, 20);
    const player2Attributes = attributes.slice(20);

    console.log(circuit);
    console.log(weather);
    console.log(player1Attributes);
    console.log(player2Attributes);

    let result
    try {
        result = [Math.floor(Math.random() * 96) + 5, Math.floor(Math.random() * 96) + 5];
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({ result });
}

module.exports = { submit }