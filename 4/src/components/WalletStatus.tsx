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
      <div className="glass-card p-8 rounded-xl animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-color-bg-tertiary flex items-center justify-center">
            <svg className="w-8 h-8 text-color-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-color-text-secondary mb-1">Wallet Not Connected</h3>
          <p className="text-sm text-color-text-tertiary">Connect your wallet to start trading</p>
        </div>
      </div>
    )
  }

  if (chain?.id !== flareCoston2.id) {
    return (
      <div className="glass-card p-8 rounded-xl border-2 border-color-danger animate-fadeIn">
        <div className="status-danger">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Wrong Network</p>
              <p className="text-xs mt-1">Please switch to Flare Coston2 Testnet</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card-elevated p-8 rounded-xl animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-color-success animate-pulse"></div>
          <h3 className="text-lg font-semibold text-color-text-primary">Wallet Connected</h3>
        </div>
        <span className="badge badge-success">✓ Coston2</span>
      </div>

      {/* Wallet Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Address */}
        <div className="bg-color-bg-secondary p-6 rounded-lg">
          <p className="text-xs text-color-text-tertiary mb-1">Address</p>
          <p className="font-mono text-sm text-color-text-primary font-medium">
            {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : ''}
          </p>
        </div>

        {/* Balance */}
        {balance && (
          <div className="bg-color-bg-secondary p-6 rounded-lg">
            <p className="text-xs text-color-text-tertiary mb-1">C2FLR Balance</p>
            <p className="text-sm font-semibold text-color-success">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </div>

      {/* Contract Addresses */}
      <div className="border-t border-color-border-primary pt-4">
        <p className="text-xs text-color-text-tertiary mb-3 font-medium">Contract Addresses</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-color-text-secondary">MiniAMM:</span>
            <span className="font-mono text-color-text-primary">
              {`${CONTRACT_ADDRESSES.MINIAMM.slice(0, 8)}...${CONTRACT_ADDRESSES.MINIAMM.slice(-6)}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-color-text-secondary">Token A:</span>
            <span className="font-mono text-color-text-primary">
              {`${CONTRACT_ADDRESSES.TOKEN_A.slice(0, 8)}...${CONTRACT_ADDRESSES.TOKEN_A.slice(-6)}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-color-text-secondary">Token B:</span>
            <span className="font-mono text-color-text-primary">
              {`${CONTRACT_ADDRESSES.TOKEN_B.slice(0, 8)}...${CONTRACT_ADDRESSES.TOKEN_B.slice(-6)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}