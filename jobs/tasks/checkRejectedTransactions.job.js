module.exports = async (container) => {
    console.log("Run check rejected transactions job at ", Date.now());
    let service = container.resolve('contractTransactionsService');
    await service.handleRejectedTransactions();
}