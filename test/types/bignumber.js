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


describe('bigNumber', () => {

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
            }]
        ]);
    });

    it('should handle combination of less and greater', () => {
        const rule = Joi.bigNumber().less(new BigNumber(10)).greater(new BigNumber(5));
        Helper.validate(rule, [
            [new BigNumber(1), false, null, {
                message: '"value" must be greater than 5',
                details: [{
                    message: '"value" must be greater than 5',
                    path: [],
                    type: 'bigNumber.greater',
                    context: { limit: new BigNumber(5), value: new BigNumber(1), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(21), false, null, {
                message: '"value" must be less than 10',
                details: [{
                    message: '"value" must be less than 10',
                    path: [],
                    type: 'bigNumber.less',
                    context: { limit: new BigNumber(10), value: new BigNumber(21), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(9), true]
        ]);
    });

    it('should handle integer multiples correctly', () => {

        const rule = Joi.bigNumber().multiple(new BigNumber(3));
        Helper.validate(rule, [
            [new BigNumber(0), true], // 0 is a multiple of every integer
          [new BigNumber(3), true],
           [new BigNumber(4), false, null, {
                message: '"value" must be a multiple of 3',
                details: [{
                    message: '"value" must be a multiple of 3',
                    path: [],
                    type: 'bigNumber.multiple',
                    context: { multiple: new BigNumber(3), value: new BigNumber(4), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(9), true],
            ['a', false, null, {
                message: '"value" must be a bigNumber',
                details: [{
                    message: '"value" must be a bigNumber',
                    path: [],
                    type: 'bigNumber.base',
                    context: { label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(9.1), false, null, {
                message: '"value" must be a multiple of 3',
                details: [{
                    message: '"value" must be a multiple of 3',
                    path: [],
                    type: 'bigNumber.multiple',
                    context: { multiple: new BigNumber(3), value: new BigNumber(9.1), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(8.9), false, null, {
                message: '"value" must be a multiple of 3',
                details: [{
                    message: '"value" must be a multiple of 3',
                    path: [],
                    type: 'bigNumber.multiple',
                    context: { multiple: new BigNumber(3), value: new BigNumber(8.9), label: 'value', key: undefined }
                }]
            }]
        ]);
    });
    it('should handle combination of min and negative', () => {

        const rule = Joi.bigNumber().min(new BigNumber(-3)).negative();
        Helper.validate(rule, [
            [new BigNumber(4), false, null, {
                message: '"value" must be a negative bigNumber',
                details: [{
                    message: '"value" must be a negative bigNumber',
                    path: [],
                    type: 'bigNumber.negative',
                    context: { value: new BigNumber(4), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(-2), true],
            [new BigNumber(-4), false, null, {
                message: '"value" must be larger than or equal to -3',
                details: [{
                    message: '"value" must be larger than or equal to -3',
                    path: [],
                    type: 'bigNumber.min',
                    context: { limit: new BigNumber(-3), value: new BigNumber(-4), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(null), false, null, {
                message: '"value" must be a bigNumber',
                details: [{
                    message: '"value" must be a bigNumber',
                    path: [],
                    type: 'bigNumber.base',
                    context: { label: 'value', key: undefined }
                }]
            }]
        ]);
    });

    it('should handle combination of max and positive', () => {

        const rule = Joi.bigNumber().max(new BigNumber(3)).positive();
        Helper.validate(rule, [
            [new BigNumber(-4), false, null, {
                message: '"value" must be a positive bigNumber',
                details: [{
                    message: '"value" must be a positive bigNumber',
                    path: [],
                    type: 'bigNumber.positive',
                    context: { value: new BigNumber(-4), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(2), true],
            [new BigNumber(4), false, null, {
                message: '"value" must be less than or equal to 3',
                details: [{
                    message: '"value" must be less than or equal to 3',
                    path: [],
                    type: 'bigNumber.max',
                    context: { limit: new BigNumber(3), value: new BigNumber(4), label: 'value', key: undefined }
                }]
            }],
            [null, false, null, {
                message: '"value" must be a bigNumber',
                details: [{
                    message: '"value" must be a bigNumber',
                    path: [],
                    type: 'bigNumber.base',
                    context: { label: 'value', key: undefined }
                }]
            }]
        ]);
    });

    it('should be integer', () => {

        const rule = Joi.bigNumber().integer();
        Helper.validate(rule, [
            [new BigNumber(4.3), false, null, {
                message: '"value" must be an integer',
                details: [{
                    message: '"value" must be an integer',
                    path: [],
                    type: 'bigNumber.integer',
                    context: { value: new BigNumber(4.3), label: 'value', key: undefined }
                }]
            }],
            [new BigNumber(2), true],

        ]);
    });
});
