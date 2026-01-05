'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { MockERC20__factory } from '../types/ethers-contracts'

interface TokenMintProps {
  tokenName: 'TOKEN_A' | 'TOKEN_B'
  tokenAddress: string
  symbol: string
  color: 'blue' | 'purple'
}

function TokenMintCard({ tokenName, tokenAddress, symbol, color }: TokenMintProps) {
  const [mintAmount, setMintAmount] = useState('100')
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

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected,
    },
  })

  const handleMint = async () => {
    if (!isConnected || !mintAmount) return

    try {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: MockERC20__factory.abi,
        functionName: 'freeMintToSender',
        args: [parseEther(mintAmount)],
      })
    } catch (error) {
      console.error('Minting error:', error)
    }
  }

  if (isConfirmed && balance !== undefined) {
    refetchBalance()
  }

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError

  const colorClasses = color === 'blue'
    ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40'
    : 'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40'

  const iconBg = color === 'blue' ? 'bg-blue-500/20' : 'bg-purple-500/20'
  const iconColor = color === 'blue' ? 'text-blue-400' : 'text-purple-400'

  return (
    <div className={`glass-card p-6 rounded-xl bg-gradient-to-br ${colorClasses} border transition-all`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
            <span className={`${iconColor} font-bold`}>{symbol === 'TKA' ? 'A' : 'B'}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-color-text-primary">{symbol}</h3>
            <p className="text-xs text-color-text-tertiary">{tokenName}</p>
          </div>
        </div>

        {balance !== undefined && (
          <div className="text-right">
            <p className="text-xs text-color-text-tertiary mb-1">Balance</p>
            <p className="text-xl font-bold text-color-text-primary">
              {parseFloat(formatEther(balance)).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-color-text-secondary mb-2">
            Mint Amount
          </label>
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="input-primary w-full text-lg"
            placeholder="100"
            disabled={!isConnected || isLoading}
          />
        </div>

        <button
          onClick={handleMint}
          disabled={!isConnected || !mintAmount || isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner"></span>
              {isWritePending ? 'Confirming...' : 'Minting...'}
            </span>
          ) : (
            `Mint ${mintAmount} ${symbol}`
          )}
        </button>

        {isConfirmed && (
          <div className="status-success animate-fadeIn">
            <p className="font-medium">✓ Minted {mintAmount} {symbol}</p>
          </div>
        )}

        {error && (
          <div className="status-danger animate-fadeIn">
            <p className="text-xs">Error: {error.message}</p>
          </div>
        )}

        {hash && !isConfirmed && (
          <div className="status-info animate-fadeIn">
            <p className="text-xs font-medium">Transaction submitted...</p>
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
    </div>
  )
}

export function TokenMinting() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <p className="text-color-text-tertiary text-center">
          Connect your wallet to mint test tokens
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TokenMintCard
        tokenName="TOKEN_A"
        tokenAddress={CONTRACT_ADDRESSES.TOKEN_A}
        symbol="TKA"
        color="blue"
      />
      <TokenMintCard
        tokenName="TOKEN_B"
        tokenAddress={CONTRACT_ADDRESSES.TOKEN_B}
        symbol="TKB"
        color="purple"
      />
    </div>
  )
}