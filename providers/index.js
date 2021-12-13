
module.exports = (container) => {
    container.register(require('./services.provider')(container));
    require('./job.provider')(container);
    container.resolve('mongoService').connect();
};