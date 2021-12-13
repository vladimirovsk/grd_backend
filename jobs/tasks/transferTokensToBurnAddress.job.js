const ContractConfigs = require('../../config/contract');

module.exports = async (container) => {
    console.log("Run transfer tokens job at ", Date.now());
    let contractService = container.resolve('contractService');
    let allowance = await contractService.allowance(ContractConfigs.tokensOwnerAddress, ContractConfigs.ownerAddress);
    let balance = await contractService.balanceOf(ContractConfigs.tokensOwnerAddress);
    // let limitTokens = ContractConfigs.burnTokensAmount;
    if (Number(balance) >= Number(allowance)) {
        contractService.transferTokensFrom(ContractConfigs.tokensOwnerAddress, ContractConfigs.burnAbleAddress, allowance).then(console.log).catch(console.log);
    } else {
        contractService.transferTokensFrom(ContractConfigs.tokensOwnerAddress, ContractConfigs.burnAbleAddress, balance).then(console.log).catch(console.log);
    }
}
