'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  
  // Track if we've processed the current transaction
  const processedTxRef = useRef<string | null>(null)
  
  // Track the last successful transaction type
  const [lastSuccessfulTx, setLastSuccessfulTx] = useState<{ type: 'add' | 'remove', hash: string } | null>(null)
  
  // Control visibility of transaction submitted message
  const [showTransactionMessage, setShowTransactionMessage] = useState(true)
  
  const { address, isConnected } = useAccount()
  
  // Contract write hook
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
  const { data: tokenABalance, refetch: refetchTokenABalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_A as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  const { data: tokenBBalance, refetch: refetchTokenBBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.TOKEN_B as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read LP token balance
  const { data: lpBalance, refetch: refetchLPBalance } = useReadContract({
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

  // Calculate the other token amount based on pool ratio
  const calculateOtherAmount = useCallback((inputField: 'tokenA' | 'tokenB', amount: string) => {
    if (!xReserve || !yReserve || !amount || parseFloat(amount) <= 0) {
      // Clear both fields if amount is invalid
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
          // TOKEN_A is X, calculate Y amount needed
          const xAmount = parseEther(amount)
          const yAmount = (xAmount * yReserve) / xReserve
          setTokenBAmount(formatEther(yAmount))
        } else {
          // TOKEN_A is Y, calculate X amount needed
          const yAmount = parseEther(amount)
          const xAmount = (yAmount * xReserve) / yReserve
          setTokenBAmount(formatEther(xAmount))
        }
      } else {
        if (isTokenAasX) {
          // TOKEN_B is Y, calculate X amount needed
          const yAmount = parseEther(amount)
          const xAmount = (yAmount * xReserve) / yReserve
          setTokenAAmount(formatEther(xAmount))
        } else {
          // TOKEN_B is X, calculate Y amount needed
          const xAmount = parseEther(amount)
          const yAmount = (xAmount * yReserve) / xReserve
          setTokenAAmount(formatEther(yAmount))
        }
      }
    } catch (error) {
      console.error('Error calculating other amount:', error)
    }
  }, [xReserve, yReserve, isTokenAasX])

  // Calculate current pool ratio with memoization
  const poolRatio = useMemo(() => {
    if (!xReserve || !yReserve || xReserve === BigInt(0) || yReserve === BigInt(0)) {
      return { tokenAPerTokenB: '0', tokenBPerTokenA: '0' }
    }

    if (isTokenAasX) {
      // TOKEN_A is X, TOKEN_B is Y
      const tokenBPerTokenA = parseFloat(formatEther(yReserve)) / parseFloat(formatEther(xReserve))
      const tokenAPerTokenB = parseFloat(formatEther(xReserve)) / parseFloat(formatEther(yReserve))
      return { 
        tokenAPerTokenB: tokenAPerTokenB.toFixed(6),
        tokenBPerTokenA: tokenBPerTokenA.toFixed(6)
      }
    } else {
      // TOKEN_A is Y, TOKEN_B is X
      const tokenBPerTokenA = parseFloat(formatEther(xReserve)) / parseFloat(formatEther(yReserve))
      const tokenAPerTokenB = parseFloat(formatEther(yReserve)) / parseFloat(formatEther(xReserve))
      return { 
        tokenAPerTokenB: tokenAPerTokenB.toFixed(6),
        tokenBPerTokenA: tokenBPerTokenA.toFixed(6)
      }
    }
  }, [xReserve, yReserve, isTokenAasX])

  // Calculate expected tokens from LP removal
  useEffect(() => {
    if (!lpAmount || !lpTotalSupply || !xReserve || !yReserve || parseFloat(lpAmount) <= 0) {
      setExpectedTokenA('0')
      setExpectedTokenB('0')
      return
    }

    try {
      const lpAmountBig = parseEther(lpAmount)
      const expectedXAmount = (lpAmountBig * xReserve) / lpTotalSupply
      const expectedYAmount = (lpAmountBig * yReserve) / lpTotalSupply

      if (isTokenAasX) {
        setExpectedTokenA(formatEther(expectedXAmount))
        setExpectedTokenB(formatEther(expectedYAmount))
      } else {
        setExpectedTokenA(formatEther(expectedYAmount))
        setExpectedTokenB(formatEther(expectedXAmount))
      }
    } catch (error) {
      console.error('Error calculating expected amounts:', error)
      setExpectedTokenA('0')
      setExpectedTokenB('0')
    }
  }, [lpAmount, lpTotalSupply, xReserve, yReserve, isTokenAasX])

  const handleAddLiquidity = async () => {
    if (!isConnected || !tokenAAmount || !tokenBAmount) return

    try {
      const tokenAAmountBig = parseEther(tokenAAmount)
      const tokenBAmountBig = parseEther(tokenBAmount)

      let xAmountIn, yAmountIn

      if (isTokenAasX) {
        xAmountIn = tokenAAmountBig
        yAmountIn = tokenBAmountBig
      } else {
        xAmountIn = tokenBAmountBig
        yAmountIn = tokenAAmountBig
      }

      writeContract({
        address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
        abi: MiniAMM__factory.abi,
        functionName: 'addLiquidity',
        args: [xAmountIn, yAmountIn],
      })
    } catch (error) {
      console.error('Add liquidity error:', error)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !lpAmount || parseFloat(lpAmount) <= 0) return

    try {
      // Hide the transaction message when button is clicked
      setShowTransactionMessage(false)
      
      const lpAmountBig = parseEther(lpAmount)

      writeContract({
        address: CONTRACT_ADDRESSES.MINIAMM as `0x${string}`,
        abi: MiniAMM__factory.abi,
        functionName: 'removeLiquidity',
        args: [lpAmountBig],
      })
    } catch (error) {
      console.error('Remove liquidity error:', error)
      // Show message again if there's an error
      setShowTransactionMessage(true)
    }
  }

  // Show transaction message when new hash is generated
  useEffect(() => {
    if (hash) {
      setShowTransactionMessage(true)
    }
  }, [hash])

  // Refresh balances when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash && processedTxRef.current !== hash) {
      processedTxRef.current = hash
      
      // Track which operation was successful
      setLastSuccessfulTx({ type: activeTab, hash })
      
      refetchXReserve()
      refetchYReserve() 
      refetchTokenABalance()
      refetchTokenBBalance()
      refetchLPBalance()
      
      // Clear form after successful transaction
      if (activeTab === 'add') {
        setTokenAAmount('')
        setTokenBAmount('')
        setActiveInputField('tokenA')
      } else {
        setLpAmount('')
      }
    }
  }, [isConfirmed, hash, activeTab, refetchXReserve, refetchYReserve, refetchTokenABalance, refetchTokenBBalance, refetchLPBalance])

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError

  // Check if pool exists
  const poolExists = !!(xReserve && yReserve && xReserve > BigInt(0) && yReserve > BigInt(0))
  const isFirstLP = !poolExists

  // Validation for add liquidity
  const tokenAAmountBig = tokenAAmount ? parseEther(tokenAAmount) : BigInt(0)
  const tokenBAmountBig = tokenBAmount ? parseEther(tokenBAmount) : BigInt(0)
  const hasInsufficientTokenABalance = !!(tokenABalance && tokenAAmountBig > tokenABalance)
  const hasInsufficientTokenBBalance = !!(tokenBBalance && tokenBAmountBig > tokenBBalance)
  const hasInsufficientTokenAAllowance = !!(tokenAAllowance && tokenAAmountBig > tokenAAllowance)
  const hasInsufficientTokenBAllowance = !!(tokenBAllowance && tokenBAmountBig > tokenBAllowance)

  // Validation for remove liquidity
  const lpAmountBig = lpAmount ? parseEther(lpAmount) : BigInt(0)
  const hasInsufficientLPBalance = !!(lpBalance && lpAmountBig > lpBalance)

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600 text-center">
          Connect your wallet to manage liquidity
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Liquidity Management</h2>
        <p className="text-gray-600">
          Add or remove liquidity to earn fees from trades
        </p>
      </div>


      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setActiveTab('add')
              setLastSuccessfulTx(null)
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'add'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Add Liquidity
          </button>
          <button
            onClick={() => {
              setActiveTab('remove')
              setLastSuccessfulTx(null)
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === 'remove'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Remove Liquidity
          </button>
        </div>

        {activeTab === 'add' ? (
          // Add Liquidity Tab
          <div className="space-y-6">
            {isFirstLP && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm font-medium">
                  🎉 First Liquidity Provider
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  You&rsquo;ll be the first to add liquidity! You can input any amounts for both tokens to set the initial price ratio.
                </p>
              </div>
            )}

            {poolExists && (
              <div className="space-y-4 mb-6">
                {/* Current Pool Ratio */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-blue-900 font-medium text-sm mb-2">Current Pool Ratio</h4>
                  <div className="space-y-1 text-blue-800 text-xs">
                    <div>1 TKA = {poolRatio.tokenBPerTokenA} TKB</div>
                    <div>1 TKB = {poolRatio.tokenAPerTokenB} TKA</div>
                  </div>
                </div>

                {/* Input Field Selector */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Choose which token amount to input:
                  </label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setActiveInputField('tokenA')
                        setTokenAAmount('')
                        setTokenBAmount('')
                        setLastSuccessfulTx(null)
                      }}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeInputField === 'tokenA'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Input TKA Amount
                    </button>
                    <button
                      onClick={() => {
                        setActiveInputField('tokenB')
                        setTokenAAmount('')
                        setTokenBAmount('')
                        setLastSuccessfulTx(null)
                      }}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeInputField === 'tokenB'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Input TKB Amount
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* TOKEN_A Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    TOKEN_A Amount (TKA)
                  </label>
                  <span className="text-xs text-gray-500">
                    Balance: {tokenABalance ? parseFloat(formatEther(tokenABalance)).toFixed(2) : '0.00'}
                  </span>
                </div>
                <input
                  type="number"
                  value={tokenAAmount}
                  onChange={(e) => {
                    setTokenAAmount(e.target.value)
                    setLastSuccessfulTx(null)
                    if (poolExists) {
                      calculateOtherAmount('tokenA', e.target.value)
                    }
                  }}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    poolExists && activeInputField !== 'tokenA' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={poolExists && activeInputField !== 'tokenA' ? 'Auto-calculated' : '0.00'}
                  disabled={isLoading || (poolExists && activeInputField !== 'tokenA')}
                  readOnly={poolExists && activeInputField !== 'tokenA'}
                />
                {hasInsufficientTokenABalance && (
                  <p className="text-red-600 text-xs mt-1">Insufficient TOKEN_A balance</p>
                )}
                {hasInsufficientTokenAAllowance && (
                  <p className="text-yellow-600 text-xs mt-1">⚠️ Insufficient TOKEN_A allowance</p>
                )}
              </div>

              {/* TOKEN_B Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    TOKEN_B Amount (TKB)
                  </label>
                  <span className="text-xs text-gray-500">
                    Balance: {tokenBBalance ? parseFloat(formatEther(tokenBBalance)).toFixed(2) : '0.00'}
                  </span>
                </div>
                <input
                  type="number"
                  value={tokenBAmount}
                  onChange={(e) => {
                    setTokenBAmount(e.target.value)
                    setLastSuccessfulTx(null)
                    if (poolExists) {
                      calculateOtherAmount('tokenB', e.target.value)
                    }
                  }}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    poolExists && activeInputField !== 'tokenB' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={poolExists && activeInputField !== 'tokenB' ? 'Auto-calculated' : '0.00'}
                  disabled={isLoading || (poolExists && activeInputField !== 'tokenB')}
                  readOnly={poolExists && activeInputField !== 'tokenB'}
                />
                {hasInsufficientTokenBBalance && (
                  <p className="text-red-600 text-xs mt-1">Insufficient TOKEN_B balance</p>
                )}
                {hasInsufficientTokenBAllowance && (
                  <p className="text-yellow-600 text-xs mt-1">⚠️ Insufficient TOKEN_B allowance</p>
                )}
              </div>
            </div>

            {/* Pool Share Preview */}
            {poolExists && tokenAAmount && tokenBAmount && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-gray-800 font-medium text-sm mb-2">Transaction Preview</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>You&rsquo;re adding:</span>
                    <span>{parseFloat(tokenAAmount).toFixed(4)} TKA + {parseFloat(tokenBAmount).toFixed(4)} TKB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Pool Share:</span>
                    <span>
                      {lpTotalSupply && tokenAAmount ? 
                        `~${((parseFloat(tokenAAmount) / (parseFloat(formatEther(isTokenAasX ? xReserve : yReserve)) + parseFloat(tokenAAmount))) * 100).toFixed(2)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAddLiquidity}
              disabled={
                !isConnected || 
                !tokenAAmount || 
                !tokenBAmount ||
                parseFloat(tokenAAmount) <= 0 ||
                parseFloat(tokenBAmount) <= 0 ||
                isLoading ||
                hasInsufficientTokenABalance ||
                hasInsufficientTokenBBalance ||
                hasInsufficientTokenAAllowance ||
                hasInsufficientTokenBAllowance
              }
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isWritePending ? 'Confirming...' : 'Adding Liquidity...'}
                </span>
              ) : hasInsufficientTokenABalance || hasInsufficientTokenBBalance ? (
                'Insufficient Balance'
              ) : hasInsufficientTokenAAllowance || hasInsufficientTokenBAllowance ? (
                'Approve Tokens First'
              ) : (
                'Add Liquidity'
              )}
            </button>
          </div>
        ) : (
          // Remove Liquidity Tab
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    LP Tokens to Remove
                  </label>
                  <span className="text-xs text-gray-500">
                    Balance: {lpBalance ? parseFloat(formatEther(lpBalance)).toFixed(6) : '0.000000'}
                  </span>
                </div>
                <input
                  type="number"
                  value={lpAmount}
                  onChange={(e) => {
                    setLpAmount(e.target.value)
                    setLastSuccessfulTx(null)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.000000"
                  disabled={isLoading}
                />
                {hasInsufficientLPBalance && (
                  <p className="text-red-600 text-xs mt-1">Insufficient LP token balance</p>
                )}
              </div>

              {/* Expected Output */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-3">You will receive:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">TOKEN_A (TKA):</span>
                    <span className="font-medium">{parseFloat(expectedTokenA).toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">TOKEN_B (TKB):</span>
                    <span className="font-medium">{parseFloat(expectedTokenB).toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pool Share Info */}
            {lpBalance && lpTotalSupply && lpTotalSupply > BigInt(0) && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Current Pool Share:</span>
                    <span>{((Number(lpBalance) / Number(lpTotalSupply)) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Removal:</span>
                    <span>
                      {lpAmount ? 
                        `${(((Number(lpBalance) - parseFloat(lpAmount)) / Number(lpTotalSupply)) * 100).toFixed(2)}%`
                        : `${((Number(lpBalance) / Number(lpTotalSupply)) * 100).toFixed(2)}%`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleRemoveLiquidity}
              disabled={
                !isConnected || 
                !lpAmount ||
                parseFloat(lpAmount) <= 0 ||
                isLoading ||
                hasInsufficientLPBalance ||
                !lpBalance ||
                lpBalance === BigInt(0)
              }
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isWritePending ? 'Confirming...' : 'Removing Liquidity...'}
                </span>
              ) : hasInsufficientLPBalance ? (
                'Insufficient LP Balance'
              ) : !lpBalance || lpBalance === BigInt(0) ? (
                'No LP Tokens'
              ) : (
                'Remove Liquidity'
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {lastSuccessfulTx && lastSuccessfulTx.type === activeTab && lastSuccessfulTx.hash === hash && isConfirmed && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              ✅ {activeTab === 'add' ? 'Liquidity added' : 'Liquidity removed'} successfully!
            </p>
            <p className="text-green-700 text-xs mt-1">
              {activeTab === 'add' 
                ? `Added ${tokenAAmount} TKA and ${tokenBAmount} TKB to the pool`
                : `Removed ${lpAmount} LP tokens from the pool`
              }
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              ❌ Error: {error.message}
            </p>
          </div>
        )}

        {hash && showTransactionMessage && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-xl shadow-lg">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🚀</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-1">
                Transaction Submitted!
              </h3>
              <p className="text-blue-700 font-medium">
                Your {activeTab === 'add' ? 'liquidity addition' : 'liquidity removal'} is being processed
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Transaction Hash:</span>
                <span className="font-mono text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded">
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Operation:</span>
                <span className="text-blue-900 font-semibold">
                  {activeTab === 'add' ? '➕ Add Liquidity' : '➖ Remove Liquidity'}
                </span>
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