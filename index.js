import { initLogs } from './lib/logger.js'
import { gatherer } from './lib/gatherer.js'
import { messenger } from './lib/messenger.js'
import { responder } from './lib/responder.js'

async function handler() {
  await initLogs()
  await gatherer()
  await messenger()
  await responder()
}

// just run now
handler()
