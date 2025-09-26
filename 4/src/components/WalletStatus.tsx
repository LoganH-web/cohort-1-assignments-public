'use client'

import { useAccount, useBalance } from 'wagmi'
import { flareCoston2, CONTRACT_ADDRESSES } from '../config/chains'

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    chainId: flareCoston2.id,
  })

  if (!isConnected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-center">
          Please connect your wallet to continue
        </p>
      </div>
    )
  }

  if (chain?.id !== flareCoston2.id) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-center">
          Please switch to Flare Coston2 Testnet
        </p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-green-800 font-medium">Wallet Connected</span>
        <span className="text-green-700 text-sm">✅ Flare Coston2</span>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-green-700">Address:</span>
          <span className="font-mono text-green-800">
            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}
          </span>
        </div>
        
        {balance && (
          <div className="flex justify-between">
            <span className="text-green-700">C2FLR Balance:</span>
            <span className="font-mono text-green-800">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </span>
          </div>
        )}
        
        <hr className="border-green-300 my-2" />
        
        <div className="text-xs text-green-600">
          <div className="font-medium mb-1">Contract Addresses:</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>MiniAMM:</span>
              <span className="font-mono">
                {`${CONTRACT_ADDRESSES.MINIAMM.slice(0, 6)}...${CONTRACT_ADDRESSES.MINIAMM.slice(-4)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Token A:</span>
              <span className="font-mono">
                {`${CONTRACT_ADDRESSES.TOKEN_A.slice(0, 6)}...${CONTRACT_ADDRESSES.TOKEN_A.slice(-4)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Token B:</span>
              <span className="font-mono">
                {`${CONTRACT_ADDRESSES.TOKEN_B.slice(0, 6)}...${CONTRACT_ADDRESSES.TOKEN_B.slice(-4)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}