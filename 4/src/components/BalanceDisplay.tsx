'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { MockERC20__factory, MiniAMM__factory } from '../types/ethers-contracts'

export function BalanceDisplay() {
  const { address, isConnected } = useAccount()

  // Read TOKEN_A balance in wallet
  const { data: tokenABalance, refetch: refetchTokenABalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read TOKEN_B balance in wallet
  const { data: tokenBBalance, refetch: refetchTokenBBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read TOKEN_A reserves in MiniAMM
  const { data: tokenAReserves, refetch: refetchTokenAReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
  })

  // Read TOKEN_B reserves in MiniAMM
  const { data: tokenBReserves, refetch: refetchTokenBReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
  })

  // Read LP token balance
  const { data: lpTokenBalance, refetch: refetchLPBalance } = useReadContract({
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

  // Read token names
  const { data: tokenAName } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'name',
  })

  const { data: tokenBName } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'name',
  })

  // Refresh all balances function
  const refreshBalances = () => {
    if (isConnected) {
      refetchTokenABalance()
      refetchTokenBBalance()
      refetchLPBalance()
    }
    refetchTokenAReserves()
    refetchTokenBReserves()
  }

  // Calculate pool share percentage
  const poolSharePercentage = lpTokenBalance && lpTotalSupply && lpTotalSupply > BigInt(0)
    ? (Number(lpTokenBalance) / Number(lpTotalSupply)) * 100
    : 0

  // Calculate current price (TOKEN_B per TOKEN_A)
  const currentPrice = tokenAReserves && tokenBReserves && tokenAReserves > BigInt(0)
    ? parseFloat(formatEther(tokenBReserves)) / parseFloat(formatEther(tokenAReserves))
    : 0

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Balance Overview</h2>
          <p className="text-gray-600">
            Connect your wallet to view your token balances
          </p>
        </div>

        {/* Pool Information - Available without wallet connection */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">TOKEN_A Reserves</p>
              <p className="text-xl font-bold text-blue-600">
                {tokenAReserves ? parseFloat(formatEther(tokenAReserves)).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500">TKA</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">TOKEN_B Reserves</p>
              <p className="text-xl font-bold text-green-600">
                {tokenBReserves ? parseFloat(formatEther(tokenBReserves)).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500">TKB</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Price</p>
              <p className="text-xl font-bold text-purple-600">
                {currentPrice > 0 ? currentPrice.toFixed(4) : '0.0000'}
              </p>
              <p className="text-xs text-gray-500">TKB per TKA</p>
            </div>
          </div>
          
          {tokenAReserves === BigInt(0) && tokenBReserves === BigInt(0) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                💡 The pool is empty. Add liquidity to start trading!
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Balance Overview</h2>
        <p className="text-gray-600">
          Your wallet balances and pool information
        </p>
      </div>

      {/* Wallet Balances */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Wallet</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{tokenAName || 'TOKEN_A'}</p>
            <p className="text-2xl font-bold text-blue-600">
              {tokenABalance ? parseFloat(formatEther(tokenABalance)).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500">TKA</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{tokenBName || 'TOKEN_B'}</p>
            <p className="text-2xl font-bold text-green-600">
              {tokenBBalance ? parseFloat(formatEther(tokenBBalance)).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500">TKB</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">LP Tokens</p>
            <p className="text-2xl font-bold text-purple-600">
              {lpTokenBalance ? parseFloat(formatEther(lpTokenBalance)).toFixed(6) : '0.000000'}
            </p>
            <p className="text-xs text-gray-500">
              {poolSharePercentage > 0 ? `${poolSharePercentage.toFixed(2)}% of pool` : 'No share'}
            </p>
          </div>
        </div>
      </div>

      {/* Pool Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">MiniAMM Pool</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pool Reserves */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Pool Reserves</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">TOKEN_A (TKA)</span>
                <span className="font-semibold text-gray-900">
                  {tokenAReserves ? parseFloat(formatEther(tokenAReserves)).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">TOKEN_B (TKB)</span>
                <span className="font-semibold text-gray-900">
                  {tokenBReserves ? parseFloat(formatEther(tokenBReserves)).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Pool Stats */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Pool Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Current Price</span>
                <span className="font-semibold text-gray-900">
                  {currentPrice > 0 ? `${currentPrice.toFixed(4)} TKB/TKA` : 'No price'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total LP Supply</span>
                <span className="font-semibold text-gray-900">
                  {lpTotalSupply ? parseFloat(formatEther(lpTotalSupply)).toFixed(6) : '0.000000'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pool Status Messages */}
        <div className="mt-4">
          {tokenAReserves === BigInt(0) && tokenBReserves === BigInt(0) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm font-medium">
                💡 Pool is Empty
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                Be the first to add liquidity to this pool and start earning fees!
              </p>
            </div>
          )}
          
          {tokenAReserves && tokenBReserves && tokenAReserves > BigInt(0) && tokenBReserves > BigInt(0) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm font-medium">
                ✅ Pool is Active
              </p>
              <p className="text-green-700 text-xs mt-1">
                Pool has liquidity and is ready for swaps. Current K value: {(parseFloat(formatEther(tokenAReserves)) * parseFloat(formatEther(tokenBReserves))).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}