"use strict"

import infuraConfigs from '../config/api';
import ApiService from './api.service';
import EthDefault from '../config/ethereum/defaultValues';
import AppConfigs from '../config/index';
import BadRequestException from "../exceptions/BadRequestException";
import Web3 from "web3";
import ProviderEngine from 'web3-provider-engine';
import InfuraSubProvider from 'web3-provider-engine/subproviders/fetch';
import RPCSubProvider from 'web3-provider-engine/subproviders/rpc';
import NonceSubprovider from 'web3-provider-engine/subproviders/nonce-tracker';
import CacheSubprovider from 'web3-provider-engine/subproviders/cache';
import FilterSubprovider from 'web3-provider-engine/subproviders/filters';

/**
 *
 * @class Web3Service
 */
class Web3Service {

    baseBroadcastChannels = ['infura', 'etherscan'];

    constructor() {
        let engine = new ProviderEngine();
        // engine.addProvider(new InfuraSubProvider({rpcUrl: infuraConfigs.addressInfura})); // Disabled infura because, don't work correctly 
        // engine.addProvider(new RPCSubProvider({rpcUrl: "https://main-rpc.linkpool.io"}));
        engine.addProvider(new RPCSubProvider({rpcUrl: "http://54.163.149.186:29943"}));
        engine.addProvider(new RPCSubProvider({rpcUrl: infuraConfigs.nodeRPCAddress}));
        engine.addProvider(new CacheSubprovider());
        engine.addProvider(new FilterSubprovider());
        engine.addProvider(new NonceSubprovider())
        engine.start();
        this.web3 = new Web3(engine);
        this.isTest = AppConfigs.debug;
    }

    // Getters and Setters

    /**
     * Get name of preffered broadcast channel
     * @returns {*|string}
     */
    get preferredBroadcastChannel() {
        return this.baseBroadcastChannels.includes(AppConfigs.preferredBroadcastTxChannel) ? AppConfigs.preferredBroadcastTxChannel : 'infura';
    }

    /**
     * Get base gas price from configs
     * @returns {*}
     */
    get baseGasPrice() {
        return EthDefault.gasPrice;
    }

    //  Methods

    /**
     * Get node gas price
     * @returns {Promise<string|*>}
     */
    async getGasPrice() {
        return await this.web3.eth.getGasPrice() || this.baseGasPrice;
    }

    /**
     * Returning contract instance
     * @param contractAddress
     * @param contractAbi
     * @returns {Contract}
     */
    contractInstance(contractAddress, contractAbi) {
        return new this.web3.eth.Contract(contractAbi, contractAddress);
    }

    /**
     * Get eth balance
     * @param address
     * @returns {Promise<string>}
     */
    async balanceOf(address) {
        if (!this.isEthereumAddress(address)) {
            throw new Error('Invalid ethereum address');
        }
        return this.web3.eth.getBalance(address);
    }

    /**
     * Validate address format
     * @param address
     * @returns {*|boolean}
     */
    isEthereumAddress(address) {
        let regex = /^0x[a-fA-F0-9]{40}$/;
        return address && regex.test(address);
    }

    /**
     * Validate tx hash format
     * @param hash
     * @returns {*|boolean}
     */
    isTxHash(hash) {
        let regex = /^0x([A-Fa-f0-9]{64})$/;
        return hash && regex.test(hash);
    }

    /**
     * Broadcast transaction
     * @param txHash
     * @returns {Promise<unknown>}
     */
    async broadcast(txHash) {
        let isWeb3 = this.preferredBroadcastChannel === 'infura';
        if (this.isTest && !isWeb3) {
            return await ApiService.broadcastEtherscanRopsten(txHash);
        } else if (!this.isTest && !isWeb3) {
            return await ApiService.broadcastEtherscanMain(txHash);
        } else if (isWeb3) {
            return await this.sendTransactionTxHashHelper(txHash);
        } else {
            throw new BadRequestException("Invalid broadcast server");
        }
    }


    /**
     * Send transaction hash via infura
     * @param tx
     * @returns {Promise<unknown>}
     */
    async sendTransactionTxHashHelper(tx) {
        return new Promise((resolve, reject) => {
            this.web3.eth.sendSignedTransaction(tx).on('transactionHash', (transactionHash) => {
                resolve({result: transactionHash});
            }).catch(error => {
                resolve({error})
            });
        });
    }


    /**
     * Calculate gas for action
     * @param nonce
     * @param from
     * @param to
     * @param data
     * @returns {Promise<unknown>}
     */
    async estimateGas(nonce, from, to, data) {
        return new Promise((resolve, reject) => {
            this.web3.eth.estimateGas({
                "from": from,
                "nonce": nonce,
                "to": to,
                "data": data
            }).then(((res) => resolve(res))).catch(resolve);
        });
    }


    /**
     * Convert object to buffer
     * @param obj
     * @returns {Buffer}
     */
    bufFromObject(obj) {
        return Buffer.from(JSON.stringify(obj));
    }


    /**
     * Convert hex sting to buffer
     * @param hex
     * @returns {Buffer}
     */
    bufFromHex(hex) {
        return Buffer.from(hex, 'hex');
    }


    /**
     * Calculate gas base limit
     * @param bytes
     * @param feePerByte
     * @param gasTransaction
     * @returns {number}
     */
    calculateGasLimit(bytes, feePerByte = 95, gasTransaction = 55000) {
        return gasTransaction + bytes * feePerByte;
    }

    /**
     * Get count transactions for address
     * @param address
     * @returns {Promise<number>}
     */
    async transactionCountForAddress(address) {
        return await this.web3.eth.getTransactionCount(address, "pending");
    }

    /**
     * Calculate gas limit for tx object
     * @param rawTransactionObj
     * @returns {Promise<number>}
     */
    async getGasLimitForTxObject(rawTransactionObj) {
        return this.calculateGasLimit(this.bufFromObject(rawTransactionObj).length);
    }

    /***
     * Make tx object
     * @param nonce
     * @param fromAddress
     * @param toAddress
     * @param value
     * @param data
     * @returns {Promise<{gasLimit: *, data: null, from: string, to: string, value: string, nonce: string, gasPrice: string}>}
     */
    async prepareRawTx(nonce = 0, fromAddress = '0x', toAddress = '0x', value = 0, data = null) {
        let apiGasPrice = await ApiService.loadApiGasPrice();
        apiGasPrice = this.#convertGasPrice(apiGasPrice.fast || this.baseGasPrice);
        let rawTx = {
            "from": fromAddress,
            "gasPrice": this.web3.utils.toHex(apiGasPrice),
            "gasLimit": EthDefault.baseGasLimit,
            "to": toAddress,
            "value": this.web3.utils.toHex(value),
            "data": data,
            "nonce": this.web3.utils.toHex(nonce)
        };
        let limit = this.calculateGasLimit(this.bufFromObject(rawTx).length); // calculate limit for tx object
        rawTx.gasLimit = this.web3.utils.toHex(limit);
        return rawTx;
    }

    async increaseTxGasPrice(previousGasPriceHex) {
        let price = this.web3.utils.hexToNumber(previousGasPriceHex);
        price += this.#convertGasPrice(this.baseGasPrice);
        return this.web3.utils.toHex(price);
    }

    increaseTxGasLimit(previousGasLimitHex) {
        let price = this.web3.utils.hexToNumber(previousGasLimitHex);
        price += EthDefault.gasLimitStep;
        return this.web3.utils.toHex(price);
    }

    /**
     * Convert tx price
     * @param price
     * @returns {number}
     */
    #convertGasPrice(price) {
        return Number(price) * Math.pow(10, 9)
    }

    /**
     * Decrypt wallet
     * @param walletJson
     * @param key
     * @returns {WalletBase}
     */
    decryptWalletJson(walletJson, key) {
        return this.web3.eth.accounts.wallet.decrypt(walletJson, key);
    }

    /**
     * Sing tx object using wallet private key
     * @param txObj
     * @param privKey
     * @returns {Promise<SignedTransaction>}
     */
    async signTransactionObj(txObj, privKey) {
        return await this.web3.eth.accounts.signTransaction(txObj, privKey);
    }

    async getTransactionByHash(txHash) {
        return await this.web3.eth.getTransaction(txHash);
    }

    async getTransactionFromBlock(txHash, index) {
        return await this.web3.eth.getTransactionFromBlock(txHash, index);
    }

    async getTransactionReceipt(txHash) {
        return await this.web3.eth.getTransactionReceipt(txHash);
    }
}

export default Web3Service;
