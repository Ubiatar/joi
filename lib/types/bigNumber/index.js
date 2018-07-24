'use strict';

// Load modules

const Any = require('../any');
const Ref = require('../../ref');
const Hoek = require('hoek');
const BigNumber = require('bignumber.js')


// Declare internals

const internals = {
    precisionRx: /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/
};


internals.BigNumber = class extends Any {

    constructor() {

        super();
        this._type = 'bigNumber';
        this._invalids.add(Infinity);
        this._invalids.add(-Infinity);
    }

    _base(value, state, options) {

        const result = {
            errors: null,
            value
        };

        if (typeof value === 'string' &&
            options.convert) {

            const bigNumber = new BigNumber(value);
            result.value = (bigNumber.isNaN() || !value.isFinite()) ? NaN : bigNumber;
        }
        if (typeof value === 'number' &&
            options.convert) {

            const bigNumber = new BigNumber(value);
            result.value = (bigNumber.isNaN() || !value.isFinite()) ? NaN : bigNumber;
        }
        if (value === null &&
            options.convert) {

            result.value = new BigNumber(null);
        }

        const isBigNumber = typeof result.value === 'object' && !result.value.isNaN();

        if (options.convert && 'precision' in this._flags && isBigNumber) {

            // This is conceptually equivalent to using toFixed but it should be much faster
            const precision = new BigNumber(Math.pow(10, this._flags.precision));
            result.value = new BigNumber(Math.round(result.value.multipliedBy(precision)).dividedBy(precision));
        }

        result.errors = isBigNumber ? null : this.createError('bigNumber.base', null, state, options);
        return result;
    }

    multiple(base) {

        const isRef = Ref.isRef(base);

        if (!isRef) {
            Hoek.assert(typeof base === 'object' && base.isFinite(), 'multiple must be a bigNumber');
            Hoek.assert(base.isGreaterThan(new BigNumber(0)), 'multiple must be greater than 0');
        }

        return this._test('multiple', base, function (value, state, options) {

            const divisor = isRef ? base(state.reference || state.parent, options) : base;

            if (isRef && (typeof divisor !== 'object' || !divisor.isFinite())) {
                return this.createError('bigNumber.ref', {ref: base.key}, state, options);
            }

            if (value.modulo(divisor).toString() === '0') {
                return value;
            }

            return this.createError('bigNumber.multiple', {multiple: base, value}, state, options);
        });
    }

    integer() {

        return this._test('integer', undefined, function (value, state, options) {

            if (value.toString() === value.integerValue().toString()) {
                return value;
            }
            return this.createError('bigNumber.integer', {value}, state, options);
        });
    }

    negative() {

        return this._test('negative', undefined, function (value, state, options) {

            if (value.isLessThan(new BigNumber(0))) {
                return value;
            }

            return this.createError('bigNumber.negative', {value}, state, options);
        });
    }

    positive() {

        return this._test('positive', undefined, function (value, state, options) {

            if (value.isGreaterThan(new BigNumber(0))) {
                return value;
            }

            return this.createError('bigNumber.positive', {value}, state, options);
        });
    }

    min(limit) {

        return this._test('min', limit, function (value, state, options) {

            if (value.isGreaterThanOrEqualTo(limit)) {
                return value;
            }

            return this.createError('bigNumber.min', {limit, value}, state, options);
        });
    }

    max(limit) {

        return this._test('max', limit, function (value, state, options) {

            if (value.isLessThanOrEqualTo(limit)) {
                return value;
            }

            return this.createError('bigNumber.max', {limit, value}, state, options);
        });
    }

    less(limit) {

        return this._test('less', limit, function (value, state, options) {

            if (value.isLessThan(limit)) {
                return value;
            }

            return this.createError('bigNumber.less', {limit, value}, state, options);
        });
    }

    greater(limit) {

        return this._test('greater', limit, function (value, state, options) {

            if (value.isGreaterThan(limit)) {
                return value;
            }

            return this.createError('bigNumber.greater', {limit, value}, state, options);
        });
    }


};


module.exports = new internals.BigNumber();
