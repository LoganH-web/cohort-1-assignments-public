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

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash,
  })

  const { data: tokenXAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'tokenX',
  })

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
        if (isTokenAasX) {
          const fee = inputAmountBig * BigInt(3) / BigInt(1000)
          const inputAfterFee = inputAmountBig - fee
          const numerator = inputAfterFee * yReserve
          const denominator = xReserve + inputAfterFee
          const outputAmountBig = numerator / denominator
          setOutputAmount(formatEther(outputAmountBig))
        } else {
          const fee = inputAmountBig * BigInt(3) / BigInt(1000)
          const inputAfterFee = inputAmountBig - fee
          const numerator = inputAfterFee * xReserve
          const denominator = yReserve + inputAfterFee
          const outputAmountBig = numerator / denominator
          setOutputAmount(formatEther(outputAmountBig))
        }
      } else {
        if (isTokenBasX) {
          const fee = inputAmountBig * BigInt(3) / BigInt(1000)
          const inputAfterFee = inputAmountBig - fee
          const numerator = inputAfterFee * yReserve
          const denominator = xReserve + inputAfterFee
          const outputAmountBig = numerator / denominator
          setOutputAmount(formatEther(outputAmountBig))
        } else {
          const fee = inputAmountBig * BigInt(3) / BigInt(1000)
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
        if (isTokenAasX) {
          writeContract({
            address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
            abi: MiniAMM__factory.abi,
            functionName: 'swap',
            args: [inputAmountBig, BigInt(0)],
          })
        } else {
          writeContract({
            address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
            abi: MiniAMM__factory.abi,
            functionName: 'swap',
            args: [BigInt(0), inputAmountBig],
          })
        }
      } else {
        if (isTokenBasX) {
          writeContract({
            address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
            abi: MiniAMM__factory.abi,
            functionName: 'swap',
            args: [inputAmountBig, BigInt(0)],
          })
        } else {
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

  if (isConfirmed) {
    refetchXReserve()
    refetchYReserve()
  }

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError

  const inputTokenBalance = swapDirection === 'AtoB' ? tokenABalance : tokenBBalance
  const inputTokenAllowance = swapDirection === 'AtoB' ? tokenAAllowance : tokenBAllowance
  const inputTokenSymbol = swapDirection === 'AtoB' ? 'TKA' : 'TKB'
  const outputTokenSymbol = swapDirection === 'AtoB' ? 'TKB' : 'TKA'

  const hasInsufficientBalance = !!(inputTokenBalance && parseEther(inputAmount || '0') > inputTokenBalance)
  const hasInsufficientAllowance = !!(inputTokenAllowance && parseEther(inputAmount || '0') > inputTokenAllowance)

  if (!isConnected) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <p className="text-color-text-tertiary text-center">
          Connect your wallet to swap tokens
        </p>
      </div>
    )
  }

  const hasLiquidity = xReserve && yReserve && xReserve > BigInt(0) && yReserve > BigInt(0)

  if (!hasLiquidity) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-display mb-4">Token Swap</h3>
        <div className="status-warning">
          <p className="font-medium">⚠ No Liquidity Available</p>
          <p className="text-xs mt-1">Add liquidity first to enable swapping</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card-elevated p-8 rounded-2xl">
      <h3 className="text-xl font-semibold text-display mb-6">Token Swap</h3>

      {/* Swap Direction Toggle */}
      <div className="flex bg-color-bg-tertiary rounded-xl p-1 mb-6">
        <button
          onClick={() => setSwapDirection('AtoB')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${swapDirection === 'AtoB'
            ? 'bg-gradient-primary text-yellow-400 shadow-lg'
            : 'text-color-warning hover:text-color-primary'
            }`}
        >
          TKA → TKB
        </button>
        <button
          onClick={() => setSwapDirection('BtoA')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${swapDirection === 'BtoA'
            ? 'bg-gradient-primary text-yellow-400 shadow-lg'
            : 'text-color-warning hover:text-color-primary'
            }`}
        >
          TKB → TKA
        </button>
      </div>

      {/* Input Section */}
      <div className="space-y-8">
        <div className="bg-color-bg-secondary p-10 rounded-xl border border-color-border-primary">
          <div className="flex justify-between items-center mb-5">
            <label className="text-sm font-medium text-color-text-secondary">
              You Pay
            </label>
            <span className="text-xs text-color-text-tertiary">
              Balance: {inputTokenBalance ? parseFloat(formatEther(inputTokenBalance)).toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="flex-1 bg-transparent text-3xl font-bold text-color-text-primary outline-none placeholder-color-text-muted"
              placeholder="0.0"
              disabled={isLoading}
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-color-bg-tertiary rounded-lg">
              <span className="text-lg font-bold text-color-text-primary">{inputTokenSymbol}</span>
            </div>
          </div>
          {hasInsufficientBalance && (
            <p className="text-color-danger text-xs mt-2">Insufficient balance</p>
          )}
          {hasInsufficientAllowance && (
            <p className="text-color-warning text-xs mt-2">⚠ Insufficient allowance - approve first</p>
          )}
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-color-bg-elevated p-3 rounded-full border border-color-border-primary">
            <svg className="w-5 h-5 text-color-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-color-bg-secondary p-10 rounded-xl border border-color-border-primary">
          <div className="flex justify-between items-center mb-5">
            <label className="text-sm font-medium text-color-text-secondary">
              You Receive
            </label>
            <span className="text-xs text-color-text-tertiary">
              ≈{parseFloat(outputAmount).toFixed(6)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-3xl font-bold text-color-text-primary">
              {parseFloat(outputAmount).toFixed(6)}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-color-bg-tertiary rounded-lg">
              <span className="text-lg font-bold text-color-text-primary">{outputTokenSymbol}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Details */}
      {parseFloat(outputAmount) > 0 && (
        <div className="mt-4 p-6 bg-color-bg-secondary rounded-lg border border-color-border-primary">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-color-text-tertiary">Rate:</span>
              <span className="text-color-text-primary font-medium">
                1 {inputTokenSymbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount || '1')).toFixed(6)} {outputTokenSymbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-color-text-tertiary">Fee (0.3%):</span>
              <span className="text-color-text-primary">{(parseFloat(inputAmount || '0') * 0.003).toFixed(6)} {inputTokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-color-text-tertiary">Price Impact:</span>
              <span className="text-color-warning font-medium">
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
        className="btn-primary w-full mt-6"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner"></span>
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
        <div className="status-success mt-4 animate-fadeIn">
          <p className="font-medium">✓ Swap completed successfully!</p>
          <p className="text-xs mt-1">
            Swapped {inputAmount} {inputTokenSymbol} for ≈{parseFloat(outputAmount).toFixed(6)} {outputTokenSymbol}
          </p>
        </div>
      )}

      {error && (
        <div className="status-danger mt-4 animate-fadeIn">
          <p className="text-xs">Error: {error.message}</p>
        </div>
      )}

      {hash && (
        <div className="status-info mt-4 animate-fadeIn">
          <p className="text-xs font-medium">Transaction submitted</p>
          <a
            href={`https://coston2.testnet.flarescan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 inline-block hover:text-color-info"
          >
            View on Explorer →
          </a>
        </div>
      )}
    </div>
  )
}