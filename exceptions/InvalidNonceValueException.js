'use strict'

const ResponseCodes = require('../routes/helpers/responseCodes');

class InvalidNonceValueException extends Error {
    constructor(message) {
        super(message);
        this.status = ResponseCodes.BadRequest;
        Error.captureStackTrace(this, InvalidNonceValueException);
    }
}

export default InvalidNonceValueException;