import {
  createConfig,
  http,
  webSocket,
  cookieStorage,
  createStorage,
} from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export function getConfig() {
  return createConfig({
    chains: [sepolia, mainnet],
    connectors: [metaMask()],
    ssr: true,
    syncConnectedChain: true,

    storage: createStorage({
      storage: cookieStorage,
    }),

    transports: {
      // 🔥 WebSocket cho realtime event
      [sepolia.id]: webSocket('wss://eth-sepolia.g.alchemy.com/v2/igxy1deVF5dLeQ1QDtS8c'),
      [mainnet.id]: http(),
    },
  })
}