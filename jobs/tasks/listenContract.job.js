module.exports = async (container) => {
    let service = container.resolve('contractTransactionsService');
    await service.handleUnconfirmedTransactions();
    await service.handleRejectedTransactions();
}