import 'dotenv/config'
import { writeFile, readFile } from "fs/promises"
import fetch from "node-fetch"
import { getPrice } from './priceProcessor.js'

let telegramCache = []

const saveCache = async (data) => {
  try {
    await writeFile('./logs/telegram-cache.json', data, { encoding: "utf8" })
    return
  }
  catch(err) {
    throw err
  }
}

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

const sendError = async (chat_id) => {
  console.log('sending error response to', chat_id)
  return fetch(process.env.TELEGRAM_API_URL + '/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id,
      text: 'Sorry there was an error retrieving the price.'
    })
  })
}

const processMessages = async (messages) => {
  let newTelegramCache = []
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    newTelegramCache.push(message.update_id)
    if (message.channel_post?.text === '/price') {
      try {
        let price = await getPrice()
        sendPrice(message.channel_post.chat.id)(`Requested Price: ${price.token} ${price.price} on ${price.chain}`)
      }
      catch(err) {
        console.error(err)
        sendError(message.channel_post.chat.id)
      }
    }
  }
  telegramCache = [...newTelegramCache]
}

const getNewMessages = async () => {
  let offset = ''
  if (Array.isArray(telegramCache) && telegramCache.length) {
    offset = Math.max(...telegramCache) + 1
  }
  return fetch(process.env.TELEGRAM_API_URL + '/getUpdates?offset=' + offset )
    .then(x => x.json())
    .then(x => x.result)
    .then(async (x) => await processMessages(x) )
    .then(async () => await saveCache(JSON.stringify(telegramCache)) )
    .catch(console.error)
}

const getMessagesInterval = () => {
  setTimeout(async () => {
    await getNewMessages()
    getMessagesInterval()
  }, 5 * 1000)
}

export const responder = async () => {
  try {
    let telegramCacheRaw = await readFile('./logs/telegram-cache.json')
    telegramCache = JSON.parse(telegramCacheRaw)
    if (!Array.isArray(telegramCache)) telegramCache = []
  }
  catch(err) {
    console.error(err)
  }

  getMessagesInterval()
}
