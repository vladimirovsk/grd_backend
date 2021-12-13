let express = require('express');
let Web3 = require('web3');
let logger = require('morgan');
let schedule = require('node-schedule');
const fetch = require('node-fetch');
const BigNumber = require('bignumber.js');


let walletJson = [{
    "address": "040cdbbb1592c65194352e30474a069b362edcb2",
    "crypto": {
        "cipher": "aes-128-ctr",
        "ciphertext": "b87d2da871670396c8f6f1226be73f80626016d62e85b8a2a2d509242b7be276",
        "cipherparams": {"iv": "e79415ace080b46c33420b387f4aa5e2"},
        "kdf": "scrypt",
        "kdfparams": {
            "dklen": 32,
            "n": 262144,
            "p": 1,
            "r": 8,
            "salt": "a5154df63a79b3c68715900676231492210203836c07b38d41029080798a2ba8"
        },
        "mac": "424ac25bfd7606b7e83d8da021ad7679a4a04f8df1fef4fbefd1790544c85a96"
    },
    "id": "ad0e79f8-1111-40e8-8194-f9b88bb940a8",
    "version": 3
}];
let walletKey = 'rx9AiKi4cPjR9n';
let contractAddress = null;
let addressForBurn = '0x96F4676451f672F34062C3dA9715B7a66B474748';
let fromAddress = '0x040cdBbb1592c65194352E30474a069b362edcb2';
let toAddress = '0x809c2f8e552b1e86628fe43ba3c064d306a667da';
const ETHER_SCAN_API_KEY = 'TFUH9HESRM8KK73DNHN1NVD96VZ1T9UXD3';
const BROADCAST_TO_TEST_NET = true;
let web3 = null;
if (BROADCAST_TO_TEST_NET) {
    contractAddress = '0x9bbf4ecf451d74688e6ccbf94deaa2d2c90ca956';
    web3 = new Web3('https://ropsten.infura.io/v3/f4afc971ae0642e58818c0f965766e69');
} else {
    contractAddress = '0x4911F8CebD546ef805E81Dd0B0084A90D11a7688';
    web3 = new Web3('https://mainnet.infura.io/v3/f4afc971ae0642e58818c0f965766e69');
}
let abiArray = [];

let app = express();
let router = express.Router();

app.use(logger('dev'));
app.use(function (req, res, next) {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use('/api', router);

router.get('/test/connection', function (req, res, next) {
    res.json({isServerWorks: true});
});

router.get('/contract/totalSupply', function (req, res, next) {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        contract.methods.totalSupply().call().then((balance) => {
            console.log(res);
            res.json({totalSupply: balance})
        });
    } catch (e) {
        next(e);
        res.status(403).json({message: 'Error! Something is wrong!'})
    }
});

router.get('/contract/balanceOf/:address', function (req, res, next) {
    let userToken = req.params.address;
    let regex = /^0x[a-fA-F0-9]{40}$/;
    if (userToken && regex.test(userToken)) {
        try {
            let contract = new web3.eth.Contract(abiArray, contractAddress);
            contract.methods.balanceOf(userToken).call().then(function (balance) {
                res.json({balance: balance});
            });
        } catch (e) {
            next(e);
            res.status(403).json({message: 'Error! Something is wrong!'})
        }
    } else {
        res.status(400).json({message: 'Error! It address is not valid'})
    }
});


router.get('/contract/check_money/:address/:amount', function (req, res, next) {
    let toAddress = req.params.address;
    let regex = /^0x[a-fA-F0-9]{40}$/
    if (toAddress && regex.test(toAddress) && req.params.amount) {
        try {
            web3.eth.getBalance(toAddress).then(function (balance) {
                if (balance < req.params.amount * 1e18) {
                    res.status(400).json({message: 'You can\'t money for buy tokens'})
                } else {
                    res.json({message: ''});
                }
            });
        } catch (e) {
            next(e);x
            res.status(403).json({message: 'Error! Something is wrong!'})
        }
    } else {
        res.status(400).json({message: 'Error! It token is not valid'})
    }
});

router.post('/contract/add_tokens/:amount', async function (req, res, next) {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        let count;
        let gasPrice = await loadApiGasPrice();
        gasPrice = Number(gasPrice.standard) * Math.pow(10, 9);
        if (gasPrice === undefined) {
            throw new Error("Invalid gas price");
        }
        let decimals = await contract.methods.decimals().call();

        web3.eth.getTransactionCount(fromAddress).then(async function (v) {
            console.log("Count: " + v);
            count = v;
            let amount = new BigNumber(Number(req.params.amount) * (10 ** decimals));
            //creating raw transaction
            let rawTransaction = {
                "from": fromAddress,
                "gasPrice": web3.utils.toHex(gasPrice),
                "gasLimit": '21000',
                "to": contractAddress,
                "value": '0x0',
                "data": contract.methods.mint(toAddress, amount.toFixed()).encodeABI(),
                "nonce": web3.utils.toHex(count)
            };
            let gasLimit = calculateGasLimit(bufFromObject(rawTransaction).length);
            rawTransaction.gasLimit = gasLimit;
            let txSigned = await singTx(rawTransaction);

            broadcast(txSigned, BROADCAST_TO_TEST_NET).then((txHash) => {
                res.json({txHash});
            }).catch((error) => {
                res.json({status: 'error', message: error.message});
            });
        })
    } catch (e) {
        next(e);
        res.status(403).json({message: 'Error! Something is wrong!'})
    }
});

router.post('/contract/burn/:amount', async function (req, res, next) {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        let count;
        let gasPrice = await web3.eth.getGasPrice();
        let decimals = await contract.methods.decimals().call();

        web3.eth.getTransactionCount(fromAddress).then(async function (v) {
            console.log("Count: " + v);
            count = v;
            let amount = new BigNumber(Number(req.params.amount) * (10 ** decimals));
            //creating raw tranaction
            let rawTransaction = {
                "from": fromAddress,
                "gasPrice": web3.utils.toHex(gasPrice),
                "gasLimit": '21000',
                "to": contractAddress,
                "value": '0x0',
                "data": contract.methods.burnFrom(addressForBurn, amount.toFixed()).encodeABI(),
                "nonce": web3.utils.toHex(count)
            }
            let gasLimit = calculateGasLimit(bufFromObject(rawTransaction).length);
            rawTransaction.gasLimit = gasLimit;
            let txSigned = await singTx(rawTransaction);

            broadcast(txSigned, BROADCAST_TO_TEST_NET).then((txHash) => {
                res.json({txHash});
            }).catch((error) => {
                res.json({status: 'error', message: error.message});
            });
        });
    } catch (e) {
        next(e);
        res.status(403).json({message: 'Error! Something is wrong!'})
    }
});

router.post('/contract/transfer/:to/:amount', async function (req, res, next) {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        let count;
        let gasPrice = await web3.eth.getGasPrice();
        let decimals = await contract.methods.decimals().call();

        web3.eth.getTransactionCount(fromAddress).then(async function (v) {
            console.log("Count: " + v);
            count = v;
            let amount = new BigNumber(Number(req.params.amount) * (10 ** decimals));
            //creating raw tranaction
            let rawTransaction = {
                "from": fromAddress,
                "gasPrice": web3.utils.toHex(gasPrice),
                "gasLimit": '21000',
                "to": contractAddress,
                "value": '0x0',
                "data": contract.methods.transferFrom(fromAddress, req.params.to, amount.toFixed()).encodeABI(),
                "nonce": web3.utils.toHex(count)
            };
            let gasLimit = calculateGasLimit(bufFromObject(rawTransaction).length);
            rawTransaction.gasLimit = gasLimit;
            let txSigned = await singTx(rawTransaction);

            broadcast(txSigned, BROADCAST_TO_TEST_NET).then((txHash) => {
                res.json({txHash});
            }).catch((error) => {
                res.json({status: 'error', message: error.message});
            });
        });
    } catch (e) {
        next(e);
        res.status(403).json({message: 'Error! Something is wrong!'})
    }
});

router.post('/contract/transfer_to_owner/:amount', async function (req, res, next) {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        let count;
        let gasPrice = await web3.eth.getGasPrice();
        let decimals = await contract.methods.decimals().call();

        web3.eth.getTransactionCount(fromAddress).then(async function (v) {
            console.log("Count: " + v);
            count = v;
            let amount = new BigNumber(Number(req.params.amount) * (10 ** decimals));
            //creating raw tranaction
            let rawTransaction = {
                "from": toAddress,
                "gasPrice": web3.utils.toHex(gasPrice),
                "gasLimit": '21000',
                "to": contractAddress,
                "value": '0x0',
                "data": contract.methods.transferFrom(toAddress, fromAddress, amount.toFixed()).encodeABI(),
                "nonce": web3.utils.toHex(count)
            }
            let gasLimit = calculateGasLimit(bufFromObject(rawTransaction).length);
            rawTransaction.gasLimit = gasLimit;
            let txSigned = await singTx(rawTransaction);

            broadcast(txSigned, BROADCAST_TO_TEST_NET).then((txHash) => {
                res.json({txHash});
            }).catch((error) => {
                res.json({status: 'error', message: error.message});
            });
        });
    } catch (e) {
        next(e);
        res.status(403).json({message: 'Error! Something is wrong!'})
    }
});

let j = schedule.scheduleJob('0 */24 * * *', async function () {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        let count;
        let gasPrice = await web3.eth.getGasPrice();
        let decimals = await contract.methods.decimals().call();

        web3.eth.getTransactionCount(fromAddress).then(async function (v) {
            console.log("Count: " + v);
            count = v;
            let amount = new BigNumber(10000000 * (10 ** decimals));
            //creating raw tranaction
            let rawTransaction = {
                "from": fromAddress,
                "gasPrice": web3.utils.toHex(gasPrice),
                "gasLimit": '21000',
                "to": contractAddress,
                "value": '0x0',
                "data": contract.methods.mint(toAddress, amount.toFixed()).encodeABI(), //  10e10 decimals
                "nonce": web3.utils.toHex(count)
            };
            let gasLimit = calculateGasLimit(bufFromObject(rawTransaction).length);
            rawTransaction.gasLimit = gasLimit;
            let txSigned = await singTx(rawTransaction);

            broadcast(txSigned).then(console.log).catch(console.log);
        })
    } catch (e) {
    }
});

let i = schedule.scheduleJob('45 23 * * *', async function () {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        let count;
        let gasPrice = await web3.eth.getGasPrice();

        web3.eth.getTransactionCount(fromAddress).then(function (v) {
            console.log("Count: " + v);
            count = v;
            let amount;

            contract.methods.balanceOf(toAddress).call().then(function (balance) {
                amount = new BigNumber(Number(balance));
                return amount.toFixed()
            }).then(async (amount) => {
                rawTransaction = {
                    "from": toAddress,
                    "gasPrice": web3.utils.toHex(gasPrice),
                    "gasLimit": '21000',
                    "to": contractAddress,
                    "value": '0x0',
                    "data": contract.methods.transferFrom(toAddress, addressForBurn, amount).encodeABI(), //  10e10 decimals
                    "nonce": web3.utils.toHex(count)
                }
                let gasLimit = calculateGasLimit(bufFromObject(rawTransaction).length);
                rawTransaction.gasLimit = gasLimit;
                let txSigned = await singTx(rawTransaction);

                broadcast(txSigned).then(console.log).catch(console.log);
            });
        })
    } catch (e) {
    }
});

let k = schedule.scheduleJob('15 0 * * *', async function () {
    try {
        let contract = new web3.eth.Contract(abiArray, contractAddress);
        let count;
        let gasPrice = await web3.eth.getGasPrice();

        web3.eth.getTransactionCount(fromAddress).then(function (v) {
            count = v;
            let amount;
            contract.methods.balanceOf(addressForBurn).call().then(function (balance) {
                amount = new BigNumber(Number(balance));
                return amount.toFixed()
            }).then(async (amount) => {
                rawTransaction = {
                    "from": fromAddress,
                    "gasPrice": web3.utils.toHex(gasPrice),
                    "gasLimit": '21000',
                    "to": contractAddress,
                    "value": '0x0',
                    "data": contract.methods.burnFrom(addressForBurn, amount).encodeABI(),
                    "nonce": web3.utils.toHex(count)
                };
                let gasLimit = calculateGasLimit(bufFromObject(rawTransaction).length);
                rawTransaction.gasLimit = gasLimit;
                let txSigned = await singTx(rawTransaction);

                broadcast(txSigned).then(console.log).catch(console.log);
            });
        })
    } catch (e) {
    }
});

async function singTx(txObject) {
    let wallet = web3.eth.accounts.wallet.decrypt(walletJson, walletKey); // it's not secure, but why not
    let signedTransaction = await web3.eth.accounts.signTransaction(txObject, wallet[0].privateKey);
    return signedTransaction.rawTransaction;
}

async function broadcast(txHash, isTestNet = false, isWeb3 = false) {
    if (isTestNet && !isWeb3) {
        return await broadcastRopsten(txHash);
    } else if (!isTestNet && !isWeb3) {
        return await broadcastMain(txHash);
    } else if (isWeb3) {
        return await sendTransactionTxHashHelper(txHash);
    } else {
        throw  new Error("Invalid broadcast server");
    }
}

async function broadcastRopsten(txHash) {
    return await (await fetch(`https://api-ropsten.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${txHash}&apikey=${ETHER_SCAN_API_KEY}`)).json()
}

async function broadcastMain(txHash) {
    return await (await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${txHash}&apikey=${ETHER_SCAN_API_KEY}`)).json()
}

async function sendTransactionTxHashHelper(tx) {
    return new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(tx).on('transactionHash', (transactionHash) => {
            resolve(transactionHash);
        }).on('error', resolve);
    });
}

function calculateGasLimit(bytes, feePerByte = 68, gasTransaction = 45000) {
    return gasTransaction + bytes * feePerByte;
}

function bufFromObject(obj) {
    return Buffer.from(JSON.stringify(obj));
}

function bufFromHex(hex) {
    return Buffer.from(hex, 'hex');
}

async function estimateGas(nonce, from, to, data) {
    return new Promise((resolve, reject) => {
        web3.eth.estimateGas({
            "from": from,
            "nonce": nonce,
            "to": to,
            "data": data
        }).then(((res) => resolve(res))).catch(resolve);
    });
}

async function loadApiGasPrice() {
    return (await fetch('https://www.etherchain.org/api/gasPriceOracle')).json();
}

app.listen(process.env.PORT || 3002, '0.0.0.0', function () {
    console.log('Listening on http://localhost:' + (process.env.PORT || 3002))
});
