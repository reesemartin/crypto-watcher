import {gatherer} from './lib/gatherer.js'
import {messenger} from './lib/messenger.js'

async function handler() {
  gatherer()
  await messenger()
}

// just run now
handler()
