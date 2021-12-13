const schedule = require('node-schedule');

//Jobs
function scheduler(container) {

    schedule.scheduleJob('30 23 * * *', function () {
        require('./tasks/transferTokensToBurnAddress.job')(container)
    });
    schedule.scheduleJob('40 23 * * *', function () {
        require('./tasks/burnTokens.job')(container)
    });
    
    schedule.scheduleJob('0 0 * * *', function () {
        require('./tasks/mintTokens.job')(container)
    });

    schedule.scheduleJob('*/1 * * * *', function () {
        require('./tasks/checkTransaction.job')(container)
    });
    schedule.scheduleJob('*/5 * * * *', function () {
        require('./tasks/checkRejectedTransactions.job')(container)
    });
}

module.exports = scheduler;
