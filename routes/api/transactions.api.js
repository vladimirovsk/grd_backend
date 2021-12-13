const router = require('express').Router();
const TransactionsController = require('../../http/controllers/transactions.controller');
const ValidateLimitParams = require('./../../http/requests/chechLimitParameter.request');

router.get('/:hash/info', TransactionsController('getTransactionReplace'));
router.get('/:limit', ValidateLimitParams.validate, TransactionsController('getHundredAddedTransactions'));
router.get('/last/hundred', TransactionsController('getHundredAddedTransactions'));

module.exports = router;
