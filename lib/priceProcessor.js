import { readFile } from "fs/promises"

export const getPrice = async (chain = 'AVAX') => {
  let prices  = []
  try {
    let pricesRaw = await readFile('./logs/prices.json')
    prices = JSON.parse(pricesRaw)
    if (!Array.isArray(prices)) prices = []
  }
  catch(err) {
    console.err(err)
  }

  let i = prices.length - 1
  let price = null
  while (i >= 0 && price === null) {
    if (prices[i].chain === chain) {
      price = {...prices[i]}
    }
    i--
  }

  if (price === null) throw 'No pricing found'

  return price
}
