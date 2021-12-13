const ContractConfigs = require('../../config/contract');

module.exports = async (container) => {
    console.log("Run burn tokens job at ", Date.now());
    let contractService = container.resolve('contractService');
    let balance = await contractService.balanceOf(ContractConfigs.burnAbleAddress);
    // if (Number(balance) > 0) {
        contractService.burnTokensFrom(ContractConfigs.burnAbleAddress, balance).then(console.log).catch(console.log);
    // }
}