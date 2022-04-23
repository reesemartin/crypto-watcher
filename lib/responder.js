import 'dotenv/config'
import fetch from "node-fetch"
import { getPrice } from './priceProcessor.js'
import { getLog, setLog, saveLog } from './logger.js'

const sendMessage = (chatID) => async (message) => {
  console.log('sending:', message, 'to', chatID)
  return fetch(process.env.TELEGRAM_API_URL + '/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: message, chat_id: chatID })
  })
}

const sendError = (chatID) => async (err) => {
  console.log('sending error response to', chatID)
  console.error(err)
  return fetch(process.env.TELEGRAM_API_URL + '/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatID,
      text: err
    })
  })
}

const showAlerts = async (chatID) => {
  let alerts = getLog('alerts')
  let message = alerts.length ? 'Current Alerts:\n' : 'No alerts currently set.\nTo add an alert enter:\n/alert TOKEN PRICE CHAIN'
  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    message += `\t${alert.token} at $${alert.price.toFixed(2)} on ${alert.chain}` + '\n'
  }

  sendMessage(chatID)(message)
}

const clearAlerts = async (chatID) => {
  setLog('alerts', [])
  await saveLog('alerts')
  sendMessage(chatID)(`Alerts cleared`)
}

const addAlert = async (chatID, messageText) => {
  let messageParts = messageText.split(' ')
  let token = messageParts[1]
  if (!token) {
    throw 'Missing first parameter "token" to set alert'
  }
  else {
    let price = messageParts[2]
    if (!price) {
      throw 'Missing second parameter "price" to set alert'
    }
    else {
      let chain = messageParts[3] ? messageParts[3] : 'AVAX'

      // we have everything we need to lets set that alert
      const alert = {
        chatID,
        token: token.toUpperCase(),
        chain: chain.toUpperCase(),
        price: Number(price),
      }
      let alerts = getLog('alerts')
      alerts.push({...alert})
      setLog('alerts', alerts)
      await saveLog('alerts')
      sendMessage(chatID)(`Alert added for ${alert.token} at $${alert.price.toFixed(2)} on ${alert.chain}`)
    }
  }
}

const processMessages = async (messages) => {
  let newTelegramCache = []
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    newTelegramCache.push(message.update_id)
    try {
      if ( message.channel_post?.text === '/price' ) {
        try {
          let price = getPrice()
          await sendMessage(message.channel_post.chat.id)(`Requested Price: ${price.token} ${price.price} on ${price.chain}`)
        }
        catch(err) {
          console.error(err)
          throw 'Sorry there was an error retrieving the price.' // just send generic error to chat
        }
      }
      else if ( message.channel_post?.text === '/alert show' ) {
        await showAlerts(message.channel_post.chat.id)
      }
      else if ( message.channel_post?.text === '/alert clear' ) {
        await clearAlerts(message.channel_post.chat.id)
      }
      else if ( message.channel_post?.text?.startsWith('/alert') ) {
        await addAlert(message.channel_post.chat.id, message.channel_post.text)
      }
    }
    catch(err) {
      console.error(err)
      await sendError(message.channel_post.chat.id)(err)
    }
  }
  setLog('telegram-cache', [...newTelegramCache])
  await saveLog('telegram-cache')
}

const getNewMessages = async () => {
  let telegramCache = getLog('telegram-cache')
  let offset = ''
  if (Array.isArray(telegramCache) && telegramCache.length) {
    offset = Math.max(...telegramCache) + 1
  }
  return fetch(process.env.TELEGRAM_API_URL + '/getUpdates?offset=' + offset )
    .then(x => x.json())
    .then(x => x.result)
    .then(async (x) => await processMessages(x) )
    .catch(console.error)
}

const getMessagesInterval = () => {
  setTimeout(async () => {
    await getNewMessages()
    getMessagesInterval()
  }, 5 * 1000)
}

export const responder = async () => {
  getMessagesInterval()
}
