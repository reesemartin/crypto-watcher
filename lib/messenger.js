import 'dotenv/config'
import fetch from "node-fetch"
import { getPrice } from './priceProcessor.js'

let lastPrice

const sendPrice = (chat_id) => async (message) => {
  console.log('sending:', message, 'to', chat_id)
  return fetch(process.env.TELEGRAM_API_URL + '/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: message, chat_id })
  })
}

const sendPriceIntervalAction = async () => {
  try {
    const price = await getPrice()
    console.log(new Date().toISOString(), JSON.stringify(price))

    let firstRun = !lastPrice
    if (!lastPrice) lastPrice = price.price

    let priceChange = price.price - lastPrice
    if (price.price === 0) {
      // do nothing
    }
    else if (firstRun) {
      sendPrice(process.env.TELEGRAM_CHAT_ID)(`Startup price notice: ${price.token} ${price.price} on ${price.chain}`)
    }
    else if ( Math.abs(priceChange) > 0.02 ) {
      sendPrice(process.env.TELEGRAM_CHAT_ID)(`Price notice: ${price.token} ${price.price} ${priceChange > 0 ? 'up' : 'down'} ${priceChange} from ${lastPrice} on ${price.chain}`)
      lastPrice = price.price
    }
  }
  catch(err) {
    console.error(err)
  }
}

const getPriceInterval = () => {
  sendPriceIntervalAction()
  setInterval(() => { sendPriceIntervalAction() }, 60 * 1000)
}

export const messenger = () => {
  getPriceInterval()
}
