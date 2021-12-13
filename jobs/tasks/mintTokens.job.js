const ContractConfigs = require('../../config/contract');

module.exports = (container) => {
    console.log("Run mint tokens job at ", Date.now());
    let contractService = container.resolve('contractService');
    contractService.addNewTokens(ContractConfigs.autoGenerationTokensAmount).then(console.log).catch(console.log);
}