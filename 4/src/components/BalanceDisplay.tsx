'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { MockERC20__factory, MiniAMM__factory } from '../types/ethers-contracts'

export function BalanceDisplay() {
  const { address, isConnected } = useAccount()

  // Read TOKEN_A balance in wallet
  const { data: tokenABalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read TOKEN_B balance in wallet
  const { data: tokenBBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read TOKEN_A reserves in MiniAMM
  const { data: tokenAReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
  })

  // Read TOKEN_B reserves in MiniAMM
  const { data: tokenBReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
  })

  // Read LP token balance
  const { data: lpTokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read total LP supply
  const { data: lpTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'totalSupply',
  })

  // Calculate pool share percentage
  const poolSharePercentage = lpTokenBalance && lpTotalSupply && lpTotalSupply > BigInt(0)
    ? (Number(lpTokenBalance) / Number(lpTotalSupply)) * 100
    : 0

  // Calculate current price (TOKEN_B per TOKEN_A)
  const currentPrice = tokenAReserves && tokenBReserves && tokenAReserves > BigInt(0)
    ? parseFloat(formatEther(tokenBReserves)) / parseFloat(formatEther(tokenAReserves))
    : 0

  // Check if pool has liquidity
  const hasLiquidity = tokenAReserves && tokenBReserves && tokenAReserves > BigInt(0) && tokenBReserves > BigInt(0)

  if (!isConnected) {
    return (
      <div className="glass-card p-8 rounded-xl">
        <h3 className="text-xl font-semibold text-display mb-4">Balance Overview</h3>
        <p className="text-color-text-tertiary text-center py-8">
          Connect your wallet to view your balances
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Your Wallet Balances */}
      <div className="glass-card p-8 rounded-xl">
        <h3 className="text-xl font-semibold text-display mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-primary"></span>
          Your Wallet
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TOKEN_A Balance */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-lg border border-color-border-primary hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-color-text-secondary font-medium">TKA</span>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-xs font-bold">A</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-color-text-primary mb-1">
              {tokenABalance ? parseFloat(formatEther(tokenABalance)).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-color-text-tertiary">TOKEN_A</p>
          </div>

          {/* TOKEN_B Balance */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 rounded-lg border border-color-border-primary hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-color-text-secondary font-medium">TKB</span>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400 text-xs font-bold">B</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-color-text-primary mb-1">
              {tokenBBalance ? parseFloat(formatEther(tokenBBalance)).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-color-text-tertiary">TOKEN_B</p>
          </div>

          {/* LP Tokens */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-5 rounded-lg border border-color-border-primary hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-color-text-secondary font-medium">LP</span>
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-gray-900 text-xs font-bold">LP</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-color-text-primary mb-1">
              {lpTokenBalance ? parseFloat(formatEther(lpTokenBalance)).toFixed(6) : '0.000000'}
            </p>
            <p className="text-xs text-color-text-tertiary">
              {poolSharePercentage > 0 ? `${poolSharePercentage.toFixed(2)}% of pool` : 'No share'}
            </p>
          </div>
        </div>
      </div>

      {/* Pool Information */}
      <div className="glass-card p-8 rounded-xl">
        <h3 className="text-xl font-semibold text-display mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-success"></span>
          Pool Liquidity
        </h3>

        {!hasLiquidity ? (
          <div className="status-warning">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Pool is Empty</p>
                <p className="text-xs mt-1">Add liquidity to enable swapping</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Token A Reserves */}
            <div className="bg-color-bg-secondary p-6 rounded-lg border border-color-border-primary">
              <p className="text-xs text-color-text-tertiary mb-2">TKA Reserves</p>
              <p className="text-2xl font-bold text-color-text-primary">
                {tokenAReserves ? parseFloat(formatEther(tokenAReserves)).toFixed(2) : '0.00'}
              </p>
            </div>

            {/* Token B Reserves */}
            <div className="bg-color-bg-secondary p-6 rounded-lg border border-color-border-primary">
              <p className="text-xs text-color-text-tertiary mb-2">TKB Reserves</p>
              <p className="text-2xl font-bold text-color-text-primary">
                {tokenBReserves ? parseFloat(formatEther(tokenBReserves)).toFixed(2) : '0.00'}
              </p>
            </div>

            {/* Current Price */}
            <div className="bg-color-bg-secondary p-6 rounded-lg border border-color-border-primary">
              <p className="text-xs text-color-text-tertiary mb-2">Price</p>
              <p className="text-2xl font-bold text-color-success">
                {currentPrice > 0 ? currentPrice.toFixed(4) : '0.0000'}
              </p>
              <p className="text-xs text-color-text-tertiary mt-1">TKB per TKA</p>
            </div>
          </div>
        )}

        {/* Pool Stats */}
        {hasLiquidity && (
          <div className="mt-4 pt-4 border-t border-color-border-primary">
            <div className="flex items-center justify-between text-sm">
              <span className="text-color-text-secondary">Total LP Supply:</span>
              <span className="font-mono font-semibold text-color-text-primary">
                {lpTotalSupply ? parseFloat(formatEther(lpTotalSupply)).toFixed(6) : '0.000000'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-color-text-secondary">K Value (x × y):</span>
              <span className="font-mono font-semibold text-color-text-primary">
                {tokenAReserves && tokenBReserves
                  ? (parseFloat(formatEther(tokenAReserves)) * parseFloat(formatEther(tokenBReserves))).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}