const router = require('express').Router();

const ContractController = require('../../http/controllers/contract.controller');
const CheckEthereumAddressParam = require('../../http/requests/checkEthereumAddress.request');
const CheckAmountParam = require('../../http/requests/checkAmountParam.request');
const CheckToAndAmountParam = require('../../http/requests/checkToAndAmountParam.request');

router.get('/totalSupply', ContractController('totalSupply'));
router.get('/balanceOf/:address', CheckEthereumAddressParam.validate, ContractController('balanceOf'));
router.post('/add_tokens/:amount', CheckAmountParam.validate, ContractController('addTokens'));
router.post('/burn/:amount', CheckAmountParam.validate, ContractController('burnTokens'));
router.post('/transfer/:to/:amount', CheckToAndAmountParam.validate, ContractController('transferTokens'));
router.post('/transfer_to_owner/:amount', CheckAmountParam.validate, ContractController('transferTokensToContractOwner'));
router.get('/allowance/:owner/:spender', ContractController('allowance'));
router.get('/transactions/count', ContractController('getContractTxCount'));

module.exports = router;
