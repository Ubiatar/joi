'use strict';

// Load modules

const Lab = require('lab');
const Joi = require('../..');
const Helper = require('../helper');
const BigNumber = require('bignumber.js')


// Declare internals

const internals = {};


// Test shortcuts

const { describe, it} = exports.lab = Lab.script();
const {expect} = require('code')


describe('bigumber', () => {

    it('can be called on its own', () => {

        const bigNumber = Joi.bigNumber;
        expect(() => bigNumber()).to.throw('Must be invoked on a Joi instance.');
    });

    it('should handle combination of min and max', () => {
        const rule = Joi.bigNumber().min(new BigNumber(8)).max(new BigNumber(10));
        Helper.validate(rule, [
            [new BigNumber(1), false, null, {
                message: '"value" must be larger than or equal to 8',
                details: [{
                    message: '"value" must be larger than or equal to 8',
                    path: [],
                    type: 'bigNumber.min',
                    context: { limit: new BigNumber(8), value: new BigNumber(1), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(21), false, null, {
                message: '"value" must be less than or equal to 10',
                details: [{
                    message: '"value" must be less than or equal to 10',
                    path: [],
                    type: 'bigNumber.max',
                    context: { limit: new BigNumber(10), value: new BigNumber(21), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(9), true]
        ]);
    });

});
