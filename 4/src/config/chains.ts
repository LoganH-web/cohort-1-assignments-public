import { defineChain } from 'viem'

// Flare Coston2 Testnet Configuration
export const flareCoston2 = defineChain({
  id: 114,
  name: 'Flare Coston2 Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    default: {
      http: ['https://coston2-api.flare.network/ext/C/rpc'],
      webSocket: ['wss://coston2-api.flare.network/ext/C/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flare Coston2 Explorer',
      url: 'https://coston2.testnet.flarescan.com',
    },
  },
  testnet: true,
})

// Contract addresses on Flare Coston2
export const CONTRACT_ADDRESSES = {
  TOKEN_A: '0x39825E5C2f771cE43d56C3f7890E275673e7D8Fc',
  TOKEN_B: '0xFE603Cc80cB91D89437DF7d6cb4b3494d9AbE118',
  MINIAMM: '0xD37E910CB75b9c354120102D93d62a8697eE1f12',
} as const