'use strict'

const ResponseCodes = require('../../routes/helpers/responseCodes');

class InvalidAddressException extends Error {
    constructor(message) {
        super(message);
        this.status = ResponseCodes.BadRequest;
        Error.captureStackTrace(this, InvalidAddressException);
    }
}

export default InvalidAddressException;