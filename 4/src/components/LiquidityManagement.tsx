'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { MiniAMM__factory, MockERC20__factory } from '../types/ethers-contracts'

export function LiquidityManagement() {
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add')

  // Add liquidity states
  const [tokenAAmount, setTokenAAmount] = useState('')
  const [tokenBAmount, setTokenBAmount] = useState('')
  const [activeInputField, setActiveInputField] = useState<'tokenA' | 'tokenB'>('tokenA')

  // Remove liquidity states
  const [lpAmount, setLpAmount] = useState('')
  const [expectedTokenA, setExpectedTokenA] = useState('0')
  const [expectedTokenB, setExpectedTokenB] = useState('0')

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

  const { data: lpBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  const { data: lpTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'totalSupply',
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

  // Calculate the other token amount based on pool ratio
  const calculateOtherAmount = useCallback((inputField: 'tokenA' | 'tokenB', amount: string) => {
    if (!xReserve || !yReserve || !amount || parseFloat(amount) <= 0) {
      if (inputField === 'tokenA') {
        setTokenBAmount('')
      } else {
        setTokenAAmount('')
      }
      return
    }

    try {
      if (inputField === 'tokenA') {
        if (isTokenAasX) {
          const xAmount = parseEther(amount)
          const yAmount = (xAmount * yReserve) / xReserve
          setTokenBAmount(formatEther(yAmount))
        } else {
          const yAmount = parseEther(amount)
          const xAmount = (yAmount * xReserve) / yReserve
          setTokenBAmount(formatEther(xAmount))
        }
      } else {
        if (isTokenAasX) {
          const yAmount = parseEther(amount)
          const xAmount = (yAmount * xReserve) / yReserve
          setTokenAAmount(formatEther(xAmount))
        } else {
          const xAmount = parseEther(amount)
          const yAmount = (xAmount * yReserve) / xReserve
          setTokenAAmount(formatEther(yAmount))
        }
      }
    } catch (error) {
      console.error('Error calculating other amount:', error)
    }
  }, [xReserve, yReserve, isTokenAasX])

  // Calculate expected tokens when removing liquidity
  useEffect(() => {
    if (!lpAmount || parseFloat(lpAmount) <= 0 || !xReserve || !yReserve || !lpTotalSupply || lpTotalSupply === BigInt(0)) {
      setExpectedTokenA('0')
      setExpectedTokenB('0')
      return
    }

    try {
      const lpAmountBig = parseEther(lpAmount)
      const tokenAExpected = (lpAmountBig * (isTokenAasX ? xReserve : yReserve)) / lpTotalSupply
      const tokenBExpected = (lpAmountBig * (isTokenAasX ? yReserve : xReserve)) / lpTotalSupply

      setExpectedTokenA(formatEther(tokenAExpected))
      setExpectedTokenB(formatEther(tokenBExpected))
    } catch (error) {
      console.error('Error calculating expected tokens:', error)
    }
  }, [lpAmount, xReserve, yReserve, lpTotalSupply, isTokenAasX])

  const handleAddLiquidity = async () => {
    if (!isConnected || !tokenAAmount || !tokenBAmount) return

    try {
      const amountA = parseEther(tokenAAmount)
      const amountB = parseEther(tokenBAmount)

      if (isTokenAasX) {
        writeContract({
          address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
          abi: MiniAMM__factory.abi,
          functionName: 'addLiquidity',
          args: [amountA, amountB],
        })
      } else {
        writeContract({
          address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
          abi: MiniAMM__factory.abi,
          functionName: 'addLiquidity',
          args: [amountB, amountA],
        })
      }
    } catch (error) {
      console.error('Add liquidity error:', error)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !lpAmount) return

    try {
      const lpAmountBig = parseEther(lpAmount)

      writeContract({
        address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
        abi: MiniAMM__factory.abi,
        functionName: 'removeLiquidity',
        args: [lpAmountBig],
      })
    } catch (error) {
      console.error('Remove liquidity error:', error)
    }
  }

  if (isConfirmed) {
    refetchXReserve()
    refetchYReserve()
  }

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError

  const hasInsufficientTokenA = tokenABalance && parseEther(tokenAAmount || '0') > tokenABalance
  const hasInsufficientTokenB = tokenBBalance && parseEther(tokenBAmount || '0') > tokenBBalance
  const hasInsufficientLP = lpBalance && parseEther(lpAmount || '0') > lpBalance
  const hasInsufficientAllowanceA = tokenAAllowance && parseEther(tokenAAmount || '0') > tokenAAllowance
  const hasInsufficientAllowanceB = tokenBAllowance && parseEther(tokenBAmount || '0') > tokenBAllowance

  const hasLiquidity = xReserve && yReserve && xReserve > BigInt(0) && yReserve > BigInt(0)

  if (!isConnected) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <p className="text-color-text-tertiary text-center">
          Connect your wallet to manage liquidity
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card-elevated p-10 rounded-2xl">
      <h3 className="text-xl font-semibold text-display mb-6">Manage Liquidity</h3>

      {/* Tab Toggle */}
      <div className="flex bg-color-bg-tertiary rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'add'
            ? 'bg-gradient-success text-yellow-400 shadow-lg'
            : 'text-color-warning hover:text-color-primary'
            }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab('remove')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'remove'
            ? 'bg-gradient-danger text-yellow-400 shadow-lg'
            : 'text-color-warning hover:text-color-primary'
            }`}
        >
          Remove Liquidity
        </button>
      </div>

      {activeTab === 'add' ? (
        <div className="space-y-4">
          {/* Token A Input */}
          <div className="bg-color-bg-secondary p-14 rounded-xl border border-color-border-primary">
            <div className="flex justify-between items-center mb-5">
              <label className="text-sm font-medium text-color-text-secondary">TKA Amount</label>
              <span className="text-xs text-color-text-tertiary">
                Balance: {tokenABalance ? parseFloat(formatEther(tokenABalance)).toFixed(2) : '0.00'}
              </span>
            </div>
            <input
              type="number"
              value={tokenAAmount}
              onChange={(e) => {
                setTokenAAmount(e.target.value)
                setActiveInputField('tokenA')
                if (hasLiquidity) calculateOtherAmount('tokenA', e.target.value)
              }}
              className="w-full bg-transparent text-3xl font-bold text-color-text-primary outline-none placeholder-color-text-muted"
              placeholder="0.0"
              disabled={isLoading}
            />
            {hasInsufficientTokenA && <p className="text-color-danger text-xs mt-2">Insufficient TKA</p>}
            {hasInsufficientAllowanceA && <p className="text-color-warning text-xs mt-2">⚠ Approve TKA first</p>}
          </div>

          {/* Plus Icon */}
          <div className="flex justify-center">
            <div className="bg-color-bg-elevated p-2 rounded-full border border-color-border-primary">
              <svg className="w-4 h-4 text-color-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
          </div>

          {/* Token B Input */}
          <div className="bg-color-bg-secondary p-14 rounded-xl border border-color-border-primary">
            <div className="flex justify-between items-center mb-5">
              <label className="text-sm font-medium text-color-text-secondary">TKB Amount</label>
              <span className="text-xs text-color-text-tertiary">
                Balance: {tokenBBalance ? parseFloat(formatEther(tokenBBalance)).toFixed(2) : '0.00'}
              </span>
            </div>
            <input
              type="number"
              value={tokenBAmount}
              onChange={(e) => {
                setTokenBAmount(e.target.value)
                setActiveInputField('tokenB')
                if (hasLiquidity) calculateOtherAmount('tokenB', e.target.value)
              }}
              className="w-full bg-transparent text-3xl font-bold text-color-text-primary outline-none placeholder-color-text-muted"
              placeholder="0.0"
              disabled={isLoading}
            />
            {hasInsufficientTokenB && <p className="text-color-danger text-xs mt-2">Insufficient TKB</p>}
            {hasInsufficientAllowanceB && <p className="text-color-warning text-xs mt-2">⚠ Approve TKB first</p>}
          </div>

          {hasLiquidity && (
            <div className="p-4 bg-color-bg-secondary rounded-lg border border-color-border-primary">
              <p className="text-xs text-color-text-tertiary mb-2">Current Pool Ratio</p>
              <p className="text-sm text-color-text-primary font-medium">
                1 TKA = {xReserve && yReserve ?
                  ((parseFloat(formatEther(isTokenAasX ? yReserve : xReserve)) / parseFloat(formatEther(isTokenAasX ? xReserve : yReserve)))).toFixed(6)
                  : '0.000000'} TKB
              </p>
            </div>
          )}

          <button
            onClick={handleAddLiquidity}
            disabled={
              !tokenAAmount ||
              !tokenBAmount ||
              isLoading ||
              !!hasInsufficientTokenA ||
              !!hasInsufficientTokenB ||
              !!hasInsufficientAllowanceA ||
              !!hasInsufficientAllowanceB
            }
            className="btn-success w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                {isWritePending ? 'Confirming...' : 'Adding...'}
              </span>
            ) : (
              'Add Liquidity'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* LP Amount Input */}
          <div className="bg-color-bg-secondary p-14 rounded-xl border border-color-border-primary">
            <div className="flex justify-between items-center mb-5">
              <label className="text-sm font-medium text-color-text-secondary">LP Tokens</label>
              <span className="text-xs text-color-text-tertiary">
                Balance: {lpBalance ? parseFloat(formatEther(lpBalance)).toFixed(6) : '0.000000'}
              </span>
            </div>
            <input
              type="number"
              value={lpAmount}
              onChange={(e) => setLpAmount(e.target.value)}
              className="w-full bg-transparent text-3xl font-bold text-color-text-primary outline-none placeholder-color-text-muted"
              placeholder="0.0"
              disabled={isLoading}
            />
            {hasInsufficientLP && <p className="text-color-danger text-xs mt-2">Insufficient LP tokens</p>}
          </div>

          {/* Expected Output */}
          {parseFloat(lpAmount || '0') > 0 && (
            <div className="p-4 bg-color-bg-secondary rounded-lg border border-color-border-primary">
              <p className="text-xs text-color-text-tertiary mb-3">You will receive:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-color-text-secondary">TKA:</span>
                  <span className="text-sm font-bold text-color-text-primary">{parseFloat(expectedTokenA).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-color-text-secondary">TKB:</span>
                  <span className="text-sm font-bold text-color-text-primary">{parseFloat(expectedTokenB).toFixed(6)}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleRemoveLiquidity}
            disabled={
              !lpAmount ||
              parseFloat(lpAmount) <= 0 ||
              isLoading ||
              !!hasInsufficientLP
            }
            className="btn-danger w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                {isWritePending ? 'Confirming...' : 'Removing...'}
              </span>
            ) : (
              'Remove Liquidity'
            )}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {isConfirmed && (
        <div className="status-success mt-4 animate-fadeIn">
          <p className="font-medium">
            ✓ {activeTab === 'add' ? 'Liquidity added' : 'Liquidity removed'} successfully!
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