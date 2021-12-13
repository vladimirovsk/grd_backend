"use strict"

const {body, param} = require('express-validator')
const walletConfigs = require('../../config/wallet');

exports.validate = [
    param('to').exists().matches(walletConfigs.addressRegex, "i"),
    param('amount').exists().isNumeric()
];
