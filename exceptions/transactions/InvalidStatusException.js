'use strict'

const ResponseCodes = require('../../routes/helpers/responseCodes');

class InvalidStatusException extends Error {
    constructor(message) {
        super(message);
        this.status = ResponseCodes.ServerError;
        Error.captureStackTrace(this, InvalidStatusException);
    }
}

export default InvalidStatusException;