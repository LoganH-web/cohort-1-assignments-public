import { WalletConnection } from '../components/WalletConnection'
import { WalletStatus } from '../components/WalletStatus'
import { TokenMinting } from '../components/TokenMinting'
import { TokenApproval } from '../components/TokenApproval'
import { BalanceDisplay } from '../components/BalanceDisplay'
import { SwapInterface } from '../components/SwapInterface'
import { LiquidityManagement } from '../components/LiquidityManagement'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <WalletConnection />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Welcome to MiniAMM</h2>
          <p className="text-gray-600">A simple automated market maker interface</p>
        </div>
        
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Wallet Status */}
          <WalletStatus />
          
          {/* Balance Display */}
          <BalanceDisplay />
          
          {/* Token Minting */}
          <TokenMinting />
          
          {/* Token Approval */}
          <TokenApproval />
          
          {/* Swap Interface */}
          <SwapInterface />
          
          {/* Liquidity Management */}
          <LiquidityManagement />
          

        </div>
      </main>
    </div>
  );
}
