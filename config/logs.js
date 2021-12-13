module.exports = {
    logsBaseDir: process.env.LOGS_DIR || "./storage/logs/",
    logsFileName: process.env.LOGS_FILE_NAME || 'express.app.log',
    logsMaxSize: process.env.LOGS_MAX_SIZE || 5242880,
    logsMaxFiles: process.env.LOGS_MAX_FILES || 5,
    handleExceptions: true,
    logsLevel: 'info',
    logsInJson: false
};