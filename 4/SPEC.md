# MiniAMM UI Specification

## Project Overview
Create a user interface for MiniAMM, a simple automated market maker (AMM) decentralized exchange. This project will allow users to connect their wallets, manage tokens, and perform AMM operations like swapping and liquidity provision.

## Network & Contract Configuration
- **Network**: Flare Coston2 Testnet
- **RPC URL**: Use appropriate RPC for Flare Coston2 testnet
- **Contracts**:
  - TOKEN_A: `0x39825E5C2f771cE43d56C3f7890E275673e7D8Fc` (MockERC20)
  - TOKEN_B: `0xFE603Cc80cB91D89437DF7d6cb4b3494d9AbE118` (MockERC20)
  - MINIAMM: `0xD37E910CB75b9c354120102D93d62a8697eE1f12` (MiniAMM contract)

## Technology Stack
### Blockchain Interaction (Required)
- **Ethers.js@6**: Primary blockchain interaction library
- **RainbowKit**: Wallet connection (includes wagmi transitively)
- **TypeChain**: Type-safe contract interaction using generated types from `src/types/ethers-contracts`

### Framework
- **Next.js**: Already configured in the project

## Core Features Checklist

### [X] 1. Wallet Management ✅ COMPLETED
- [X] ~~Connect wallet functionality using RainbowKit~~
- [X] ~~Disconnect wallet functionality~~
- [X] ~~Display connected wallet address~~
- [X] ~~Handle wallet connection state~~
- [X] ~~Network validation (Flare Coston2)~~
- [X] ~~Balance display (C2FLR)~~
- [X] ~~Enhanced wallet status component~~

### [X] 2. Token Operations ✅ MINTING COMPLETED
- [X] **~~Mint MockERC20 tokens~~**
  - [X] ~~Mint TOKEN_A~~
  - [X] ~~Mint TOKEN_B~~
  - [X] ~~UI for minting interface~~
  - [X] ~~Transaction feedback (loading, success, error)~~
  - [X] ~~Real-time balance display~~
  - [X] ~~Contract name and address display~~

- [X] **~~Approve Token Spending~~** ✅ COMPLETED
  - [X] ~~Approve MiniAMM to spend TOKEN_A~~
  - [X] ~~Approve MiniAMM to spend TOKEN_B~~
  - [X] ~~Check current allowances~~
  - [X] ~~UI for approval interface~~

### [X] 3. ~~Token Display & Balances~~ ✅ COMPLETED
- [X] **~~Wallet Balances~~**
  - [X] ~~Show TOKEN_A balance in connected wallet~~
  - [X] ~~Show TOKEN_B balance in connected wallet~~
  - [X] ~~Auto-refresh balances after transactions~~

- [X] **~~MiniAMM Contract Balances~~**
  - [X] ~~Show TOKEN_A reserves in MiniAMM contract~~
  - [X] ~~Show TOKEN_B reserves in MiniAMM contract~~
  - [X] ~~Display pool information~~

### [X] 4. ~~Swap Interface~~ ✅ COMPLETED
- [X] **~~Token Selection~~**
  - [X] ~~Choose which token to sell (TOKEN_A or TOKEN_B)~~
  - [X] ~~Input field for amount to sell~~
  - [X] ~~Display which token will be received~~

- [X] **~~Swap Calculation~~**
  - [X] ~~Implement constant-product formula (x * y = k)~~
  - [X] ~~Show calculated receive amount based on input~~
  - [X] ~~Real-time calculation updates~~

- [X] **~~Swap Execution~~**
  - [X] ~~Execute swap button~~
  - [X] ~~Button state management (disabled during transaction)~~
  - [X] ~~Loading state during transaction confirmation~~
  - [X] ~~Refresh all balances after successful swap~~
  - [X] ~~Error handling and user feedback~~

### [X] 5. ~~Liquidity Management~~ ✅ COMPLETED
- [X] **~~Add Liquidity~~**
  - [X] ~~Interface to input both TOKEN_A and TOKEN_B amounts~~
  - [X] ~~Calculate proper ratios based on current pool state~~
  - [X] ~~Execute addLiquidity function~~
  - [X] ~~Show LP token balance after addition~~

- [X] **~~Remove Liquidity~~**
  - [X] ~~Interface to specify LP tokens to burn~~
  - [X] ~~Show expected TOKEN_A and TOKEN_B amounts to receive~~
  - [X] ~~Execute removeLiquidity function~~
  - [X] ~~Update all balances after removal~~

## Technical Implementation Requirements

### [X] 6. ~~Contract Integration~~ ✅ COMPLETED
- [X] ~~Use only TypeChain-generated types from `src/types/ethers-contracts`~~
- [X] ~~Import and use:~~
  - [X] ~~`MiniAMM` contract type~~
  - [X] ~~`MockERC20` contract type~~
  - [X] ~~Proper factory imports for contract instantiation~~
- [X] ~~No direct contract ABI usage - only TypeChain types~~

### [X] 7. ~~State Management & UX~~ ✅ COMPLETED
- [X] **~~Loading States~~**
  - [X] ~~Transaction pending indicators~~
  - [X] ~~Button disabled states during transactions~~
  - [X] ~~Loading spinners or progress indicators~~

- [X] **~~Error Handling~~**
  - [X] ~~Network errors~~
  - [X] ~~Transaction failures~~
  - [X] ~~Insufficient balance errors~~
  - [X] ~~User rejection errors~~

- [X] **~~Data Refresh~~**
  - [X] ~~Auto-refresh balances after each transaction~~
  - [X] ~~Update pool reserves after swaps/liquidity changes~~
  - [X] ~~Refresh allowances after approvals~~

### [X] 8. ~~UI/UX Components~~ ✅ COMPLETED
- [X] ~~Responsive design for mobile and desktop~~
- [X] ~~Clear visual feedback for transaction states~~
- [X] ~~Intuitive navigation between different functions~~
- [X] ~~Proper form validation and user input handling~~

## Development Phases
1. **Setup & Configuration**: ✅ COMPLETED - RainbowKit integration, network configuration
2. **Wallet Connection**: ✅ COMPLETED - Basic connect/disconnect functionality  
3. **Token Operations**: ✅ COMPLETED - Token minting and approval functions implemented
4. **Balance Display**: ✅ COMPLETED - Show wallet and contract balances
5. **Swap Interface**: ✅ COMPLETED - Full swap functionality with AMM calculations
6. **Liquidity Management**: ✅ COMPLETED - Add/remove liquidity features
7. **Polish & Testing**: ✅ COMPLETED - Error handling, loading states, UX improvements

## Initial Setup Status ✅
- [x] Dependencies installed (RainbowKit, wagmi, viem, ethers@6)
- [x] Flare Coston2 network configuration created
- [x] Contract addresses configured
- [x] TypeChain integration setup
- [x] RainbowKit providers configured
- [x] Basic UI layout with wallet connection
- [x] Project ready for feature development

## Current Progress Summary 📊
### ✅ COMPLETED FEATURES:
1. **Wallet Management** - Full wallet connection, status display, network validation
2. **Token Operations** - Complete minting and approval interface for TOKEN_A and TOKEN_B
3. **Balance Display** - Real-time wallet and pool balance monitoring with auto-refresh
4. **Swap Interface** - Full AMM swap functionality with constant-product formula (x*y=k)

## Notes
- All contract interactions must use TypeChain-generated types
- Focus on user experience with clear feedback and loading states
- Ensure proper error handling for all blockchain interactions
- Test thoroughly on Flare Coston2 testnet before considering complete---

## UI Refinement Requirements (2025-11-25)

### Status Tracking
- [x] 1. ~~Change top-left title to "Hell Month" and move "Automated Market Maker" subtitle to center below "MiniAMM"~~ ✅
- [x] 2. ~~Move all elements below the MiniAMM title to the center~~ ✅
- [x] 3. ~~Enlarge the title of each tab and give bigger margins~~ ✅
- [x] 4. ~~"Wallet Connected" box should only appear in Portfolio tab~~ ✅
- [x] 5. ~~Change all fonts to Inter or similar contemporary sans-serif typeface~~ ✅
- [x] 6. ~~Give more margin for all function elements~~ ✅
- [ ] 7. Reduce unused space at bottom - enlarge function elements and reduce empty space
- [x] 8. ~~Change color of "TKA → TKB" text in Token Swap to white for visibility~~ ✅
- [x] 9. ~~Adjust text padding in rounded boxes (Token Swap, Manage Liquidity, Your Wallet) - move text away from borders~~ ✅

### Progress Summary
**Completed (8/9):**
- ✅ Requirement 1: Title changed to "Hell Month" in top-left, subtitle "Automated Market Maker" centered
- ✅ Requirement 2: All content below MiniAMM properly centered using flex layout
- ✅ Requirement 3: Tab titles enlarged (text-base), padding increased (py-4 px-8), bigger gaps
- ✅ Requirement 4: WalletStatus component conditionally displayed only in Portfolio tab
- ✅ Requirement 5: Inter font applied globally throughout application
- ✅ Requirement 6: Increased margins throughout (mb-10 for tabs, mb-8 for wallet status, space-y-10 for sections, text-2xl mb-6 for section titles)
- ✅ Requirement 8: Swap arrow color changed to text-color-text-primary for better visibility
- ✅ Requirement 9: Padding increased in all rounded input/display boxes (p-6→p-8 for main boxes, p-4→p-6 for info boxes)

**Remaining (1/9):**
- ⏸️ Requirement 7 - Reduce bottom empty space

### Notes
- Requirements being implemented incrementally with user review between each step
- **Session paused on 2025-11-25 at 05:11** - Continue from Requirement #4
- All changes properly centered with flex justify-center layout


