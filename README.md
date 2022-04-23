# Crypto Watcher
Tool for automated gathering and notification of crypto data

Notifications are sent via [Telegram's](https://telegram.org/) [bot API](https://core.telegram.org/bots#6-botfather) using [BotFather](https://t.me/botfather). This script is configured to message a channel and not direct messaging which is important because the update notifactions Telegram sends are specific. Maybe someday this will be updated to dynamically detect channel vs DM.

Currently only monitoring STG on the AVAX network

## Available Telegram Bot Commands

### `/price`
Provides the latest price

## Install
```
touch .env
mkdir logs
touch logs\prices.json
touch logs\telegram-cache.json
npm install
```

Add the following values to the .env file replacing the values with your telegram bot's details
```
TELEGRAM_CHAT_ID=-12345678
TELEGRAM_API_URL="https://api.telegram.org/botYOURBOTTOKEN"
```
Make sure your chat id is a channel's chat id




## Available Scripts

### `npm run start`

Kicks off the gathering of crypto data and data monitoring messenger

### `npm run test`

Runs the available tests (once I add them)
