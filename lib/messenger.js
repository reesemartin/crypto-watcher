import 'dotenv/config'
import fetch from "node-fetch"
import { getPrice } from './priceProcessor.js'
import { getLog, setLog, saveLog } from './logger.js'

let firstRun = true

const sendMessage = (chat_id) => async (message) => {
  console.log('sending:', message, 'to', chat_id)
  return fetch(process.env.TELEGRAM_API_URL + '/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: message, chat_id })
  })
}

const priceAlertAction = async () => {
  let alerts = getLog('alerts')
  for (let i = alerts.length - 1; i >= 0; i--) { // reverse loop since we are removing items as we go
    try {
      const alert = alerts[i]

      const price = getPrice(0, alert.token, alert.chain).price
      const lastPrice = getPrice(1, alert.token, alert.chain).price
      
      if (price === 0 || price === lastPrice) {
        // sanity check: bad price or price didn't change, do nothing
      }
      else {
        // check if this alert needs triggered
        if ( price === alert.price // exact match on alert price
             || price > alert.price && alert.price < lastPrice // price went up and past the alert price
             || lastPrice > alert.price && alert.price < price // price went down and past the alert price
        ) {
          // if alert is triggered, message chatID and remove alert from alerts list
          await sendMessage(alert.chatID)(`Requested Price Alert: ${alert.token} ${alert.price} on ${alert.chain}`)
          alerts.splice(i, 1)
          alerts = setLog('alerts', alerts)
        }
      }
    }
    catch(err) {
      console.error(err)
    }
  }
  await saveLog('alerts')
}

const startPriceAlertInterval = () => {
  priceAlertAction()
  setInterval(() => { priceAlertAction() }, 60 * 1000)
}

const priceChangeAction = async () => {
  try {
    const price = getPrice()

    let lastPrice = price.price
    try {
      lastPrice = getPrice(1).price
    }
    catch(err) {
      console.log('Missing last price in storage so using default of current price')
    }

    let priceChange = price.price - lastPrice
    if (price.price === 0) {
      // sanity check: bad price, do nothing
    }
    else if (firstRun) {
      await sendMessage(process.env.TELEGRAM_CHAT_ID)(`Startup price notice: ${price.token} ${price.price} on ${price.chain}`)
    }
    else if ( Math.abs(priceChange) > 0.02 ) {
      await sendMessage(process.env.TELEGRAM_CHAT_ID)(`Price notice: ${price.token} ${price.price} ${priceChange > 0 ? 'up' : 'down'} ${priceChange} from ${lastPrice} on ${price.chain}`)
    }

    firstRun = false
  }
  catch(err) {
    console.error(err)
  }
}

const startPriceChangeInterval = () => {
  priceChangeAction()
  setInterval(() => { priceChangeAction() }, 60 * 1000)
}

export const messenger = () => {
  startPriceAlertInterval()
  startPriceChangeInterval()
}
