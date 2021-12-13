"use strict"

const {body, param} = require('express-validator')

exports.validate = [
    param('amount').exists().toInt()
];
