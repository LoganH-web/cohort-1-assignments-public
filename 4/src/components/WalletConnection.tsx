'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { flareCoston2 } from '../config/chains'

export function WalletConnection() {
  const { isConnected, chain } = useAccount()

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-display text-gradient">Hell Month</h1>
              <p className="text-xs text-color-text-tertiary">MiniAMM</p>
            </div>
          </div>

          {/* Network Badge and Connect Button */}
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className={`badge ${chain?.id === flareCoston2.id
                ? 'badge-success'
                : 'badge-danger'
                }`}>
                {chain?.id === flareCoston2.id ? '✓ Coston2' : '⚠ Wrong Network'}
              </div>
            )}
            <ConnectButton />
          </div>
        </div>

        {/* Network Warning Banner */}
        {isConnected && chain?.id !== flareCoston2.id && (
          <div className="pb-3">
            <div className="status-warning animate-fadeIn">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Please switch to Flare Coston2 Testnet</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}