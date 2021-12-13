import MongoService from "../services/mongo.service";
import Web3Service from "../services/web3.service";
import ContractService from "../services/contract.service";
import NonceService from "../services/nonce.service";
import TransactionsService from "../services/transactions.service";
import ContractTransactionsService from '../services/contractTransactions.service';
import WalletService from "../services/wallet.service";
import ApiService from "../services/api.service";
import {asValue, asClass, asFunction} from "awilix";

module.exports = (container) => ({
    mongoService: asClass(MongoService).scoped(),
    web3Service: asClass(Web3Service).scoped(),
    contractService: asFunction(() => new ContractService({container})).scoped(),
    nonceService: asClass(NonceService).scoped(),
    transactionService: asFunction(() => new TransactionsService()).scoped(),
    contractTransactionsService : asFunction(() => new ContractTransactionsService({container})).scoped(),
    walletService : asFunction(() => new WalletService({container})).scoped(),
    apiService : asValue(ApiService)
});