import { percentChange, toDecimalPlaces, toDecimalPlacesString } from './../lib/utils.js'
import assert from 'assert'

describe('percentChange', () => {
  it('should return percent difference between two numbers', () => {
    assert.equal(percentChange(100, 75), -0.25)
    assert.equal(percentChange(100, 50), -0.5)
    assert.equal(percentChange(50, 75), 0.5)
    assert.equal(percentChange(50, 100), 1)
  })

  it('should return zero if neither number is greater than zero', () => {
    assert.equal(percentChange(0, 50), 0)
    assert.equal(percentChange(100, false), 0)
    assert.equal(percentChange(null, false), 0)
  })
})

describe('toDecimalPlaces', () => {
  it('returns a number', () => {
    assert.equal(typeof toDecimalPlaces(1.23456, 2), typeof 1.23)
    assert.equal(typeof toDecimalPlaces('1.23456', 2), typeof 1.23)
  })

  it('just returns the passed number if the second parameter (places) is not zero or greater', () => {
    assert.equal(toDecimalPlaces(1.23456), 1.23456)
    assert.equal(toDecimalPlaces(1.23456, -1), 1.23456)
    assert.equal(toDecimalPlaces(1.23456, false), 1.23456)
    assert.equal(toDecimalPlaces(1.23456, null), 1.23456)
  })

  it('rounds down to the nearest matching number of decimal places if passed a number with more decimal places than the second parameter (places)', () => {
    assert.equal(toDecimalPlaces(1.23456, 2), 1.23)
    assert.equal(toDecimalPlaces(1.23456, 4), 1.2345)
  })
})

describe('toDecimalPlacesString', () => {
  it('returns a string', () => {
    assert.equal(typeof toDecimalPlacesString(1.23456, 2), typeof '1.23')
    assert.equal(typeof toDecimalPlacesString('1.23456', 2), typeof '1.23')
  })

  it('just returns the passed number as a string if the second parameter (places) is not zero or greater', () => {
    assert.equal(toDecimalPlacesString(1.23456), 1.23456)
    assert.equal(toDecimalPlacesString(1.23456, -1), 1.23456)
    assert.equal(toDecimalPlacesString(1.23456, false), 1.23456)
    assert.equal(toDecimalPlacesString(1.23456, null), 1.23456)
  })

  it('adds zeroes to the end to reach the requested places if the second parameter (places) is more decimal places than the passed number', () => {
    assert.equal(toDecimalPlacesString(1.2, 2), '1.20')
    assert.equal(toDecimalPlacesString(1.2, 4), '1.2000')
  })
})
