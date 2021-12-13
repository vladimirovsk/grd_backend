"use strict"

import contractConfigs from '../config/contract';
import BadRequestException from '../exceptions/BadRequestException';
import BigNumber from "bignumber.js";
import InvalidAddressException from "../exceptions/ethereum/InvalidAddressException";

/**
 * @class ContractService
 */
class ContractService {

    constructor({container}) {
        this.init(container);
    }

    init(container) {
        this.web3 = container.resolve('web3Service');
        this.nonceService = container.resolve('nonceService');
        this.walletService = container.resolve('walletService');
        this.transactionsService = container.resolve('transactionService');
        this.contract = this.web3.contractInstance(contractConfigs.address, contractConfigs.abi);
    }

    // Getters and Setters

    /**
     * Get ERC20 decimals for contract
     * @returns {*}
     */
    get decimals() {
        return this.contract.methods.decimals().call();
    }

    /**
     * Return contract address
     * @returns {*}
     */
    get address() {
        return contractConfigs.address;
    }

    /**
     * Get contract owner address
     * @returns {*}
     */
    get ownerAddress() {
        return this.walletService.ownerAddress;
    }

    /**
     * Returns tokens owner address
     * @returns {*}
     */
    get tokensOwnerAddress() {
        return contractConfigs.tokensOwnerAddress;
    }

    /**
     * Address of wallet which would be use for burning tokens
     */
    get burnWalletAddress() {
        return contractConfigs.burnAbleAddress;
    }

    /**
     * Return tx count for contract
     * @returns {Promise<number>}
     */
    get transactionsCount() {
        return this.web3.eth.getTransactionCount(contractConfigs.address);
    }

    get nonce() {
        return this.nonceService.getNonceValue;
    }

    // Methods

    async totalSupply() {
        return this.contract.methods.totalSupply().call();
    }

    async balanceOf(address) {
        if (!this.web3.isEthereumAddress(address)) {
            throw new BadRequestException('Invalid ethereum address');
        }
        return this.contract.methods.balanceOf(address).call();
    }

    async allowance(owner, spender) {
        if (!this.web3.isEthereumAddress(owner) || !this.web3.isEthereumAddress(spender)) {
            throw new BadRequestException('Invalid ethereum address');
        }
        return this.contract.methods.allowance(owner, spender).call();
    }

    async #generateContractRawTx(data) {
        let nonce = await this.checkDbNonce(this.nonce);
        let rawTxObject = await this.web3.prepareRawTx(nonce, this.ownerAddress, this.address, '0x0', data);
        let singedTx = await this.walletService.singTx(rawTxObject);
        return {singedTx, rawTxObject};
    }

    /**
     * Check DB nonce
     * @param nonce
     * @returns {Promise<void>}
     */
    async checkDbNonce(nonce) {
        do {
            try {
                let transaction = await this.transactionsService.getLastTransaction();
                let blockChainNonce = await this.getTxCount();
                if (blockChainNonce) {
                    blockChainNonce = Number(blockChainNonce) - 1;
                    if (blockChainNonce <= nonce && (Number(blockChainNonce) + 2) >= nonce) {
                        nonce = await this.#increaseFileNonce(blockChainNonce);
                    }
                    if (Number(transaction.nonce) >= nonce && blockChainNonce === Number(transaction.nonce)) {
                        nonce = await this.#increaseFileNonce(transaction.nonce);
                    }
                }
                await this.transactionsService.createTxData(nonce, null, Date.now(), this.transactionsService.PREPARE_TX_STATUS, {});
                break;
            } catch (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    console.log('checkDbNonce:', err);
                    continue;
                }
                break;
            }
        } while (true); // It's not good, in future must be changed

        return nonce;
    }

    async #increaseFileNonce(newNonce) {
        let nonce = Number(newNonce) + 1;
        this.nonceService.write(nonce);
        return nonce;
    }

    /**
     * Convert value to amount given contract decimals
     * @param amount
     * @returns {Promise<BigNumber>}
     */
    async #convertAmount(amount) {
        let decimals = await this.decimals;
        return new BigNumber(Number(amount)).multipliedBy(new BigNumber(10).pow(decimals));
    }

    /**
     * Convert big number to string
     * @param number
     * @returns {string}
     */
    #convertBigNumber(number) {
        let amount = new BigNumber(Number(number));
        return amount.toFixed();
    }

    /**
     * Validate amount
     * @param amount
     */
    #checkAmountOnUndefined(amount) {
        if (isNaN(amount) || amount === undefined) {
            throw new BadRequestException("Invalid amount");
        }
    }

    /**
     * Validate address
     * @param address
     */
    #checkIfEthAddress(address) {
        if (!this.web3.isEthereumAddress(address)) {
            throw new InvalidAddressException("Invalid address format");
        }
    }

    async addNewTokens(amount) {
        this.#checkAmountOnUndefined(amount);
        let value = await this.#convertAmount(amount);
        let data = this.contract.methods.mint(this.tokensOwnerAddress, value.toFixed()).encodeABI();
        return await this.#generateRawTxAndBroadcast(data);
    }

    async burnTokens(amount) {
        let burnAmount = await this.#convertAmount(amount);
        return await this.burnTokensFrom(this.burnWalletAddress, burnAmount);
    }

    async burnTokensFrom(address, amount) {
        this.#checkIfEthAddress(address);
        this.#checkAmountOnUndefined(amount);
        let value = this.#convertBigNumber(amount);
        let data = this.contract.methods.burnFrom(address, value).encodeABI();
        return await this.#generateRawTxAndBroadcast(data);
    }

    async transferTokens(to, amount) {
        let transferAmount = await this.#convertAmount(amount);
        return await this.transferTokensFrom(this.ownerAddress, to, transferAmount);
    }

    async transferToOwner(amount) {
        let transferAmount = await this.#convertAmount(amount);
        return await this.transferTokensFrom(this.tokensOwnerAddress, this.ownerAddress, transferAmount);
    }

    async transferTokensFrom(from, to, amount) {
        this.#checkIfEthAddress(from);
        this.#checkIfEthAddress(to);
        this.#checkAmountOnUndefined(amount);
        let value = this.#convertBigNumber(amount);
        let data = this.contract.methods.transferFrom(from, to, value).encodeABI();
        return await this.#generateRawTxAndBroadcast(data);
    }

    async #generateRawTxAndBroadcast(data) {
        let {rawTxObject, singedTx} = await this.#generateContractRawTx(data);
        let res = await this.web3.broadcast(singedTx);
        if (this.web3.isTxHash(res.result)) {
            await this.transactionsService.updateStatusWithHash(rawTxObject.nonce, res.result, this.transactionsService.UNCONFIRMED_STATUS, rawTxObject);
            this.nonceService.increase(); // increase nonce in file
        } else {
            // if (res && res.error) {
            //     this.nonceService.increase(); // increase nonce in file
            // }
            await this.#syncNonce(); // sync nonce with count tx for contract address
        }
        return res;
    }

    /**
     * Increase gasPrice, gasLimit for tx and resend transaction
     * @param rawTxObject
     * @returns {Promise<{rawTxObject: *, response: unknown, singedTx: string}>}
     */
    async resendTransactionAndIncreaseGas(rawTxObject) {
        if (rawTxObject === undefined) {
            return;
        }
        rawTxObject.gasPrice = await this.web3.increaseTxGasPrice(rawTxObject.gasPrice);
        rawTxObject.gasLimit = this.web3.increaseTxGasLimit(rawTxObject.gasLimit);
        let singedTx = await this.walletService.singTx(rawTxObject);
        let response = await this.web3.broadcast(singedTx);
        return {rawTxObject, response, singedTx};
    }

    /**
     * Sync nonce with contract current value
     * @returns {Promise<void>}
     */
    async #syncNonce() {
        let count = await this.getTxCount();
        this.nonceService.write(count);
    }

    /**
     * Return contract tx count
     * @returns {Promise<number>}
     */
    async getTxCount() {
        return await this.web3.transactionCountForAddress(this.ownerAddress);
    }
}

export default ContractService;
