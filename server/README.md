# Crypto Watcher server


## Available Scripts

### `npm run start`

Kicks off the gathering of crypto data and data monitoring messenger

### `npm run test`

Runs the available tests (once I add them)


## PM2

### `pm2 start npm --name "Crypto Watcher" -- start`

Adds the crypto watcher as a pm2 process and starts the watcher

### `pm2 monit`

Lets you watch the log output of the crypto watcher scripts

### `pm2 start "Crypto Watcher"`

Starts the watcher if it has been stopped after that first time you set it up

### `pm2 restart "Crypto Watcher"`

Restarts the watcher

### `pm2 restart "Crypto Watcher"`

Stops the watcher
