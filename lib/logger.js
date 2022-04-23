import { readFile, writeFile } from 'fs/promises'

let PRICES = []
let TELEGRAMCACHE = []
let ALERTS = []

const loadLog = async (file) => {
  try {
    let outputRaw = await readFile(`./logs/${file}`)
    let output = JSON.parse(outputRaw)
    if (!Array.isArray(output)) output = []
    return output
  }
  catch(err) {
    throw `Failed to load ${file} : ${err}`
  }
}

export const initLogs = async () => {
  PRICES = await loadLog('prices.json')
  TELEGRAMCACHE = await loadLog('telegram-cache.json')
  ALERTS = await loadLog('alerts.json')
}

export const getLog = (log) => {
  switch (log) {
    case 'prices':
      return PRICES
      
    case 'telegram-cache':
      return TELEGRAMCACHE
      
    case 'alerts':
      return ALERTS
  
    default:
      return null
  }
}

export const setLog = (log, data) => {
  switch (log) {
    case 'prices':
      return PRICES = [...data]
      
    case 'telegram-cache':
      return TELEGRAMCACHE = [...data]
      
    case 'alerts':
      return ALERTS = [...data]
  
    default:
      return null
  }
}

export const saveLog = async (log) => {
  let file = ''
  let data = null
  switch (log) {
    case 'prices':
      file = 'prices.json'
      data = PRICES
      
    case 'telegram-cache':
      file = 'telegram-cache.json'
      data = TELEGRAMCACHE
      
    case 'alerts':
      file = 'alerts.json'
      data = ALERTS
  }

  if (file === '') {
    throw 'Unknown log file to save'
  }
  if (data === null) {
    throw 'Unknown log data to save'
  }

  try {
    await writeFile(`./logs/${file}`, JSON.stringify(data), { encoding: "utf8" })
    return
  }
  catch(err) {
    throw err
  }
}
