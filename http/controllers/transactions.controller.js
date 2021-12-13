"use strict"

import TransactionsService from "../../services/transactions.service";

const {makeInvoker} = require('awilix-express');
const ResponseCodes = require('../../routes/helpers/responseCodes');

const TransactionsController = ({web3Service, transactionService}) => ({

    transactionRecipient: async (req, res, next) => {
        let txHash = req.query.hash;
        let transaction = await web3Service.getTransactionReceipt(txHash);
        res.status(ResponseCodes.Ok).json({transaction});
    },

    transactionRecipientLogs: async (req, res, next) => {
        let txHash = req.query.hash;
        let logs = (await web3Service.getTransactionReceipt(txHash)).logs;
        res.status(ResponseCodes.Ok).json({logs});
    },

    transaction: async (req, res, next) => {
        let txHash = req.query.hash;
        let transaction = await web3Service.getTransactionByHash(txHash);
        res.status(ResponseCodes.Ok).json({transaction});
    },

    getTransactionReplace: async (req, res, next) => {
        let txHash = req.params.hash;
        let txHistory = await transactionService.getTransactionReplacement(txHash);
        let blockchainTx = await web3Service.getTransactionByHash(txHash);
        let blockchainTxInfo = await web3Service.getTransactionReceipt(txHash);
        let status = false;
        if (txHistory.newTx !== null) {
            status = txHistory.newTx.status === transactionService.CONFIRMED_STATUS;
        } else if (txHistory.prevTx !== null) {
            status = txHistory.prevTx.status === transactionService.CONFIRMED_STATUS;
        } else if (blockchainTxInfo !== null) {
            status = blockchainTxInfo.status;
        }
        res.status(ResponseCodes.Ok).json({
            txHash: txHash || null,
            status,
            txLastStatus: txHistory.newTx !== null ? txHistory.newTx.status : false,
            txLast: txHistory.newTx,
            txPrev: txHistory.prevTx,
            blockchainTx,
            blockchainTxInfo
        });
    },

    getHundredAddedTransactions: async (req, res, next) => {
        let transactions = await transactionService.getLastHundredTransactions();
        res.status(ResponseCodes.Ok).json({transactions});
    },

    getLastTransactions: async (req, res, next) => {
        let limit = req.params.limit;
        let transactions = await transactionService.getLastTransactionsWithLimit(limit);
        res.status(ResponseCodes.Ok).json({transactions});
    }


});

module.exports = makeInvoker(TransactionsController);
