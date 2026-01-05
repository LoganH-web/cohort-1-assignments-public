# HellMonth Cohort 1 - DApp Development Course

- [1a](./1a)
- [1b](./1b)
- [2](./2)
- [4](./4)

## About HellMonth

**HellMonth** is an intensive month-long blockchain development course hosted by **Joel**, a prominent blockchain community leader in South Korea. Joel runs a thriving blockchain education platform with over 400+ active users, where he shares knowledge and fosters collaboration among blockchain enthusiasts. 

This course was designed to take participants from blockchain fundamentals to building production-ready decentralized applications in just one month. Through hands-on assignments with strict deadlines, students learned to build a complete DApp ecosystem including smart contracts, local development environments, frontend interfaces, and subgraph indexers.

## Course Timeline

**Duration:** August 26 - September 30, 2024 (5 weeks)

### Week 1
- **Day 1 (Aug 26):** Introduction to Constant Product Automated Market Maker (CPAMM)
- **Day 2 (Aug 29):** End-to-end local development environment setup

### Week 2
- **Day 3 (Sept 2):** Additional features for CPAMM
- **Day 4 (Sept 5):** Uniswap V2 core and router contracts

### Week 3
- **Day 5 (Sept 9):** Frontend development for CPAMM
- **Day 6 (Sept 12):** CPAMM Subgraph implementation

### Week 4
- **Day 7 (Sept 16):** Deploying Uniswap V2 end-to-end
- **Day 8 (Sept 20):** Recap and final integration

## Project Overview

This repository contains a full-stack decentralized exchange (DEX) implementation inspired by Uniswap V2, featuring:

- **Smart Contracts:** Solidity-based AMM contracts with liquidity pools, LP tokens, and swap functionality
- **Local Development Environment:** Complete Docker-based blockchain infrastructure
- **Frontend Interface:** Modern Next.js web application with wallet integration
- **Subgraph:** The Graph protocol integration for blockchain data indexing

## Assignments Completed

### ✅ Assignment 1A: Core AMM Smart Contract
**Deadline:** September 1, 2024 (23:59 KST)

Implemented the foundational constant-product AMM (x * y = k) smart contract with:
- Basic liquidity provision mechanism
- Token swap functionality
- MockERC20 token contracts with free minting
- Deployed and verified on Flare Coston2 Testnet

**Key Contracts:**
- `MiniAMM.sol` - Core AMM logic implementing x*y=k formula
- `MockERC20.sol` - Test token contracts with public minting

**Technology:** Solidity 0.8.30, Foundry, OpenZeppelin

### ✅ Assignment 1B: Local Development Environment
**Deadline:** September 8, 2024 (22:00 KST)

Built a complete Docker Compose-based local blockchain development stack:
- **Geth Node:** Local Ethereum blockchain with pre-funded accounts
- **Blockscout Explorer:** Blockchain explorer UI for transaction visualization
- **Smart Contract Deployer:** Automated deployment pipeline
- **Caddy Reverse Proxy:** Unified routing for all services
- **Ngrok Tunnel:** Public internet access to local environment
- **The Graph Stack:** IPFS, PostgreSQL, Redis, and Graph Node for data indexing

**Services Exposed:**
- Explorer: `/explorer`
- RPC Endpoint: `/rpc`
- Contract Deployment Info: `/deployment`
- GraphQL Playground: `/graph-playground`

### ✅ Assignment 2: Enhanced AMM Features
**Deadline:** September 15, 2024 (23:59 KST)

Extended the AMM with production-ready features:
- **LP Tokens:** ERC20 liquidity provider tokens
- **Remove Liquidity:** Burn LP tokens to withdraw proportional reserves
- **Swap Fees:** 0.3% fee on all swaps (matching Uniswap V2)
- **Factory Contract:** Deploy multiple token pair pools
- **Proportional Liquidity:** Maintain constant ratio when adding liquidity

**Key Contracts:**
- `MiniAMM.sol` (v2) - Enhanced with fees and LP tokens
- `MiniAMMLP.sol` - ERC20 LP token implementation
- `MiniAMMFactory.sol` - Factory for creating new pairs
- `MockERC20.sol` - Test tokens

### ✅ Assignment 3: Frontend Development
**Deadline:** September 22, 2024 (23:59 KST)

Built a modern, responsive web interface with complete DApp functionality:

**Features Implemented:**
- **Wallet Management**
  - Connect/disconnect with RainbowKit integration
  - Network validation (Flare Coston2)
  - Balance display for native and ERC20 tokens
  
- **Token Operations**
  - Mint MockERC20 test tokens
  - Approve token spending for MiniAMM contract
  - Real-time allowance checking
  
- **AMM Interface**
  - Token swapping with live price calculation
  - Add liquidity with automatic ratio calculation
  - Remove liquidity by burning LP tokens
  - Real-time reserve and balance updates
  
- **Portfolio View**
  - Wallet token balances
  - LP token holdings
  - Pool reserve information

**Technology Stack:**
- **Framework:** Next.js 15 with App Router
- **Blockchain:** Ethers.js v6, Wagmi, Viem, RainbowKit
- **Type Safety:** TypeChain for contract type generation
- **Styling:** Tailwind CSS 4, modern responsive design
- **State Management:** React Query for async state

### ⚠️ Assignment 4A: Contracts Redeployment
**Status:** Completed (not submitted separately)

Redeployed enhanced contracts from Assignment 2 with factory pattern for Assignment 4 integration.

### ⏸️ Assignment 4B: Subgraph Integration
**Status:** Excluded due to subgraph indexing errors

This assignment required deploying a subgraph to index blockchain events and connecting the frontend to query data via GraphQL. Due to technical issues with subgraph deployment, this assignment was excluded from the course requirements.

**Attempted Features:**
- Subgraph schema definition for Swap events
- Event handlers for liquidity and swap operations
- GraphQL API for querying historical data

## Project Structure

```
cohort-1-assignments-public/
├── 1a/                          # Assignment 1A: Basic AMM
│   ├── src/
│   │   ├── MiniAMM.sol         # Core AMM contract (v1)
│   │   ├── MockERC20.sol       # Test token contract
│   │   └── IMiniAMM.sol        # Interface
│   ├── test/                    # Foundry tests
│   ├── script/                  # Deployment scripts
│   └── foundry.toml
│
├── 1b/                          # Assignment 1B: Local Dev Environment
│   ├── docker-compose.yml       # Main orchestration
│   ├── geth/                    # Geth node configuration
│   ├── blockscout/              # Explorer configuration
│   ├── subgraph/                # The Graph stack
│   ├── caddy/                   # Reverse proxy
│   └── sc-deployer/             # Contract deployment automation
│
├── 2/                           # Assignment 2: Enhanced AMM
│   ├── src/
│   │   ├── MiniAMM.sol         # Enhanced AMM with fees & LP tokens
│   │   ├── MiniAMMLP.sol       # LP token ERC20 contract
│   │   ├── MiniAMMFactory.sol  # Factory for pair creation
│   │   └── MockERC20.sol       # Test tokens
│   ├── test/                    # Comprehensive test suite
│   └── script/                  # Deployment with factory
│
├── 4/                           # Assignment 3/4: Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main application UI
│   │   │   └── layout.tsx      # Root layout with providers
│   │   ├── components/
│   │   │   ├── WalletConnection.tsx
│   │   │   ├── TokenMinting.tsx
│   │   │   ├── TokenApproval.tsx
│   │   │   ├── SwapInterface.tsx
│   │   │   ├── LiquidityManagement.tsx
│   │   │   └── BalanceDisplay.tsx
│   │   ├── config/
│   │   │   ├── chains.ts       # Flare Coston2 configuration
│   │   │   ├── contracts.ts    # Contract addresses
│   │   │   └── wagmi.ts        # Wagmi configuration
│   │   └── types/
│   │       └── ethers-contracts/ # TypeChain generated types
│   ├── abi/                     # Contract ABIs
│   └── package.json
│
└── README.md                    # This file
```

## Technology Stack

### Smart Contracts
- **Language:** Solidity ^0.8.30
- **Framework:** Foundry (Forge, Cast, Anvil)
- **Libraries:** OpenZeppelin Contracts
- **Testing:** Foundry Test Suite

### Local Infrastructure
- **Blockchain:** Geth (Go Ethereum) v1.15.0
- **Explorer:** Blockscout
- **Indexing:** The Graph Protocol (Graph Node, IPFS, PostgreSQL)
- **Proxy:** Caddy Server
- **Tunneling:** Ngrok
- **Orchestration:** Docker Compose

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Blockchain Libraries:**
  - Ethers.js v6 - Contract interactions
  - Wagmi v2 - React hooks for Ethereum
  - Viem - Low-level Ethereum utilities
  - RainbowKit - Wallet connection UI
- **Type Safety:** TypeScript, TypeChain
- **Styling:** Tailwind CSS v4
- **State Management:** TanStack React Query

### Network
- **Testnet:** Flare Coston2 Testnet
- **Faucet:** https://faucet.flare.network/coston2
- **Explorer:** https://coston2.testnet.flarescan.com/

## Key Features

### Smart Contract Features
- ✅ Constant product automated market maker (x * y = k)
- ✅ Liquidity provision with LP token minting
- ✅ Liquidity removal with LP token burning
- ✅ Token swapping with 0.3% fee
- ✅ Factory pattern for multiple token pairs
- ✅ Token ordering (tokenX < tokenY)
- ✅ First liquidity provider protection
- ✅ Proportional liquidity addition

### Frontend Features
- ✅ RainbowKit wallet connection
- ✅ Network validation and switching
- ✅ MockERC20 token minting interface
- ✅ Token approval management
- ✅ Real-time balance displays
- ✅ Interactive swap interface with price calculation
- ✅ Add liquidity with ratio maintenance
- ✅ Remove liquidity with LP token burning
- ✅ Transaction state management (pending, success, error)
- ✅ Responsive design for mobile and desktop
- ✅ Loading indicators and error handling

### Development Features
- ✅ Complete local blockchain environment
- ✅ Automated contract deployment
- ✅ Pre-funded development accounts
- ✅ Local block explorer
- ✅ The Graph indexing infrastructure
- ✅ Public internet access via ngrok
- ✅ Comprehensive test coverage

## Smart Contract Architecture

### MiniAMM (Core AMM Contract)
The heart of the system implementing the constant-product formula:

**Formula:** `(x + Δx) * (y - Δy) = x * y = k`

Where:
- `x, y` = token reserves
- `k` = constant product
- `Δx, Δy` = amount in/out during swap

**With 0.3% Fee:**
```
(x + Δx * 0.997) * (y - Δy) = k
```

**Key Functions:**
- `addLiquidity(xAmount, yAmount)` - Add liquidity and receive LP tokens
- `removeLiquidity(lpAmount)` - Burn LP tokens and receive underlying tokens
- `swap(xAmountIn, yAmountIn)` - Swap one token for another
- `xReserve, yReserve` - Current reserves
- `k` - Constant product

### MiniAMMLP (LP Token)
ERC20 token representing liquidity provider shares:
- Minted when liquidity is added
- Burned when liquidity is removed
- Amount calculated as `sqrt(x * y)` for first liquidity
- Proportional minting for subsequent additions

### MiniAMMFactory
Factory pattern for creating new token pair pools:
- `createPair(tokenA, tokenB)` - Deploy new MiniAMM instance
- `getPair[tokenA][tokenB]` - Mapping of token pairs to pool addresses
- `allPairs[]` - Array of all created pairs

## Development Setup

### Prerequisites
- Git
- Docker & Docker Compose
- Node.js 18+ (for frontend)
- Foundry (for smart contracts)

### Running Smart Contracts Locally

```bash
# Navigate to assignment folder (1a or 2)
cd 1a  # or cd 2

# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test

# Run tests with verbosity
forge test -vvv
```

### Running Local Blockchain Environment

```bash
cd 1b

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points:**
- Geth RPC: http://localhost:8545
- Blockscout Explorer: http://localhost:4000
- Deployment Info: http://localhost:8081
- Graph Node: http://localhost:8020

### Running Frontend

```bash
cd 4

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit http://localhost:3000

## Deployment

### Smart Contracts (Flare Coston2 Testnet)

1. **Get testnet tokens:**
   - Visit https://faucet.flare.network/coston2
   - Enter your wallet address
   - Receive C2FLR test tokens

2. **Deploy contracts:**
```bash
cd 2

# Create .env file with private key
echo "PRIVATE_KEY=your_private_key_here" > .env

# Deploy
forge script script/Factory.s.sol:FactoryScript --rpc-url https://coston2-api.flare.network/ext/C/rpc --broadcast --verify

# Verify separately if needed
forge verify-contract <CONTRACT_ADDRESS> src/MiniAMMFactory.sol:MiniAMMFactory --chain 114
```

### Frontend (Cloudflare Workers)

```bash
cd 4

# Build and deploy
npm run deploy

# Or preview locally
npm run preview
```

## Testing

### Smart Contract Tests

All assignments include comprehensive test suites:

```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/MiniAMM.t.sol

# Run with gas reporting
forge test --gas-report

# Run with coverage
forge coverage
```

**Test Coverage Includes:**
- ✅ Basic liquidity addition
- ✅ Proportional liquidity maintenance
- ✅ Token swapping (both directions)
- ✅ Fee calculation
- ✅ LP token minting/burning
- ✅ Factory pair creation
- ✅ Edge cases and error handling

## Learning Outcomes

Through this intensive course, I gained hands-on experience with:

### Blockchain & Smart Contracts
- Solidity programming and best practices
- Automated Market Maker (AMM) algorithms
- ERC20 token standards and implementations
- Factory patterns in Solidity
- Gas optimization techniques
- Smart contract security considerations
- Testing with Foundry framework

### DApp Development
- Full-stack blockchain application architecture
- Web3 wallet integration (RainbowKit, Wagmi)
- Contract interaction with Ethers.js
- Type-safe contract calls with TypeChain
- Transaction lifecycle management
- Error handling for blockchain operations

### DevOps & Infrastructure
- Docker containerization
- Multi-service orchestration with Docker Compose
- Local blockchain development environment
- Reverse proxy configuration
- The Graph Protocol for blockchain indexing
- Block explorer deployment (Blockscout)

### Frontend Development
- Next.js 15 with App Router
- React hooks for blockchain state
- Modern UI/UX design patterns
- Responsive web design with Tailwind CSS
- Async state management with React Query

## Challenges Overcome

1. **Assignment 1B Complexity:** Setting up the complete Docker infrastructure with 7+ services required careful debugging of networking, dependencies, and startup sequencing.

2. **Smart Contract Logic:** Implementing the constant-product formula with fees and maintaining LP token ratios correctly required deep understanding of the Uniswap V2 mathematics.

3. **Frontend State Management:** Managing blockchain transaction states, handling pending transactions, and updating UI in real-time posed unique challenges compared to traditional web development.

4. **Type Safety:** Integrating TypeChain with Next.js and ensuring type-safe contract interactions across the application required careful configuration.

5. **Subgraph Issues:** Assignment 4B encountered technical difficulties with subgraph deployment and indexing, highlighting the complexity of production blockchain infrastructure.

## Course Completion Status

| Assignment | Title | Status | Deadline |
|------------|-------|--------|----------|
| 1A | Basic AMM Contract | ✅ Completed | Sept 1, 23:59 KST |
| 1B | Local Dev Environment | ✅ Completed | Sept 8, 22:00 KST |
| 2 | Enhanced AMM Features | ✅ Completed | Sept 15, 23:59 KST |
| 3 | Frontend Development | ✅ Completed | Sept 22, 23:59 KST |
| 4A | Contract Redeployment | ✅ Completed | Sept 30, 23:59 KST |
| 4B | Subgraph Integration | ⚠️ Excluded | Sept 30, 23:59 KST |

**Final Result:** ✅ **Successfully completed all required assignments**

*Note: Assignment 4B was excluded from requirements due to subgraph deployment errors.*

## Resources

### Course Materials
- Course Repository: [hell-month/course](https://github.com/hell-month/course)
- Assignment Repo: [hell-month/cohort-1-assignments-public](https://github.com/hell-month/cohort-1-assignments-public)

### Documentation
- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [The Graph Documentation](https://thegraph.com/docs/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Flare Network Docs](https://docs.flare.network/)

### Community
- HellMonth Platform: 400+ blockchain developers and enthusiasts
- Course Instructor: Joel - Blockchain Community Leader, South Korea
- Submission Tracking: [Google Sheets](https://docs.google.com/spreadsheets/d/1LtR6zEHqmUgXdRn0NSkm2pmDreL8w3GBOMDGs7vVUGE/)

## Future Enhancements

Potential improvements for this project:

- [ ] Deploy to additional testnets (Sepolia, Polygon Mumbai)
- [ ] Implement router contract for multi-hop swaps
- [ ] Add price impact warnings
- [ ] Implement slippage protection
- [ ] Add transaction history view
- [ ] Create analytics dashboard
- [ ] Implement governance token
- [ ] Add farming/staking mechanisms
- [ ] Complete subgraph integration (Assignment 4B)
- [ ] Deploy to mainnet with additional safety features

## Acknowledgments

**Special Thanks:**
- **Joel** - For creating and hosting the HellMonth course, providing excellent instruction, and fostering a supportive learning community
- **HellMonth Community** - 400+ members who provided support, shared knowledge, and motivated continued learning
- **Course Participants** - Fellow students who collaborated and problem-solved together throughout the intensive program

This project represents the culmination of an intensive month of learning, building, and debugging. The hands-on experience gained through strict deadlines and real-world requirements has been invaluable for understanding blockchain development at a practical level.

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built with ❤️ during HellMonth 2024**

*A month-long intensive blockchain development bootcamp*
