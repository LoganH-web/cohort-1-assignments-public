'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { MiniAMM__factory, MockERC20__factory } from '../types/ethers-contracts'

export function SwapInterface() {
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB')
  const [inputAmount, setInputAmount] = useState('1')
  const [outputAmount, setOutputAmount] = useState('0')
  const { address, isConnected } = useAccount()
  
  // Contract write hook for swapping
  const { 
    writeContract, 
    data: hash,
    isPending: isWritePending,
    error: writeError 
  } = useWriteContract()

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Read tokenX and tokenY addresses from MiniAMM
  const { data: tokenXAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'tokenX',
  })

  // Read tokenY address (unused in current implementation)
  useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'tokenY',
  })

  // Read reserves from MiniAMM
  const { data: xReserve, refetch: refetchXReserve } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'xReserve',
  })

  const { data: yReserve, refetch: refetchYReserve } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'yReserve',
  })

  // Read user balances
  const { data: tokenABalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  const { data: tokenBBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Check allowances
  const { data: tokenAAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  const { data: tokenBAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Determine which token is X and Y
  const isTokenAasX = tokenXAddress?.toLowerCase() === CONTRACT_ADDRESSES.TOKEN_A.toLowerCase()
  const isTokenBasX = tokenXAddress?.toLowerCase() === CONTRACT_ADDRESSES.TOKEN_B.toLowerCase()

  // Calculate output amount using constant product formula (x * y = k)
  useEffect(() => {
    if (!xReserve || !yReserve || !inputAmount || parseFloat(inputAmount) <= 0) {
      setOutputAmount('0')
      return
    }

    try {
      const inputAmountBig = parseEther(inputAmount)
      
      if (swapDirection === 'AtoB') {
        // Swapping TOKEN_A for TOKEN_B
        if (isTokenAasX) {
          // TOKEN_A is X, TOKEN_B is Y: selling X for Y
          const fee = inputAmountBig * BigInt(3) / BigInt(1000) // 0.3% fee
          const inputAfterFee = inputAmountBig - fee
          const numerator = inputAfterFee * yReserve
          const denominator = xReserve + inputAfterFee
          const outputAmountBig = numerator / denominator
          setOutputAmount(formatEther(outputAmountBig))
        } else {
          // TOKEN_A is Y, TOKEN_B is X: selling Y for X
          const fee = inputAmountBig * BigInt(3) / BigInt(1000) // 0.3% fee
          const inputAfterFee = inputAmountBig - fee
          const numerator = inputAfterFee * xReserve
          const denominator = yReserve + inputAfterFee
          const outputAmountBig = numerator / denominator
          setOutputAmount(formatEther(outputAmountBig))
        }
      } else {
        // Swapping TOKEN_B for TOKEN_A
        if (isTokenBasX) {
          // TOKEN_B is X, TOKEN_A is Y: selling X for Y
          const fee = inputAmountBig * BigInt(3) / BigInt(1000) // 0.3% fee
          const inputAfterFee = inputAmountBig - fee
          const numerator = inputAfterFee * yReserve
          const denominator = xReserve + inputAfterFee
          const outputAmountBig = numerator / denominator
          setOutputAmount(formatEther(outputAmountBig))
        } else {
          // TOKEN_B is Y, TOKEN_A is X: selling Y for X
          const fee = inputAmountBig * BigInt(3) / BigInt(1000) // 0.3% fee
          const inputAfterFee = inputAmountBig - fee
          const numerator = inputAfterFee * xReserve
          const denominator = yReserve + inputAfterFee
          const outputAmountBig = numerator / denominator
          setOutputAmount(formatEther(outputAmountBig))
        }
      }
    } catch (error) {
      console.error('Error calculating output amount:', error)
      setOutputAmount('0')
    }
  }, [inputAmount, swapDirection, xReserve, yReserve, isTokenAasX, isTokenBasX])

  const handleSwap = async () => {
    if (!isConnected || !inputAmount || parseFloat(inputAmount) <= 0) return

    try {
      const inputAmountBig = parseEther(inputAmount)
      
      if (swapDirection === 'AtoB') {
        // Swapping TOKEN_A for TOKEN_B
        if (isTokenAasX) {
          // TOKEN_A is X: swap(inputAmount, 0)
          writeContract({
            address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
            abi: MiniAMM__factory.abi,
            functionName: 'swap',
            args: [inputAmountBig, BigInt(0)],
          })
        } else {
          // TOKEN_A is Y: swap(0, inputAmount)
          writeContract({
            address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
            abi: MiniAMM__factory.abi,
            functionName: 'swap',
            args: [BigInt(0), inputAmountBig],
          })
        }
      } else {
        // Swapping TOKEN_B for TOKEN_A
        if (isTokenBasX) {
          // TOKEN_B is X: swap(inputAmount, 0)
          writeContract({
            address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
            abi: MiniAMM__factory.abi,
            functionName: 'swap',
            args: [inputAmountBig, BigInt(0)],
          })
        } else {
          // TOKEN_B is Y: swap(0, inputAmount)
          writeContract({
            address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
            abi: MiniAMM__factory.abi,
            functionName: 'swap',
            args: [BigInt(0), inputAmountBig],
          })
        }
      }
    } catch (error) {
      console.error('Swap error:', error)
    }
  }

  // Refresh reserves and balances when transaction is confirmed
  if (isConfirmed) {
    refetchXReserve()
    refetchYReserve()
  }

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError

  // Get current balances and allowances based on swap direction
  const inputTokenBalance = swapDirection === 'AtoB' ? tokenABalance : tokenBBalance
  const inputTokenAllowance = swapDirection === 'AtoB' ? tokenAAllowance : tokenBAllowance
  const inputTokenSymbol = swapDirection === 'AtoB' ? 'TKA' : 'TKB'
  const outputTokenSymbol = swapDirection === 'AtoB' ? 'TKB' : 'TKA'

  // Check if user has sufficient balance and allowance
  const hasInsufficientBalance = !!(inputTokenBalance && parseEther(inputAmount || '0') > inputTokenBalance)
  const hasInsufficientAllowance = !!(inputTokenAllowance && parseEther(inputAmount || '0') > inputTokenAllowance)

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600 text-center">
          Connect your wallet to use the swap interface
        </p>
      </div>
    )
  }

  // Check if pool has liquidity
  const hasLiquidity = xReserve && yReserve && xReserve > BigInt(0) && yReserve > BigInt(0)

  if (!hasLiquidity) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Swap</h2>
          <p className="text-gray-600">
            Swap between TOKEN_A and TOKEN_B using the AMM
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 text-center font-medium">
            ⚠️ No Liquidity Available
          </p>
          <p className="text-yellow-700 text-center text-sm mt-1">
            The pool is empty. Add liquidity first to enable swapping.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Swap</h2>
        <p className="text-gray-600">
          Swap between TOKEN_A and TOKEN_B using the AMM
        </p>
      </div>


      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        {/* Swap Direction Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setSwapDirection('AtoB')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              swapDirection === 'AtoB'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            TKA → TKB
          </button>
          <button
            onClick={() => setSwapDirection('BtoA')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              swapDirection === 'BtoA'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            TKB → TKA
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                You Pay ({inputTokenSymbol})
              </label>
              <span className="text-xs text-gray-500">
                Balance: {inputTokenBalance ? parseFloat(formatEther(inputTokenBalance)).toFixed(2) : '0.00'}
              </span>
            </div>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="0.00"
              disabled={isLoading}
            />
            {hasInsufficientBalance && (
              <p className="text-red-600 text-xs mt-1">Insufficient balance</p>
            )}
            {hasInsufficientAllowance && (
              <p className="text-yellow-600 text-xs mt-1">
                ⚠️ Insufficient allowance. Approve tokens first.
              </p>
            )}
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <div className="bg-gray-50 rounded-full p-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                You Receive ({outputTokenSymbol})
              </label>
              <span className="text-xs text-gray-500">
                ~{parseFloat(outputAmount).toFixed(6)}
              </span>
            </div>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg text-gray-900">
              {parseFloat(outputAmount).toFixed(6)}
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {parseFloat(outputAmount) > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Rate:</span>
                <span>1 {inputTokenSymbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount || '1')).toFixed(6)} {outputTokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee (0.3%):</span>
                <span>{(parseFloat(inputAmount || '0') * 0.003).toFixed(6)} {inputTokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Price Impact:</span>
                <span className="text-yellow-600">
                  {xReserve && yReserve ? 
                    `~${((parseFloat(inputAmount || '0') / (parseFloat(formatEther(swapDirection === 'AtoB' ? (isTokenAasX ? xReserve : yReserve) : (isTokenBasX ? xReserve : yReserve))))) * 100).toFixed(2)}%` 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={
            !isConnected || 
            !inputAmount || 
            parseFloat(inputAmount) <= 0 ||
            isLoading ||
            hasInsufficientBalance ||
            hasInsufficientAllowance
          }
          className="w-full mt-6 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isWritePending ? 'Confirming...' : 'Swapping...'}
            </span>
          ) : hasInsufficientBalance ? (
            'Insufficient Balance'
          ) : hasInsufficientAllowance ? (
            'Approve Tokens First'
          ) : (
            `Swap ${inputAmount || '0'} ${inputTokenSymbol}`
          )}
        </button>

        {/* Status Messages */}
        {isConfirmed && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              ✅ Swap completed successfully!
            </p>
            <p className="text-green-700 text-xs mt-1">
              Swapped {inputAmount} {inputTokenSymbol} for ~{parseFloat(outputAmount).toFixed(6)} {outputTokenSymbol}
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              ❌ Error: {error.message}
            </p>
          </div>
        )}

        {hash && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm font-medium mb-1">
              Transaction Submitted
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-700">Hash:</span>
                <span className="font-mono text-blue-900 break-all">
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Swap:</span>
                <span className="text-blue-900">{inputAmount} {inputTokenSymbol} → {outputTokenSymbol}</span>
              </div>
            </div>
            <a
              href={`https://coston2.testnet.flarescan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs underline mt-2 block"
            >
              View on Explorer →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}