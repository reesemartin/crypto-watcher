# Crypto Watcher
Tool for automated gathering and notification of crypto data with included client UI for visualization of the data.

Notifications are sent via [Telegram's](https://telegram.org/) [bot API](https://core.telegram.org/bots#6-botfather) using [BotFather](https://t.me/botfather). This script is configured to message a channel and not direct messaging which is important because the update notifactions Telegram sends are specific. Maybe someday this will be updated to dynamically detect channel vs DM.

## Available Telegram Bot Commands

### `/price`
Provides the latest price.

### `/alerts show`
Shows the list of price alerts.

### `/alerts clear`
Clears the list of price alerts.

### `/alert TOKEN PRICE CHAIN`
Adds a new price alert. CHAIN is optional and defaults to AVAX.

## Install
```
touch server/.env
mkdir server/logs
echo "[]" > server/logs/prices.json
echo "[]" > server/logs/alerts.json
echo "[]" > server/logs/telegram-cache.json
echo "export const chains = []" > server/chains.js
cd server
npm install
cd ../client
npm install
```

Add the following values to the server/.env file replacing the telegram values with your telegram bot's details.
Make sure your chat id is a channel's chat id.
```
TELEGRAM_CHAT_ID=-12345678
TELEGRAM_API_URL="https://api.telegram.org/botYOURBOTTOKEN"
```

In the chains.js file add your desired crypto to watch.
This example is monitoring STG and AVAX on Trader Joe XYZ on the AVAX network.
```
export const chains = [
  {
    name: 'AVAX',
    pair: '0x330f77bda60d8dab14d2bb4f6248251443722009', // trader joe xyz
    router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', // trader joe xyz
    tokenSymbol: 'STG',
    token0: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590', // STG
    token1: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
    JsonRpc: 'https://api.avax.network/ext/bc/C/rpc',
    token0Precision: 18,
    token1Precision: 6,
  },
  {
    name: 'AVAX',
    pair: '0xf4003f4efbe8691b60249e6afbd307abe7758adb', // trader joe xyz
    router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', // trader joe xyz
    tokenSymbol: 'AVAX', // technically its WAVAX
    token0: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
    token1: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
    JsonRpc: 'https://api.avax.network/ext/bc/C/rpc',
    token0Precision: 18,
    token1Precision: 6,
  },
]
```

## Available scripts / run instructions

[Client](client/README.md)

[Server](server/README.md)
