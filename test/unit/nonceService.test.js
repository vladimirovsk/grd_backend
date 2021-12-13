'use strict';

import NonceService from '../../services/nonce.service';
import InvalidNonceValueException from "../../exceptions/InvalidNonceValueException";

describe('NonceService tests', () => {
    let nonceService = new NonceService();
    it('Check read nonce file', () => {
        nonceService.write(0);
        expect(nonceService.read()).toBe("0");
    })
    it('Check write nonce file', () => {
        nonceService.write(1);
        expect(nonceService.read()).toBe("1");
        nonceService.write(0);
    })
    it('Check increase nonce', () => {
        nonceService.write(0);
        nonceService.increase();
        expect(nonceService.read()).toBe("1");
    })
    it('Check decrease nonce file', () => {
        nonceService.write(0);
        expect(() => {
            nonceService.decrease()
        }).toThrow('NonceService : Nonce value must be bigger than zero');
        nonceService.write(1);
        nonceService.decrease();
        expect(nonceService.read()).toBe("0");
    })
});