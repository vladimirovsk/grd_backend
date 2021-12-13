module.exports = {
    port: process.env.APP_PORT || '3002',
    name: process.env.APP_NAME || 'Example',
    host: process.env.APP_HOST || '0.0.0.0',
    debug: process.env.DEBUG || false,
    mode: process.env.NODE_ENV || 'production',
    preferredBroadcastTxChannel: process.env.PREFERRED_BROADCAST_TX_CHANNEL || 'infura' // 'infura' or 'web3'
};