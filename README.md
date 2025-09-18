# Unicorn.eth PolyPrize Collection - Deployment Guide

## Overview
This guide will help you deploy a soul-bound NFT collection on Polygon using ThirdWeb tools.

## Prerequisites

### 1. Required Accounts & Tools
- [ThirdWeb Dashboard Account](https://thirdweb.com/dashboard)
- Polygon wallet with MATIC for gas fees
- Code editor (VS Code recommended)
- Node.js (v16 or higher)
- Git

### 2. Environment Setup
```bash
# Create new React project
npx create-react-app unicorn-polyprize-dapp
cd unicorn-polyprize-dapp

# Install ThirdWeb dependencies
npm install @thirdweb-dev/react @thirdweb-dev/sdk @thirdweb-dev/chains

# Install additional dependencies
npm install tailwindcss
```

## Step 1: Contract Deployment

### Option A: Using ThirdWeb Deploy (Recommended)
```bash
# Install ThirdWeb CLI
npm install -g @thirdweb-dev/cli

# Initialize new contract project
npx thirdweb create contract

# Choose:
# - Contract name: UnicornPolyPrizeCollection
# - Framework: Hardhat
# - Base contract: ERC721Base
```

### Option B: Manual Deployment via ThirdWeb Dashboard
1. Go to [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
2. Click "Deploy Contract"
3. Choose "ERC721" → "ERC721Base"
4. Customize with the provided contract code
5. Deploy to Polygon network

### Contract Constructor Parameters
```
Base Image URI: "https://your-domain.com/unicorn-image.png" or "ipfs://QmYourImageHash"
Drawing Date: 1735689599 (Unix timestamp - e.g., Dec 31, 2024 23:59:59 UTC)
```

**Important Notes:**
- **Base Image URI**: Single image used for all NFTs (IPFS recommended for permanence)
- **Drawing Date**: Unix timestamp when minting ends
- **Max Supply**: Hard-coded to 10,000 NFTs in contract
- **On-Chain Metadata**: All metadata generated on-chain, no external API needed

**Setting Drawing Date:**
```javascript
// Calculate Unix timestamp for your drawing date
const drawingDate = new Date('2024-12-31T23:59:59Z').getTime() / 1000;
console.log(drawingDate); // Use this value in constructor
```

## Step 2: Image Hosting (Simplified)

### Why Only One Image?
The updated contract uses a **single image for all NFTs**, making deployment much simpler:
- No complex metadata API needed
- All metadata generated on-chain
- Reduces hosting costs and complexity
- Ensures permanent availability

### Option A: IPFS (Recommended for Permanence)
```bash
# Upload your unicorn image to IPFS
# Use Pinata, Infura, or local IPFS node
# Example result: "ipfs://QmYourUnicornImageHash"
```

### Option B: Traditional Web Hosting
```bash
# Upload single image to your web server
# Example: "https://yourdomain.com/unicorn-polyprize.png"
# Ensure high availability and CDN if possible
```

### No Metadata API Required! 
✅ **Simplified**: The contract generates all metadata on-chain including:
- Token name and description
- Minter wallet address as trait
- Drawing date as trait
- Soulbound status

## Step 3: Frontend Configuration (Updated)

### 1. Environment Variables
Create `.env.local`:
```
REACT_APP_THIRDWEB_CLIENT_ID=your_client_id_here
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_CHAIN_ID=137
```

### 2. Update Contract Address
In your React app, replace `YOUR_CONTRACT_ADDRESS_HERE` with your deployed contract address.

### 3. Get ThirdWeb Client ID
1. Go to [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
2. Navigate to Settings → API Keys
3. Create new client ID
4. Add your domain to allowed origins

## Step 4: Testing & Deployment

### Local Testing
```bash
# Start development server
npm start

# Test on Polygon Mumbai testnet first
# Get test MATIC from Mumbai faucet
```

### Production Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting provider
# Recommended: Vercel, Netlify, or IPFS
```

### Frontend Hosting Options
1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **IPFS** (Fully Decentralized)
   ```bash
   # Build and upload to IPFS
   npm run build
   # Upload build folder to IPFS
   ```

## Step 5: Admin Functions & Management

### Emergency Controls
The contract includes several admin-only functions for managing the lottery:

```javascript
// Pause minting (emergency stop)
await contract.call("pause");

// Resume minting
await contract.call("unpause");

// Extend drawing date (cannot reduce)
const newDrawingDate = Math.floor(new Date('2025-02-01T23:59:59Z').getTime() / 1000);
await contract.call("setDrawingDate", [newDrawingDate]);

// Update image URI if needed
await contract.call("updateBaseURI", ["ipfs://QmNewImageHash"]);

// Withdraw any ETH sent to contract
await contract.call("withdrawETH");
```

### Max Supply Management
- **Hard Cap**: 10,000 NFTs maximum (cannot be changed)
- **Automatic Stop**: Minting stops when max supply reached
- **Progress Tracking**: Frontend shows supply progress

### Drawing Date Rules
1. **Extension Only**: Can only extend, never reduce drawing date
2. **Future Only**: New date must be in the future  
3. **Owner Only**: Only contract owner can modify
4. **Event Logging**: All changes logged on-chain

## Step 6: Contract Verification & Security

### 1. Verify Contract on PolygonScan
- Use ThirdWeb dashboard or manually verify
- Ensures transparency and trust

### 2. Security Checklist
- [ ] Test soul-bound restrictions
- [ ] Verify one-mint-per-wallet limitation
- [ ] Test metadata generation with minter address
- [ ] Ensure proper access controls
- [ ] Test burning functionality

## Step 6: Legal Considerations

### Important Legal Notes for Lottery/Prize Systems

⚠️ **IMPORTANT**: Since this is for a "PolyPrize" lottery system, be aware of legal requirements:

1. **Gambling Regulations**
   - Lottery laws vary by jurisdiction
   - Some regions require licenses for prize drawings
   - Consider legal consultation for compliance

2. **Terms of Service**
   - Clearly define NFT utility and limitations
   - Explain soul-bound nature
   - Include dispute resolution mechanisms

3. **Privacy Considerations**
   - Wallet addresses in metadata are public
   - Consider privacy implications
   - GDPR compliance if applicable

### Recommended Legal Framework
```
1. Terms of Service clearly stating:
   - NFT is soul-bound (non-transferable)
   - One mint per wallet limitation
   - Prize/lottery participation rules
   - Jurisdiction and governing law

2. Privacy Policy covering:
   - Wallet address collection and use
   - Metadata storage and access
   - User rights and data handling
```

## Step 7: Advanced Features (Optional)

### 1. Whitelist/Allowlist
Add to contract:
```solidity
mapping(address => bool) public allowlist;
modifier onlyAllowlisted() {
    require(allowlist[msg.sender], "Not allowlisted");
    _;
}
```

### 2. Time-Limited Minting
```solidity
uint256 public mintStart;
uint256 public mintEnd;

modifier duringMintPeriod() {
    require(block.timestamp >= mintStart && block.timestamp <= mintEnd, "Minting not active");
    _;
}
```

### 3. Prize Integration
Connect to lottery system:
```solidity
interface ILotterySystem {
    function registerEntry(address participant, uint256 tokenId) external;
}

ILotterySystem public lotteryContract;
```

## Testing Checklist

### Contract Testing
- [ ] Deploy to Mumbai testnet with proper image URI and drawing date
- [ ] Test minting process before drawing date
- [ ] Test minting rejection after drawing date  
- [ ] Test max supply constraint (if testing with lower limit)
- [ ] Test pause/unpause functionality (owner only)
- [ ] Test drawing date extension (owner only)
- [ ] Verify drawing date cannot be reduced
- [ ] Test image URI updates (owner only)
- [ ] Test ETH withdrawal (owner only)
- [ ] Verify on-chain metadata generation
- [ ] Test soulbound transfer restrictions
- [ ] Test burning functionality
- [ ] Verify events are emitted correctly

### Frontend Testing
- [ ] Wallet connection
- [ ] Mint button functionality
- [ ] Drawing date countdown display
- [ ] Minting disabled after drawing date
- [ ] Drawing status indicators
- [ ] Error handling
- [ ] Responsive design
- [ ] Loading states
- [ ] Transaction feedback

### Integration Testing
- [ ] Contract-frontend interaction
- [ ] Metadata API responses
- [ ] Error scenarios
- [ ] Network switching
- [ ] Gas estimation

## Production Deployment Checklist

- [ ] Contract deployed and verified on Polygon
- [ ] Frontend deployed to production hosting
- [ ] Metadata API/IPFS configured
- [ ] Domain configured with SSL
- [ ] Analytics integrated (optional)
- [ ] Legal documentation prepared
- [ ] Community announcement ready

## Support Resources

- [ThirdWeb Documentation](https://portal.thirdweb.com/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)

## Estimated Costs

### Development Phase
- Mumbai testnet: Free (test MATIC)
- ThirdWeb: Free tier available

### Production Deployment
- Polygon contract deployment: ~0.01-0.05 MATIC
- Per NFT mint: ~0.001-0.003 MATIC
- Frontend hosting: $0-20/month depending on provider

## Next Steps

1. Follow deployment steps in order
2. Test thoroughly on Mumbai testnet
3. Deploy to Polygon mainnet
4. Launch marketing campaign
5. Monitor contract and user activity
6. Consider future utility additions

---

**Need Help?** 
- ThirdWeb Discord: [discord.gg/thirdweb](https://discord.gg/thirdweb)
- Polygon Discord: [discord.gg/polygon](https://discord.gg/polygon)