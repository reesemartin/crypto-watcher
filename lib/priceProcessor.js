import { getLog } from './logger.js'

export const getPrice = (requestedIndex = 0, token = 'STG', chain = 'AVAX') => {
  let prices = getLog('prices')
  let matchIndex = 0
  let reverseIndex = prices.length - 1
  let price = null
  while (reverseIndex >= 0 && price === null) {
    let thisPrice = prices[reverseIndex]
    if (thisPrice.chain === chain && thisPrice.token === token) {
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
