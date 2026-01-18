import { createConfig, http, cookieStorage, createStorage, webSocket } from "wagmi";
import { lineaSepolia, linea, mainnet } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const anvil = {
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
      webSocket: ['ws://127.0.0.1:8545'],
    },
  },
}

export function getConfig() {
  return createConfig({
    chains: [anvil, lineaSepolia, linea, mainnet],
    connectors: [metaMask()],
    ssr: true,

    // 🔥 BẮT BUỘC khi dùng RPC URL explicit
    syncConnectedChain: true,

    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      // [anvil.id]: http('http://127.0.0.1:8545'),
      // ✅ Anvil: WebSocket realtime
      [anvil.id]: webSocket('ws://127.0.0.1:8545'),
      [lineaSepolia.id]: http(),
      [linea.id]: http(),
      [mainnet.id]: http(),
    },
  });
}