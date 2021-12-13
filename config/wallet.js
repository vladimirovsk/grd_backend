module.exports = {
    address: process.env.WALLET_ADDRESS || '0x',
    key: process.env.WALLET_PASSWORD || '0x',
    walletJson: require('./ethereum/wallet.json') || null,
    addressRegex: /^0x[a-fA-F0-9]{40}$/, // Ethereum address regex
};