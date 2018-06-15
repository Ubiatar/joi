'use strict';

// Load modules

const Any = require('./any');
const Ref = require('./ref');
const Hoek = require('hoek');
const BigNumber = require('bignumber.js')


// Declare internals

const internals = {};


internals.BigNumber = function () {

  Any.call(this);
  this._type = 'bigNumber';
  this._invalids.add(Infinity);
  this._invalids.add(-Infinity);
};

Hoek.inherits(internals.BigNumber, Any);

internals.compare = function (type, compare) {

  return function (limit) {

    const isRef = Ref.isRef(limit);
    const isBigNumber = typeof limit === 'object' && !limit.isNaN();

    Hoek.assert(isBigNumber || isRef, 'limit must be a bigNumber or reference');

    return this._test(type, limit, (value, state, options) => {

      let compareTo;
      if (isRef) {
        compareTo = new BigNumber(limit(state.parent, options));

        if (!(typeof compareTo === 'object' && !compareTo.isNaN())) {
          return this.createError('bigNumber.ref', { ref: limit.key }, state, options);
        }
      }
      else {
        compareTo = new BigNumber(limit);
      }

      if (compare(value, compareTo)) {
        return null;
      }

      return this.createError('bigNumber.' + type, { limit: compareTo, value }, state, options);
    });
  };
};


internals.BigNumber.prototype._base = function (value, state, options) {

  const result = {
    value,
    errors: null
  };

  if (typeof value === 'string' &&
    options.convert) {
    const bigNumber = new BigNumber(value);
    result.value = (bigNumber.isNaN() || !isFinite(value)) ? NaN : bigNumber;

  }
  if (typeof value === 'number' &&
    options.convert) {
    const bigNumber = new BigNumber(value);
    result.value = (bigNumber.isNaN() || !isFinite(value)) ? NaN : bigNumber;

  }
  const isBigNumber = typeof result.value === 'object' && !result.value.isNaN();

  if (options.convert && 'precision' in this._flags && isBigNumber) {

    // This is conceptually equivalent to using toFixed but it should be much faster
    const precision = new BigNumber(Math.pow(10, this._flags.precision));
    result.value =new BigNumber(Math.round(result.value.multipliedBy(precision)).dividedBy(precision));
  }

  result.errors = isBigNumber ? null : this.createError('bigNumber.base', null, state, options);
  return result;
};


internals.BigNumber.prototype.min = internals.compare('min', (value, limit) => value.isGreaterThanOrEqualTo(limit));
internals.BigNumber.prototype.max = internals.compare('max', (value, limit) => value.isLessThanOrEqualTo(limit));
internals.BigNumber.prototype.greater = internals.compare('greater', (value, limit) => value.isGreaterThan(limit));
internals.BigNumber.prototype.less = internals.compare('less', (value, limit) => value.isLessThan(limit));


internals.BigNumber.prototype.multiple = function (base) {

  Hoek.assert(base.integerValue(), 'multiple must be an integer');
  Hoek.assert(base.isGreaterThan(0), 'multiple must be greater than 0');

  return this._test('multiple', base, (value, state, options) => {

    if (value.modulo(base).isEqualTo(0)) {
      return null;
    }

    return this.createError('bigNumber.multiple', { multiple: base, value }, state, options);
  });
};


internals.BigNumber.prototype.integer = function () {

  return this._test('integer', undefined, (value, state, options) => {

    return value.integerValue() ? null : this.createError('bigNumber.integer', { value }, state, options);
  });
};


internals.BigNumber.prototype.negative = function () {

  return this._test('negative', undefined, (value, state, options) => {

    if (value.isLessThan(0)) {
      return null;
    }

    return this.createError('bigNumber.negative', { value }, state, options);
  });
};


internals.BigNumber.prototype.positive = function () {

  return this._test('positive', undefined, (value, state, options) => {

    if (value.isGreaterThan(0)) {
      return null;
    }

    return this.createError('bigNumber.positive', { value }, state, options);
  });
};


internals.precisionRx = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;


internals.BigNumber.prototype.precision = function (limit) {

  Hoek.assert(limit.integerValue(), 'limit must be an integer');
  Hoek.assert(!('precision' in this._flags), 'precision already set');

  const obj = this._test('precision', limit, (value, state, options) => {

    const places = new BigNumber(value.toString().match(internals.precisionRx));
    const decimals = new BigNumber(Math.max((places[1] ? places[1].length : 0) - (places[2] ? parseInt(places[2], 10) : 0), 0));
    if (decimals.isLessThanOrEqualTo(limit)) {
      return null;
    }

    return this.createError('number.precision', { limit, value }, state, options);
  });

  obj._flags.precision = new BigNumber(limit);
  return obj;
};


module.exports = new internals.BigNumber();
