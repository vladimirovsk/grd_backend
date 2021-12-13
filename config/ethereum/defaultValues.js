module.exports = {
    gasPrice: process.env.ETH_BASE_GAS_PRICE || 55,
    baseGasLimit: process.env.ETH_BASE_GAS_LIMIT || 21000,
    gasLimitStep: process.env.ETH_GAS_LIMIT_STEP || 10000,
};
