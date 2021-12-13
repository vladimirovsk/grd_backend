'use strict'

const ResponseCodes = require('../routes/helpers/responseCodes');

class BadRequestException extends Error {
    constructor(message) {
        super(message);
        this.status = ResponseCodes.BadRequest;
        Error.captureStackTrace(this, BadRequestException);
    }
}

export default BadRequestException;