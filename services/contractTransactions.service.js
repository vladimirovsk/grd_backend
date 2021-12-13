import ContractService from "./contract.service";

/**
 * @class ContractTransactionsService
 */
class ContractTransactionsService extends ContractService {

    /**
     * Check status unconfirmed transactions
     * @returns {Promise<void>}
     */
    async handleUnconfirmedTransactions() {
        let transactions = await this.transactionsService.getLastUnconfirmedTransactions();
        let findDate = new Date();
        findDate.setMinutes(findDate.getMinutes() - 5);
        transactions.map(async (tx) => {
            if (await this.#checkHashAndUpdateIfNotValid(tx.hash)) {
                if (!await this.#checkTransactionStatusAndConfirm(tx.hash)) {
                    if (tx.created_at <= findDate) {
                        await this.transactionsService.updateStatus(tx.hash, this.transactionsService.REJECTED_STATUS)
                    }
                }
            }
        });
    }

    async #checkHashAndUpdateIfNotValid(hash) {
        if (!this.web3.isTxHash(hash)) {
            await this.transactionsService.updateStatusMany(hash, this.transactionsService.REJECTED_STATUS) // If stored not valid hash, resend new tx
            return false;
        }
        return true;
    }


    /**
     * Handle transaction which was rejected
     * @returns {Promise<void>}
     */
    async handleRejectedTransactions() {
        let transactions = await this.transactionsService.getLastRejectedTransaction();
        transactions.map(async (tx) => {
            if (await this.#checkHashAndUpdateIfNotValid(tx.hash)) {
                if (!await this.#checkTransactionStatusAndConfirm(tx.hash)) {
                    await this.resendTransactionForObj(tx);
                }
            }
        });
    }

    async #checkTransactionStatusAndConfirm(hash) {
        let transactionReceipt = await this.web3.getTransactionReceipt(hash);
        let transaction = await this.web3.getTransactionByHash(hash);
        if (transactionReceipt) {
            if (transactionReceipt.status === true) {
                await this.transactionsService.updateStatus(hash, this.transactionsService.CONFIRMED_STATUS);
                return true;
            } else if (transactionReceipt.status === false && transaction.gas === transactionReceipt.gasUsed) {
                await this.transactionsService.updateStatus(hash, this.transactionsService.REJECTED_STATUS);
            } else if (transactionReceipt.status === false) {
                await this.transactionsService.updateStatus(hash, this.transactionsService.REVERTED_BY_CONTRACT);
                return true;
            }
            return false;
        }
        return false;
    }

    async resendTransactionForObj(txObj) {
        let {response, rawTxObject} = await this.resendTransactionAndIncreaseGas(txObj.raw_tx);
        if (response && this.web3.isTxHash(response.result)) {
            await this.transactionsService.updateStatusWithHash(txObj.nonce, response.result, this.transactionsService.UNCONFIRMED_STATUS, rawTxObject);
        }
        if (response && response.error) {
            let error = response.error.data;
            if (error && error.code === -32000 && error.message === 'nonce too low') {
                let {res, rawTxObjectNewNonce} = await this.resendWithNewNonce(rawTxObject);
                if (res && this.web3.isTxHash(res.result)) {
                    await this.transactionsService.updateStatus(txObj.hash, this.transactionsService.REJECTED_BLOCKCHAIN_STATUS, res.result);
                    await this.transactionsService.updateStatusWithHash(rawTxObjectNewNonce.nonce, res.result, this.transactionsService.UNCONFIRMED_STATUS, rawTxObjectNewNonce);
                }
            }
        }
    }

    async resendWithNewNonce(rawTx) {
        if (rawTx === undefined) {
            return;
        }
        let nonce = await this.checkDbNonce(this.nonce);
        rawTx.nonce = nonce;
        let singedTx = await this.walletService.singTx(rawTx);
        let response = await this.web3.broadcast(singedTx);
        return {rawTxObjectNewNonce: rawTx, res: response, singedTx};
    }

}

export default ContractTransactionsService;