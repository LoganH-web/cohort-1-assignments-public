import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { flareCoston2 } from './chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'MiniAMM UI',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [flareCoston2],
  ssr: false,
})