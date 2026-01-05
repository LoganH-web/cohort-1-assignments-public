'use client'

import { useState } from 'react'
import { WalletConnection } from '../components/WalletConnection'
import { WalletStatus } from '../components/WalletStatus'
import { TokenMinting } from '../components/TokenMinting'
import { TokenApproval } from '../components/TokenApproval'
import { BalanceDisplay } from '../components/BalanceDisplay'
import { SwapInterface } from '../components/SwapInterface'
import { LiquidityManagement } from '../components/LiquidityManagement'

type TabType = 'swap' | 'liquidity' | 'tokens' | 'portfolio'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('swap')

  return (
    <div>
      <WalletConnection />

      <main className="container-custom py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-gradient">MiniAMM</span>
          </h2>
          <p className="text-color-text-secondary text-lg text-center">
            Automated Market Maker
          </p>
        </div>

        {/* All content below hero - PROPERLY CENTERED with flex (Requirement #2) */}
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl px-4">
            {/* Tab Navigation - ENLARGED with BIGGER MARGINS (Requirement #3) */}
            <div className="mb-10">
              <div className="flex gap-3 p-3 bg-color-bg-secondary rounded-2xl">
                <button
                  onClick={() => setActiveTab('swap')}
                  className={`flex-1 py-4 px-8 rounded-xl text-base font-semibold transition-all ${activeTab === 'swap'
                    ? 'bg-color-bg-elevated text-color-text-primary shadow-lg'
                    : 'text-color-text-tertiary hover:text-color-text-secondary'
                    }`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setActiveTab('liquidity')}
                  className={`flex-1 py-4 px-8 rounded-xl text-base font-semibold transition-all ${activeTab === 'liquidity'
                    ? 'bg-color-bg-elevated text-color-text-primary shadow-lg'
                    : 'text-color-text-tertiary hover:text-color-text-secondary'
                    }`}
                >
                  Liquidity
                </button>
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`flex-1 py-4 px-8 rounded-xl text-base font-semibold transition-all ${activeTab === 'tokens'
                    ? 'bg-color-bg-elevated text-color-text-primary shadow-lg'
                    : 'text-color-text-tertiary hover:text-color-text-secondary'
                    }`}
                >
                  Tokens
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`flex-1 py-4 px-8 rounded-xl text-base font-semibold transition-all ${activeTab === 'portfolio'
                    ? 'bg-color-bg-elevated text-color-text-primary shadow-lg'
                    : 'text-color-text-tertiary hover:text-color-text-secondary'
                    }`}
                >
                  Portfolio
                </button>
              </div>
            </div>



            {/* Tab Content - MORE MARGIN (Requirement #6) */}
            <div className="mt-8">
              {activeTab === 'swap' && (
                <div className="animate-fadeIn">
                  <SwapInterface />
                </div>
              )}

              {activeTab === 'liquidity' && (
                <div className="animate-fadeIn">
                  <LiquidityManagement />
                </div>
              )}

              {activeTab === 'tokens' && (
                <div className="space-y-10 animate-fadeIn">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-center text-color-text-primary">
                      Mint Test Tokens
                    </h3>
                    <TokenMinting />
                  </div>

                  <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-6 text-center text-color-text-primary">
                      Token Approvals
                    </h3>
                    <TokenApproval />
                  </div>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="animate-fadeIn">
                  <div className="mb-8">
                    <WalletStatus />
                  </div>
                  <BalanceDisplay />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-color-border-primary mt-4 py-8">
        <div className="container-custom text-center text-color-text-tertiary text-sm">
          <p>MiniAMM • Flare Coston2 Testnet</p>
        </div>
      </footer>
    </div>
  );
}
