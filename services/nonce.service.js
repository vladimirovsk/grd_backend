'use strict'

import fs from 'fs';
import ApplicationException from '../exceptions/ApplicationException';
import InvalidNonceValueException from '../exceptions/InvalidNonceValueException';

class NonceService {

    #fileBasePath = __dirname + '/../config/ethereum/nonce';

    get getFilePath() {
        return this.#fileBasePath;
    }

    get getNonceValue() {
        let nonce = this.read();
        NonceService.#validateFileValue(nonce);
        return Number(nonce);
    }

    read() {
        return fs.readFileSync(this.#fileBasePath, "utf8");
    }

    write(content) {
        fs.writeFileSync(this.#fileBasePath, content, "utf8");
    }

    increase() {
        let nonce = this.read();
        NonceService.#validateFileValue(nonce);
        this.write(Number(nonce) + 1);
    }

    decrease() {
        let nonce = this.read();
        NonceService.#validateFileValue(nonce);
        if (Number(nonce) - 1 < 0) {
            throw new InvalidNonceValueException(`${this.constructor.name} : Nonce value must be bigger than zero`)
        }
        this.write(Number(nonce) - 1);
    }

    static #validateFileValue(content) {
        if (!Number.isInteger(Number(content))) {
            throw new ApplicationException(`${this.prototype.constructor.name} : Invalid nonce file value`);
        }
    }
}

module.exports = NonceService;