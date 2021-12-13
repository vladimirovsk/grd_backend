"use strict"

const {body, param} = require('express-validator')
const walletConfigs = require('../../config/wallet');

exports.validate = [
    param('address').exists().matches(walletConfigs.addressRegex, "i")
];
