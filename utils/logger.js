const {createLogger, transports, format} = require('winston');
const logsConfigs = require('../config/logs');

const logger = createLogger({
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.File({
            filename: logsConfigs.logsBaseDir + logsConfigs.logsFileName,
            json: logsConfigs.logsInJson,
            maxsize: logsConfigs.logsMaxSize,
            maxFiles: logsConfigs.logsMaxFiles,
            level: logsConfigs.logsLevel,
            handleExceptions: logsConfigs.handleExceptions
        }),
        new transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
        }),
    ],
    exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;
