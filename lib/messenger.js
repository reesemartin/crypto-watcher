import 'dotenv/config'
import { writeFile, readFile } from "fs/promises"
import fetch from "node-fetch"

let lastPrice
let telegramCache = []

const getPrice = async () => {
  let fileContents = await readFile('./logs/results.txt', { encoding: "utf8" })
  if (!fileContents) throw 'Failed to read file.'
  let lines = fileContents.split("\n")
  let lastLine = ''
  let i = lines.length - 1
  while (i >= 0 && lastLine === '') {
    if (lines[i].indexOf('AVAX') !== -1) {
      lastLine = lines[i]
    }
    i--
  }
  if (lastLine === '') {
    throw 'No pricing found.'
  }

  return lastLine.split('\t')[2]
}

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
        sendPrice(message.channel_post.chat.id)(`Requested Price: ${price}`)
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

const sendPriceIntervalAction = async () => {
  const price = await getPrice()
  console.log(new Date().toISOString(), price)
  const newPrice = Number(price.split(' ')[1])

  let firstRun = !lastPrice
  if (!lastPrice) lastPrice = newPrice

  if (newPrice === 0) {
    // do nothing
  }
  else if (firstRun || Math.abs(newPrice - lastPrice) > 0.02) {
    lastPrice = newPrice
    sendPrice(process.env.TELEGRAM_CHAT_ID)(`Price change notice: ${price}`)
  }
}

const getPriceInterval = () => {
  sendPriceIntervalAction()
  setInterval(() => { sendPriceIntervalAction() }, 60 * 1000)
}

export const messenger = async () => {
  try {
    let telegramCacheRaw = await readFile('./logs/telegram-cache.json')
    telegramCache = JSON.parse(telegramCacheRaw)
    if (!Array.isArray(telegramCache)) telegramCache = []
  }
  catch(err) {
    console.err(err)
  }

  getMessagesInterval()
  getPriceInterval()
}
