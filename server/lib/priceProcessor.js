import { getLog } from './logger.js'

export const getPrice = (token = 'AVAX', chain = 'AVAX', requestedIndex = 0) => {
  try {
    let prices = getLog('prices')
    let matchIndex = 0
    let reverseIndex = prices.length - 1
    let price = null
    while (reverseIndex >= 0 && price === null) {
      let thisPrice = prices[reverseIndex]
      if (thisPrice.chain.toUpperCase() === chain.toUpperCase() && thisPrice.token.toUpperCase() === token.toUpperCase()) {
        if (matchIndex === requestedIndex) {
          price = {...thisPrice}
        }
        matchIndex++
      }
      reverseIndex--
    }

    if (price === null) throw 'No pricing found'

    return price
  }
  catch(err) {
    throw err
  }
}
