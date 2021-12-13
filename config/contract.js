module.exports = {
    ownerAddress: process.env.OWNER_ADDRESS || '0x',
    tokensOwnerAddress: process.env.TOKENS_OWNER_ADDRESS || '0x',
    address: process.env.CONTRACT_ADDRESS || '0x',
    abi: require('./ethereum/contract.abi.json') || null,
    burnAbleAddress: process.env.CONTRACT_BURN_ADDRESS || '0x', // Address of wallet which would be use for burning tokens
    autoGenerationTokensAmount: Number(process.env.COUNT_GENERATED_TOKENS) || 10000000,
    burnTokensAmount: Number(process.env.COUNT_GENERATED_TOKENS) || 100000000000000000 //  10000000 * decimals
};