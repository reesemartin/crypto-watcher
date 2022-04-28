import { initLogs } from './lib/logger.js'
import { gatherer } from './services/gatherer.js'
import { messenger } from './services/messenger.js'
import { responder } from './services/responder.js'

async function handler() {
  await initLogs()
  await gatherer()
  await messenger()
  await responder()
}

// just run now
handler()
