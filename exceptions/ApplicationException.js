'use strict'

const ResponseCodes = require('../routes/helpers/responseCodes');

class ApplicationException extends Error {
    constructor(message) {
        super(message);
        this.status = ResponseCodes.ServerError;
        Error.captureStackTrace(this, ApplicationException);
    }
}

export default ApplicationException;