import { ethers } from 'ethers'
import { MiniAMM__factory, MockERC20__factory } from '../types/ethers-contracts'
import { CONTRACT_ADDRESSES } from './chains'

// Contract factory functions for TypeChain-generated contracts
export const getTokenAContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return MockERC20__factory.connect(CONTRACT_ADDRESSES.TOKEN_A, signerOrProvider)
}

export const getTokenBContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return MockERC20__factory.connect(CONTRACT_ADDRESSES.TOKEN_B, signerOrProvider)
}

export const getMiniAMMContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return MiniAMM__factory.connect(CONTRACT_ADDRESSES.MINIAMM, signerOrProvider)
}

// Export contract addresses for convenience
export { CONTRACT_ADDRESSES }