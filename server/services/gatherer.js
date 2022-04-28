import { ethers } from "ethers"
import { getLog, setLog, saveLog } from './../lib/logger.js'
import { chains } from './../chains.js'

const AMOUNT_OF_TOKEN = 1

const savePriceRecord = async (price) => {
  console.log(price)

  let prices = getLog('prices')
  prices.push({...price})
  if (prices.length > 1000000) { // only store up to 1,000,000 price records
    prices.shift()
  }
  setLog('prices', prices)
  await saveLog('prices')
}

function generateChains (rawChains) {
  let chains = []
  for (let i = 0; i < rawChains.length; i++) {
    const chain = rawChains[i];
    chains.push({
      name: chain.name,
      pair: chain.pair,
      router: chain.router,
      tokenSymbol: chain.tokenSymbol,
      token0: chain.token0,
      token1: chain.token1,
      provider: new ethers.providers.JsonRpcProvider(chain.JsonRpc),
      token0ReserveTransform: x => ethers.utils.formatUnits(x, chain.token0Precision),
      token1ReserveTransform: x => ethers.utils.formatUnits(x, chain.token1Precision),
      amountInTransform: x => String(x) + '0'.repeat(chain.token1Precision),
      amountOutTransform: x => x / 10 ** chain.token1Precision,
    })
  }

  return [...chains]
}

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

    const amountIn = chain.amountInTransform(AMOUNT_OF_TOKEN)
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

  const formattedChains = generateChains(chains)

  formattedChains.forEach(chain => {
    const contracts = generateContracts(chain)
    watchPair(chain, contracts)
  })
}
