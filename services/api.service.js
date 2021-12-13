"use strict"

const fetch = require('node-fetch');
const apiConfig = require('../config/api');

const ApiService = {

    async broadcastEtherscanRopsten(txHash) {
        return await (await fetch(`https://api-ropsten.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${txHash}&apikey=${apiConfig.ethererscanApiKey}`)).json()
    },

    async broadcastEtherscanMain(txHash) {
        return await (await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${txHash}&apikey=${apiConfig.ethererscanApiKey}`)).json()
    },

    async loadApiGasPrice() {
        return (await fetch('https://www.etherchain.org/api/gasPriceOracle')).json();
    }
};

export default ApiService;