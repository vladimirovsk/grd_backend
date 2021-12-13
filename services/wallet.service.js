'use strict'

import Web3Service from './web3.service';
import BadRequestException from '../exceptions/BadRequestException';
import WalletConfigs from '../config/wallet';


class WalletService {

    constructor({container}) {
        this.web3 = container.resolve('web3Service')
    }

    // Getters and Setters

    get ownerAddress() {
        return WalletConfigs.address;
    }

    get #walletKey() {
        return WalletConfigs.key;
    }

    get #walletJson() {
        return WalletConfigs.walletJson;
    }

    // Methods

    /**
     * Get wallet balance
     * @param address
     * @returns {Promise<string>}
     */
    getWalletBalance(address) {
        this.web3.isEthereumAddress(address); // check address format
        return this.web3.balanceOf(address);
    }

    /**
     * Check wallet balance
     * @param address
     * @param neededBalance
     * @returns {Promise<boolean>}
     */
    async checkWalletBalance(address, neededBalance) {
        this.web3.isEthereumAddress(address);
        let currentBalance = this.web3.balanceOf(address);

        if (currentBalance < neededBalance * 1e18) {
            throw BadRequestException('You can\'t money for buy tokens');
        } else {
            return true;
        }
    }

    /**
     * Sing transaction using wallet file
     * @param txObject
     * @returns {Promise<string>}
     */
    async singTx(txObject) {
        let wallet = this.web3.decryptWalletJson(this.#walletJson, this.#walletKey);
        let signedTransaction = await this.web3.signTransactionObj(txObject, wallet[0].privateKey);
        return signedTransaction.rawTransaction;
    }
}

export default WalletService;