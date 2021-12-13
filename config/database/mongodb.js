module.exports = {
    userName: process.env.MONGO_USERNAME || 'user',
    password: process.env.MONGO_PASSWORD || 'password',
    host: process.env.MONGO_HOSTNAME || 'localhost',
    port: process.env.MONGO_PORT || 80,
    dbName: process.env.MONGO_DB || 'main'
};