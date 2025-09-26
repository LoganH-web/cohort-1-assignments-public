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
  TOKEN_A: '0x457FE1F960539fEd12424323568B302586AFd09b',
  TOKEN_B: '0x244D9D28366ebD7C1576054603273A52d1849502',
  MINIAMM: '0x1d08027726194C032691A816580620ADD7DA00c3',
} as const