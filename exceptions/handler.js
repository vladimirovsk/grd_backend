const ResponseCodes = require('../routes/helpers/responseCodes');

exports.handle = (err, req, res, next) => {
    res.status(err.status || ResponseCodes.Forbidden);
    res.json({
        'errors': {
            message: err.message,
            error: err
        },
        message: 'Error! Something is wrong!' // value from old api realization
    });
}