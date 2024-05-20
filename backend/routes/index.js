const express = require('express');
const { param } = require('express-validator');

const controller = require('../controllers');

const router = express.Router();

router.get('/data/:attributes',
    [
        param('attributes').notEmpty().isLength(36),
    ],
    controller.submit
)

module.exports = router;