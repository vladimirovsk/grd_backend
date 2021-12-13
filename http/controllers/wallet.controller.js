const {makeInvoker} = require('awilix-express');
const ResponseCodes = require('../../routes/helpers/responseCodes');

/**
 * @class WalletController
 * @type {{checkWalletBalance(*, *, *)}}
 */
const WalletController = ({walletService}) => ({

    async checkWalletBalance(req, res, next) {
        let address = req.params.address;
        let balance = await walletService.getWalletBalance(address);
        res.status(ResponseCodes.Ok).json({balance});
    },

    async checkNeededBalance(req, res, next) {
        let address = req.params.address;
        let amount = req.params.amount;
        await walletService.checkWalletBalance(address, amount);
        res.status(ResponseCodes.NoContent);
    },
});

module.exports = makeInvoker(WalletController);