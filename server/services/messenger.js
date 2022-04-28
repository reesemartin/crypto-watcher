import 'dotenv/config'
import fetch from "node-fetch"
import { getPrice } from './../lib/priceProcessor.js'
import { getLog, setLog, saveLog } from './../lib/logger.js'
import { percentChange, toDecimalPlacesString } from './../lib/utils.js'
import { chains } from './../chains.js'

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
  let alertChange = false
  for (let i = alerts.length - 1; i >= 0; i--) { // reverse loop since we are removing items as we go
    try {
      const alert = alerts[i]

      const price = getPrice(alert.token, alert.chain, 0).price
      const lastPrice = getPrice(alert.token, alert.chain, 1).price

      if ( !price || price === lastPrice) {
        // sanity check: bad price or price didn't change, do nothing
      }
      else {
        // check if this alert needs triggered
        if ( price === alert.price // exact match on alert price
             || price > alert.price && alert.price < lastPrice // price went up and past the alert price
             || lastPrice > alert.price && alert.price < price // price went down and past the alert price
        ) {
          // if alert is triggered, message chatID and remove alert from alerts list
          await sendMessage(alert.chatID)(`Requested Price Alert: ${alert.token} ${toDecimalPlacesString(alert.price, 2)} on ${alert.chain}`)
          alerts.splice(i, 1)
          alerts = setLog('alerts', alerts)
          alertChange = true
        }
      }
    }
    catch(err) {
      console.error(err)
    }
  }
  if (alertChange) await saveLog('alerts')
}

const startPriceAlertInterval = () => {
  priceAlertAction()
  setInterval(() => { priceAlertAction() }, 60 * 1000)
}

const priceChangeAction = async () => {
  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];

    try {
      const price = getPrice(chain.tokenSymbol, chain.name, 0)

      let lastPrice = price.price
      try {
        lastPrice = getPrice(chain.tokenSymbol, chain.name, 1).price
      }
      catch(err) {
        console.log('Missing last price in storage so using default of current price')
      }

      let percent = percentChange(price.price, lastPrice)
      if (!price.price) {
        // sanity check: bad price, do nothing
      }
      else if (firstRun) {
        await sendMessage(process.env.TELEGRAM_CHAT_ID)(`Startup price notice: ${price.token} $${toDecimalPlacesString(price.price, 2)} on ${price.chain}`)
      }
      else if ( Math.abs(percent) > 0.06 ) {
        await sendMessage(process.env.TELEGRAM_CHAT_ID)(`Price notice: ${price.token} ${toDecimalPlacesString(price.price, 2)} ${percent * 100}% from ${toDecimalPlacesString(lastPrice, 2)} on ${price.chain}`)
      }

    }
    catch(err) {
      console.error(err)
    }
  }
  firstRun = false
}

const startPriceChangeInterval = () => {
  priceChangeAction()
  setInterval(() => { priceChangeAction() }, 60 * 1000)
}

export const messenger = () => {
  startPriceAlertInterval()
  startPriceChangeInterval()
}
