'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther, maxUint256 } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { MockERC20__factory } from '../types/ethers-contracts'

interface TokenApprovalProps {
  tokenName: 'TOKEN_A' | 'TOKEN_B'
  tokenAddress: string
  symbol: string
}

function TokenApprovalCard({ tokenName, tokenAddress, symbol }: TokenApprovalProps) {
  const [approvalAmount, setApprovalAmount] = useState('1000')
  const [useMaxApproval, setUseMaxApproval] = useState(false)
  const { address, isConnected } = useAccount()
  
  // Contract write hook for approval
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

  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read token balance
  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Read token name from contract
  const { data: contractName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'name',
  })

  const handleApprove = async () => {
    if (!isConnected) return

    try {
      const approveAmount = useMaxApproval 
        ? maxUint256 
        : parseEther(approvalAmount || '0')

      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: MockERC20__factory.abi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.MINIAMM as `0x${string}`, approveAmount],
      })
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  // Refresh allowance when transaction is confirmed
  if (isConfirmed && allowance !== undefined) {
    refetchAllowance()
  }

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError

  // Check if user has sufficient allowance (more than 0)
  const hasAllowance = allowance && allowance > BigInt(0)
  const allowanceAmount = allowance ? formatEther(allowance) : '0'

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{tokenName} Approval</h3>
          <p className="text-sm text-gray-600">{contractName || symbol}</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Allowance</p>
          <p className="text-lg font-semibold text-gray-900">
            {parseFloat(allowanceAmount).toFixed(2)}
          </p>
          {balance && (
            <p className="text-xs text-gray-500">
              Balance: {parseFloat(formatEther(balance)).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-4">
        {hasAllowance ? (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex-shrink-0">
              <span className="text-green-600">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-green-800 text-sm font-medium">
                MiniAMM is approved to spend your {symbol}
              </p>
              <p className="text-green-700 text-xs">
                You can now swap and provide liquidity with this token
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex-shrink-0">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-yellow-800 text-sm font-medium">
                Approval required
              </p>
              <p className="text-yellow-700 text-xs">
                Approve MiniAMM to spend your {symbol} before swapping or adding liquidity
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Max Approval Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id={`max-approval-${tokenName}`}
            checked={useMaxApproval}
            onChange={(e) => setUseMaxApproval(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={!isConnected || isLoading}
          />
          <label htmlFor={`max-approval-${tokenName}`} className="text-sm text-gray-700">
            Maximum approval (unlimited spending)
          </label>
        </div>

        {!useMaxApproval && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Amount
            </label>
            <input
              type="number"
              value={approvalAmount}
              onChange={(e) => setApprovalAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000"
              disabled={!isConnected || isLoading}
            />
          </div>
        )}

        <button
          onClick={handleApprove}
          disabled={!isConnected || (!approvalAmount && !useMaxApproval) || isLoading}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isWritePending ? 'Confirming...' : 'Approving...'}
            </span>
          ) : (
            `Approve ${useMaxApproval ? 'Unlimited' : approvalAmount} ${symbol}`
          )}
        </button>

        {/* Status Messages */}
        {isConfirmed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              ✅ Successfully approved {useMaxApproval ? 'unlimited' : approvalAmount} {symbol}!
            </p>
            <p className="text-green-700 text-xs mt-1">
              MiniAMM can now spend your tokens for swaps and liquidity.
            </p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              ❌ Error: {error.message}
            </p>
          </div>
        )}

        {hash && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
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
                <span className="text-blue-700">Amount:</span>
                <span className="text-blue-900">
                  {useMaxApproval ? 'Unlimited' : `${approvalAmount} ${symbol}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Spender:</span>
                <span className="text-blue-900 font-mono text-xs">MiniAMM</span>
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

export function TokenApproval() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600 text-center">
          Connect your wallet to manage token approvals
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Approvals</h2>
        <p className="text-gray-600">
          Approve MiniAMM to spend your tokens for swapping and liquidity provision
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TokenApprovalCard
          tokenName="TOKEN_A"
          tokenAddress={CONTRACT_ADDRESSES.TOKEN_A}
          symbol="TKA"
        />
        <TokenApprovalCard
          tokenName="TOKEN_B"
          tokenAddress={CONTRACT_ADDRESSES.TOKEN_B}
          symbol="TKB"
        />
      </div>
    </div>
  )
}