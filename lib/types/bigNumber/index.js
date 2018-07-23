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

        const isBigNumber = typeof result.value === 'object' && !result.value.isNaN();

        if (options.convert && 'precision' in this._flags && isBigNumber) {

            // This is conceptually equivalent to using toFixed but it should be much faster
            const precision =new BigNumber(Math.pow(10, this._flags.precision));
            result.value = new BigNumber(Math.round(result.value.multipliedBy(precision)).dividedBy(precision));
        }

        result.errors = isBigNumber ? null : this.createError('bigNumber.base', null, state, options);
        return result;
    }
/*
   multiple(base) {

        const isRef = Ref.isRef(base);

        if (!isRef) {
            Hoek.assert(typeof base === 'number' && isFinite(base), 'multiple must be a number');
            Hoek.assert(base > 0, 'multiple must be greater than 0');
        }

        return this._test('multiple', base, function (value, state, options) {

            const divisor = isRef ? base(state.reference || state.parent, options) : base;

            if (isRef && (typeof divisor !== 'number' || !isFinite(divisor))) {
                return this.createError('number.ref', { ref: base.key }, state, options);
            }

            if (value % divisor === 0) {
                return value;
            }

            return this.createError('number.multiple', { multiple: base, value }, state, options);
        });
    }

    integer() {

        return this._test('integer', undefined, function (value, state, options) {

            return Number.isSafeInteger(value) ? value : this.createError('number.integer', { value }, state, options);
        });
    }

    negative() {

        return this._test('negative', undefined, function (value, state, options) {

            if (value < 0) {
                return value;
            }

            return this.createError('number.negative', { value }, state, options);
        });
    }

    positive() {

        return this._test('positive', undefined, function (value, state, options) {

            if (value > 0) {
                return value;
            }

            return this.createError('number.positive', { value }, state, options);
        });
    }

    precision(limit) {

        Hoek.assert(Number.isSafeInteger(limit), 'limit must be an integer');
        Hoek.assert(!('precision' in this._flags), 'precision already set');

        const obj = this._test('precision', limit, function (value, state, options) {

            const places = value.toString().match(internals.precisionRx);
            const decimals = Math.max((places[1] ? places[1].length : 0) - (places[2] ? parseInt(places[2], 10) : 0), 0);
            if (decimals <= limit) {
                return value;
            }

            return this.createError('number.precision', { limit, value }, state, options);
        });

        obj._flags.precision = limit;
        return obj;
    }

    port() {

        return this._test('port', undefined, function (value, state, options) {

            if (!Number.isSafeInteger(value) || value < 0 || value > 65535) {
                return this.createError('number.port', { value }, state, options);
            }

            return value;
        });
    }*/
    min(limit) {


        return this._test('min', limit, function (value, state, options) {

            if (value.isGreaterThanOrEqualTo(limit)) {
                return value;
            }

            return this.createError('bigNumber.min', { limit, value }, state, options);
        });
    }

    max(limit) {


        return this._test('max', limit, function (value, state, options) {

            if (value.isLessThanOrEqualTo(limit)) {
                return value;
            }

            return this.createError('bigNumber.max', { limit, value }, state, options);
        });
    }


};


internals.compare = function (type, compare) {

    return function (limit) {

        const isRef = Ref.isRef(limit);
        const isBigNumber = typeof limit === 'object' && !limit.isNaN();

        Hoek.assert(isBigNumber || isRef, 'limit must be a Bignumber or reference');

        return this._test(type, limit, function (value, state, options) {

            let compareTo;
            if (isRef) {
                compareTo = limit(state.reference || state.parent, options);

                if (!(typeof compareTo === 'object' && !compareTo.isNaN())) {
                    return this.createError('bigNumber.ref', { ref: limit.key }, state, options);
                }
            }
            else {
                compareTo = new BigNumber(limit);
            }

            if (compare(value, compareTo)) {
                return value;
            }

            return this.createError('bigNumber.' + type, { limit: compareTo, value }, state, options);
        });
    };
};






module.exports = new internals.BigNumber();
