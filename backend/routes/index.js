const express = require('express');
const { check } = require('express-validator');

const controller = require('../controllers');

const router = express.Router();

router.post('/data',
    [
        check('attributes').notEmpty().isLength(36),
    ],
    controller.submit
)

module.exports = router;