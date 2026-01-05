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
  color: 'blue' | 'purple'
}

function TokenApprovalCard({ tokenName, tokenAddress, symbol, color }: TokenApprovalProps) {
  const [approvalAmount, setApprovalAmount] = useState('1000')
  const [useMaxApproval, setUseMaxApproval] = useState(false)
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

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESSES.MINIAMM as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
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

  if (isConfirmed && allowance !== undefined) {
    refetchAllowance()
  }

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError
  const hasAllowance = allowance && allowance > BigInt(0)
  const allowanceAmount = allowance ? formatEther(allowance) : '0'

  const colorClasses = color === 'blue'
    ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20'
    : 'from-purple-500/10 to-purple-600/5 border-purple-500/20'

  return (
    <div className={`glass-card p-6 rounded-xl bg-gradient-to-br ${colorClasses} border`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-color-text-primary">{symbol} Approval</h3>
          <p className="text-xs text-color-text-tertiary">{tokenName}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-color-text-tertiary mb-1">Allowance</p>
          <p className="text-xl font-bold text-color-text-primary">
            {parseFloat(allowanceAmount).toFixed(2)}
          </p>
        </div>
      </div>

      {hasAllowance ? (
        <div className="status-success mb-4">
          <p className="font-medium">✓ Approved</p>
          <p className="text-xs mt-1">MiniAMM can spend your {symbol}</p>
        </div>
      ) : (
        <div className="status-warning mb-4">
          <p className="font-medium">⚠ Approval Required</p>
          <p className="text-xs mt-1">Approve before swapping or adding liquidity</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`max-approval-${tokenName}`}
            checked={useMaxApproval}
            onChange={(e) => setUseMaxApproval(e.target.checked)}
            className="w-4 h-4 accent-color-primary"
            disabled={!isConnected || isLoading}
          />
          <label htmlFor={`max-approval-${tokenName}`} className="text-sm text-color-text-secondary">
            Unlimited approval
          </label>
        </div>

        {!useMaxApproval && (
          <div>
            <label className="block text-sm font-medium text-color-text-secondary mb-2">
              Amount
            </label>
            <input
              type="number"
              value={approvalAmount}
              onChange={(e) => setApprovalAmount(e.target.value)}
              className="input-primary w-full"
              placeholder="1000"
              disabled={!isConnected || isLoading}
            />
          </div>
        )}

        <button
          onClick={handleApprove}
          disabled={!isConnected || (!approvalAmount && !useMaxApproval) || isLoading}
          className="btn-success w-full"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner"></span>
              {isWritePending ? 'Confirming...' : 'Approving...'}
            </span>
          ) : (
            `Approve ${useMaxApproval ? 'Unlimited' : approvalAmount} ${symbol}`
          )}
        </button>

        {isConfirmed && (
          <div className="status-success animate-fadeIn">
            <p className="font-medium">✓ Approved {useMaxApproval ? 'unlimited' : approvalAmount} {symbol}</p>
          </div>
        )}

        {error && (
          <div className="status-danger animate-fadeIn">
            <p className="text-xs">Error: {error.message}</p>
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
      <div className="glass-card p-6 rounded-xl">
        <p className="text-color-text-tertiary text-center">
          Connect your wallet to manage approvals
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TokenApprovalCard
        tokenName="TOKEN_A"
        tokenAddress={CONTRACT_ADDRESSES.TOKEN_A}
        symbol="TKA"
        color="blue"
      />
      <TokenApprovalCard
        tokenName="TOKEN_B"
        tokenAddress={CONTRACT_ADDRESSES.TOKEN_B}
        symbol="TKB"
        color="purple"
      />
    </div>
  )
}