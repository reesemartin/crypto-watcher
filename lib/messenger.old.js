const fs = require('fs')
const { exec } = require('child_process')

const YOUR_CHAT_ID = '???'
let fetch

const TELEGRAM_API_URL = '???'

let lastPrice

const getPrice = () => new Promise((resolve, reject) => {
  exec('grep "avax" results.txt | tail -n1', (err, stdout, stderr) => {
    if (err) return reject(err)
    if (stderr) return reject(stderr)
    resolve(stdout.split('\t')[2])
  })
})

const messagesCache = require('./telegram-cache.json')

const saveCache = (data) => new Promise((resolve, reject) => {
  fs.writeFile('./telegram-cache.json', data, (err) => {
    if (err) return reject(err)
    resolve()
  })
})

const sendPrice = (chat_id) => async (price) => {
  console.log('sending:', price, 'to', chat_id)
  return fetch(TELEGRAM_API_URL + '/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: price, chat_id })
  })
}

const sendError = async (chat_id) => {
  console.log('sending error response to', chat_id)
  return fetch(TELEGRAM_API_URL + '/sendMessage', {
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

const processMessages = (messages) => {
  messages.forEach(message => {
    if (messagesCache[message.update_id]) return

    messagesCache[message.update_id] = message.message
    if (message.message.text === 'price') {
      getPrice()
        .then(sendPrice(message.message.chat.id))
        .catch(err => {
          console.error(err)
          sendError(message.message.chat.id)
        })
    }
  })
}

const getNewMessages = () => {
  return fetch(TELEGRAM_API_URL + '/getUpdates')
    .then(x => x.json())
    .then(x => x.result)
    .then(processMessages)
    .then(() => saveCache(JSON.stringify(messagesCache, null, 2)))
    .catch(console.error)
}

const getMessagesInterval = () => {
  setTimeout(async () => {
    await getNewMessages()
    getMessagesInterval()
  }, 5 * 1000)
}

const getPriceInterval = () => {
  setTimeout(async () => {
    const price = await getPrice()
    console.log(new Date().toISOString(), price)
    const newPrice = Number(price.split(' ')[1])

    if (!lastPrice) lastPrice = newPrice

    if (newPrice === 0) {
      // do nothing
    } else if (Math.abs(newPrice - lastPrice) > 0.02) {
      lastPrice = newPrice
      sendPrice(YOUR_CHAT_ID)(price)
    }

    getPriceInterval()
  }, 60 * 1000)
}

async function main () {
  const { default: nodeFetch } = await import('node-fetch')
  fetch = nodeFetch

  getMessagesInterval()
  getPriceInterval()
}

main()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })