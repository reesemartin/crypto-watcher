import { ethers } from "ethers"
import { writeFile, readFile } from "fs/promises"

const AMOUNT_OF_STG = 1
let PRICES = []

const savePriceRecord = async (price) => {
  console.log(price)

  PRICES.push({...price})
  if (PRICES.length > 10000) {
    PRICES.shift() // only store up to 10000 price records
  }

  try {
    await writeFile('./logs/prices.json', JSON.stringify(PRICES), { encoding: "utf8" })
    return
  }
  catch(err) {
    throw err
  }
}

const chains = [
  {
    name: 'AVAX',
    pair: '0x330f77bda60d8dab14d2bb4f6248251443722009',
    router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    tokenSymbol: 'STG',
    token0: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    token1: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    provider: new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc'),
    token0ReserveTransform: x => ethers.utils.formatUnits(x, 18),
    token1ReserveTransform: x => ethers.utils.formatUnits(x, 6),
    amountInTransform: x => String(x) + '000000000000000000',
    amountOutTransform: x => x / 10 ** 6,
  },
]

function generateContracts (chain) {
  const pairContract = new ethers.Contract(
    chain.pair,
    [
      'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)',
      'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
      'function token0 () external view returns (address token0)',
      'function token1 () external view returns (address token1)',
    ],
    chain.provider
  )

  const routerContract = new ethers.Contract(
    chain.router,
    [
      'function getPair(address tokenA, address tokenB) external view returns (address pair)',
      'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)'
    ],
    chain.provider
  )

  return {
    pairContract,
    routerContract
  }
}

async function watchPair (chain, contracts) {
  console.log('start chain', chain.name)
  const { pairContract, routerContract } = contracts

  pairContract.on('Swap', async () => {
    console.log('swap chain', chain.name)
    const [token0Reserve, token1Reserve] = await pairContract.getReserves()
    const reserveA = chain.token0ReserveTransform(token0Reserve)
    const reserveB = chain.token1ReserveTransform(token1Reserve)

    const price = Number(reserveB) / Number(reserveA)

    const amountIn = chain.amountInTransform(AMOUNT_OF_STG)
    const amounts = await routerContract.getAmountsOut(amountIn, [chain.token0, chain.token1])
    const amountOut = chain.amountOutTransform(Number(amounts[1].toString()))

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = now.getDate()
    const time = now.toLocaleTimeString()

    let priceRecord = {
      timestamp: `${year}-${month}-${day} ${time}`,
      chain: chain.name,
      token: chain.tokenSymbol,
      price: Number(price),
      amountOut: Number(amountOut)
    }
    await savePriceRecord(priceRecord)
  } )
}

export const gatherer = async () => {
  console.log('start gathering')
  try {
    let pricesRaw = await readFile('./logs/prices.json')
    PRICES = JSON.parse(pricesRaw)
    if (!Array.isArray(PRICES)) PRICES = []
  }
  catch(err) {
    console.error(err)
  }

  chains.forEach(chain => {
    const contracts = generateContracts(chain)
    watchPair(chain, contracts)
  })
}
