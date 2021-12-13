const router = require('express').Router();
const TransactionsController = require('../../http/controllers/transactions.controller');

router.get('/tx/recipient', TransactionsController('transactionRecipient'));
router.get('/tx/recipient/logs', TransactionsController('transactionRecipientLogs'));
router.get('/tx', TransactionsController('transaction'));

module.exports = router;