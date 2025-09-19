# 🦄 Unicorn.eth PolyPrize Collection - Project Continuation Prompt

## Project Overview
I'm building a soul-bound NFT claiming dapp for an exclusive lottery system called "Unicorn.eth PolyPrize Collection." This is a React app that uses ThirdWeb and deploys on Polygon.

## Key Requirements & Specifications

### Core Functionality
- **Soul-bound NFTs**: Non-transferable except to burn address (0x0)
- **Exclusive Access**: Only wallets with autoconnect enabled can claim NFTs
- **One Claim Per Wallet**: Each address can only claim once
- **Time-Limited**: Claiming ends at a specific drawing date
- **Max Supply**: Hard cap of 10,000 NFTs
- **On-Chain Metadata**: All metadata generated on-chain, no external API needed

### Smart Contract (Solidity) - this is complete! No changes needed as it has been deployed
```solidity
// Contract: PolyPrizeUnicorn 
// Deployed to: 0x228287e8793D7F1a193C9fbA579D91c7A6159176
// Features:
// - ERC721Base (ThirdWeb)
// - Ownable & Pausable
// - MAX_SUPPLY = 10000
// - Drawing date timestamp
// - hasMinted mapping
// - minters mapping (tokenId -> original minter)
// - Soulbound restrictions (blocks transfers & approvals)
// - On-chain metadata with minter address and drawing date
```

### Frontend Requirements (React)
- **ThirdWeb Integration**: Uses @thirdweb-dev/react
- **Autoconnect Restriction**: Only users who connected via autoconnect can claim
- **Real-time Countdown**: Shows time remaining until drawing
- **Status Indicators**: Shows authorized/unauthorized, claimed/not claimed status
- **Admin Controls**: Display pause status, supply progress
- **Responsive Design**: Tailwind CSS with purple/blue gradient theme

### Access Control Logic
```javascript
// Key restriction: Only autoconnect users can claim
const wasAutoConnected = localStorage.getItem('thirdweb:autoConnect') === 'true';
// Manual wallet connections are blocked from claiming
```

## Current State

### Completed Components
1. **Smart Contract**: `PolyPrizeUnicorn.sol` - Production ready and deployed
2. **React Frontend**: Main app with autoconnect restrictions
3. **Project Structure**: Complete file organization
4. **Deployment Guide**: Step-by-step instructions

### Current Issue
Setting up Tailwind CSS configuration - `npx tailwindcss init -p` command failing.

### Required Environment Variables
```env
REACT_APP_THIRDWEB_CLIENT_ID=08bcaef53c604c9fed6a96d7f1e52624
REACT_APP_CONTRACT_ADDRESS=0x228287e8793D7F1a193C9fbA579D91c7A6159176
REACT_APP_CHAIN_ID=137
REACT_APP_NETWORK_NAME=polygon
```

## Next Steps Needed

### Immediate Tasks
1. **Fix Tailwind Setup**: Resolve the `npx tailwindcss init -p` error or create configs manually
2. **Replace App.js**: Implement the provided React component with autoconnect restrictions
3. **Environment Configuration**: Set up .env.local with ThirdWeb Client ID
4. **Contract Deployment**: Deploy to Polygon with image URI and drawing date

### Technical Requirements
- **Node.js**: Version 16+ recommended  
- **Dependencies**: @thirdweb-dev/react, @thirdweb-dev/sdk, @thirdweb-dev/chains
- **Styling**: Tailwind CSS with custom purple theme
- **Network**: Polygon mainnet (test on Mumbai first)

### Key Features to Implement
1. **Access Control UI**: Clear indicators for authorized vs unauthorized users
2. **Claiming Interface**: Different UIs based on user authorization status
3. **Real-time Stats**: Supply progress, countdown timer, status indicators
4. **Error Handling**: Proper feedback for failed claims and unauthorized access
5. **NFT Display**: Show claimed NFTs with on-chain metadata parsing

## Design Specifications

### Color Scheme
- **Background**: Purple-to-blue gradient (`from-purple-900 via-blue-900 to-indigo-900`)
- **Authorized Status**: Green indicators (`text-green-400`)
- **Unauthorized Status**: Red indicators (`text-red-400`)
- **Buttons**: Purple theme (`bg-purple-600`, `hover:bg-purple-700`)

### UI Components Needed
- Header with title and connection status
- Stats grid showing supply, status, countdown
- Claiming interface with authorization checks
- NFT display for claimed tokens
- Status messages and error handling

## Contract Constructor Parameters
```javascript
// For deployment
const baseImageURI = "ipfs://bafybeigtj7zzqo4vfaiz5te2sjbh4aervqcy7mewlixk7kdd5nfql5ptja"; // Single image for all NFTs
const baseAnimationURI ="ipfs://bafybeibk5zl2peqe6medeh2vh45a3vaxcc2gvcenwy5ywxsfzhsj6kwdgq"; //Animation
const drawingDate = Math.floor(new Date('2025-09-28T23:59:59Z').getTime() / 1000);
```

## Key Security Features
- Manual wallet connections cannot claim (only autoconnect)
- Soul-bound enforcement (no transfers except burning)
- Drawing date cannot be moved backward (only extended)
- Admin pause/unpause functionality
- Max supply hard cap protection

## Success Criteria
- [x] Smart contract with soul-bound functionality
- [x] Autoconnect-only access control
- [ ] Working Tailwind CSS setup
- [ ] Deployed contract on Polygon
- [ ] Functional React frontend
- [ ] Real-time countdown and status updates
- [ ] Professional UI/UX for exclusive access

## Questions for Continuation
1. How can I resolve the Tailwind CSS setup issue?
2. What's the best approach for testing the autoconnect restriction locally?
3. Should I deploy to Mumbai testnet first for testing?
4. How do I set up the authorized wallet list for production?
5. What hosting platform do you recommend for the frontend?

## Additional Context
- Built with collaboration between @cryptowampum and Claude AI
- Target audience: Exclusive/invited users only
- Use case: Lottery entry system with controlled access
- Branding: Unicorn theme with professional finish

**Current directory**: `LotterySystem/` (or similar)
**Ready to continue with**: Tailwind setup resolution and full implementation