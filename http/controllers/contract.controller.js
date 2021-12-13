"use strict"

const {makeInvoker} = require('awilix-express');
const ResponseCodes = require('../../routes/helpers/responseCodes');

const ContractController = ({contractService}) => ({

    transferTokens: async (req, res, next) => {
        let txHash = await contractService.transferTokens(req.params.to, req.params.amount);
        res.status(ResponseCodes.Ok).json({txHash});
    },

    totalSupply: async (req, res, next) => {
        let supply = await contractService.totalSupply();
        res.status(ResponseCodes.Ok).json({totalSupply: supply});
    },

    balanceOf: async (req, res, next) => {
        let userToken = req.params.address;
        let balance = await contractService.balanceOf(userToken);
        res.status(ResponseCodes.Ok).json({balance});
    },

    allowance: async (req, res, next) => {
        let owner = req.params.owner;
        let spender = req.params.spender;
        let allowance = await contractService.allowance(owner, spender);
        res.status(ResponseCodes.Ok).json({allowance});
    },

    addTokens: async (req, res, next) => {
        let amount = req.params.amount;
        let txHash = await contractService.addNewTokens(amount);
        res.status(ResponseCodes.Ok).json({txHash});
    },

    burnTokens: async (req, res, next) => {
        let amount = req.params.amount;
        let txHash = await contractService.burnTokens(amount);
        res.status(ResponseCodes.Ok).json({txHash});
    },

    transferTokensToContractOwner: async (req, res, next) => {
        let amount = req.params.amount;
        let txHash = await contractService.transferToOwner(amount);
        res.status(ResponseCodes.Ok).json({txHash});

    },

    getContractTxCount: async (req, res, next) => {
        let count = await contractService.getTxCount();
        res.status(ResponseCodes.Ok).json({count});
    }
});

module.exports = makeInvoker(ContractController);
