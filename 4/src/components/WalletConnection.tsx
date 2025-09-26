'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export function WalletConnection() {
  const { address, isConnected, chain } = useAccount()

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MiniAMM</h1>
          {isConnected && (
            <p className="text-sm text-gray-600 mt-1">
              Network: {chain?.name || 'Unknown'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isConnected && address && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Connected</p>
              <p className="text-xs text-gray-600 font-mono">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </p>
            </div>
          )}
          <ConnectButton />
        </div>
      </div>
      
      {isConnected && chain?.name !== 'Flare Coston2 Testnet' && (
        <div className="px-4 pb-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Please switch to Flare Coston2 Testnet to use MiniAMM features
            </p>
          </div>
        </div>
      )}
    </div>
  )
}