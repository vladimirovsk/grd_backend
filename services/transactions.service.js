import TransactionSchema from '../models/transaction.model';
import InvalidStatusException from "../exceptions/transactions/InvalidStatusException";

class TransactionsService {

    UNCONFIRMED_STATUS = 'Unconfirmed';

    CONFIRMED_STATUS = 'Confirmed';

    REJECTED_STATUS = 'Rejected';

    REJECTED_BLOCKCHAIN_STATUS = 'Rejected in blockchain';

    REVERTED_BY_CONTRACT = 'Reverted action by contract';

    PREPARE_TX_STATUS = 'Preparing transaction'

    BASE_STATUSES = [this.UNCONFIRMED_STATUS, this.CONFIRMED_STATUS, this.REJECTED_STATUS, this.PREPARE_TX_STATUS, this.REJECTED_BLOCKCHAIN_STATUS, this.REVERTED_BY_CONTRACT];

    createTxData(nonce, hash, created_at, status = this.UNCONFIRMED_STATUS, raw_tx = {}, newTxHash = "") {
        this.#validateStatus(status);
        return TransactionSchema.create({
            nonce,
            hash,
            created_at,
            status,
            raw_tx,
            new_tx_hash: newTxHash
        });
    }

    updateStatus(hash, status, newTxHash = null) {
        this.#validateStatus(status);
        let updateData = {status, updated_at: Date.now()};
        if (newTxHash !== null) {
            updateData.new_tx_hash = newTxHash;
        }
        return TransactionSchema.updateOne({hash}, updateData);
    }

    updateStatusMany(hash, status) {
        this.#validateStatus(status);
        return TransactionSchema.updateMany({hash}, {status, updated_at: Date.now()});
    }

    updateStatusWithHash(nonce, hash, status, txObj, newTxHash = null) {
        this.#validateStatus(status);
        let updateData = {
            hash,
            status,
            raw_tx: txObj,
            updated_at: Date.now()
        };
        if (newTxHash !== null) {
            updateData.new_tx_hash = newTxHash;
        }

        return TransactionSchema.updateOne({nonce}, updateData);
    }

    #validateStatus(status) {
        if (!this.BASE_STATUSES.includes(status)) {
            throw new InvalidStatusException(`Current status ${status} is not valid`);
        }
    }

    async getLastUnconfirmedTransactions() {
        return await TransactionSchema.find({status: this.UNCONFIRMED_STATUS});
    }

    async getLastRejectedTransaction() {
        return await TransactionSchema.find({status: this.REJECTED_STATUS});
    }

    async getLastRejectedTransaction() {
        return await TransactionSchema.find({status: this.REJECTED_STATUS});
    }

    async getLastTransaction() {
        return await TransactionSchema.findOne().sort({_id: -1});
    }

    async getTransactionReplacement(hash) {
        let prevTx = await TransactionSchema.findOne({hash});
        let newTx = await TransactionSchema.findOne({
            hash: prevTx != null ? prevTx.new_tx_hash : false
        });
        return {prevTx, newTx};
    }

    async all() {
        return await TransactionSchema.find();
    }

    async getLastHundredTransactions() {
        return await TransactionSchema.find().sort({_id: -1}).limit(100);
    }

    async getLastTransactionsWithLimit(limit) {
        return await TransactionSchema.find().sort({_id: -1}).limit(limit);
    }
}

export default TransactionsService;