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
}

function TokenMintCard({ tokenName, tokenAddress, symbol }: TokenMintProps) {
  const [mintAmount, setMintAmount] = useState('100')
  const { address, isConnected } = useAccount()
  
  // Contract write hook for minting
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

  // Read token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
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

  // Refresh balance when transaction is confirmed
  if (isConfirmed && balance !== undefined) {
    refetchBalance()
  }

  const isLoading = isWritePending || isConfirming
  const error = writeError || confirmError

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{tokenName}</h3>
          <p className="text-sm text-gray-600">{contractName || symbol}</p>
        </div>
        
        {balance !== undefined && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Balance</p>
            <p className="text-lg font-semibold text-gray-900">
              {parseFloat(formatEther(balance)).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mint Amount
          </label>
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="100"
            disabled={!isConnected || isLoading}
          />
        </div>

        <button
          onClick={handleMint}
          disabled={!isConnected || !mintAmount || isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isWritePending ? 'Confirming...' : 'Minting...'}
            </span>
          ) : (
            `Mint ${mintAmount} ${symbol}`
          )}
        </button>

        {/* Status Messages */}
        {isConfirmed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              ✅ Successfully minted {mintAmount} {symbol}!
            </p>
            <p className="text-green-700 text-xs mt-1">
              Your token balance has been updated.
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
                <span className="text-blue-900">{mintAmount} {symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Network:</span>
                <span className="text-blue-900">Flare Coston2</span>
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

export function TokenMinting() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600 text-center">
          Connect your wallet to mint tokens
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Minting</h2>
        <p className="text-gray-600">
          Mint MockERC20 tokens for testing the AMM
        </p>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-900 font-medium text-sm mb-2">
          📋 Wallet Notifications Info
        </h3>
        <p className="text-blue-800 text-xs">
          When minting, your wallet may show &ldquo;Simulation not supported&rdquo; and &ldquo;Unknown signature type&rdquo;. 
          This is normal for Flare Coston2 testnet and doesn&rsquo;t affect functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TokenMintCard
          tokenName="TOKEN_A"
          tokenAddress={CONTRACT_ADDRESSES.TOKEN_A}
          symbol="TKA"
        />
        <TokenMintCard
          tokenName="TOKEN_B"
          tokenAddress={CONTRACT_ADDRESSES.TOKEN_B}
          symbol="TKB"
        />
      </div>
    </div>
  )
}