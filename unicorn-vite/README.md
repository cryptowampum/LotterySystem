# PolyPrize Claiming DApp

A React application for claiming exclusive soul-bound NFTs , built for polygon.ac community members with existing smart wallets.

## Overview

This decentralized application (dapp) allows authorized users to claim PolyPrize NFTs on the Polygon blockchain. The NFTs are soul-bound (non-transferable) and serve as both collectibles and raffle entries for a $200 prize drawing.

### Key Features

- **Gasless Claiming**: Users pay no transaction fees thanks to account abstraction
- **Soul-Bound NFTs**: Tokens cannot be transferred, ensuring fair lottery participation
- **Smart Wallet Integration**: Works exclusively with pre-issued Thirdweb smart accounts
- **Social Sharing**: Built-in sharing to LinkedIn, Twitter, Farcaster, and Bluesky
- **Real-Time Data**: Live contract data showing supply, drawing date, and countdown
- **Mobile Responsive**: Clean white design with purple branding

## Technology Stack

- **Frontend**: React 19 with Vite
- **Web3**: Thirdweb v5 SDK
- **Blockchain**: Polygon mainnet
- **Styling**: Tailwind CSS
- **Analytics**: Google Analytics 4
- **Deployment**: Vercel

## Smart Contract Details

- **Contract Address**: 
- **Network**: 
- **Type**: ERC721 with soul-bound restrictions
- **Max Supply**: 
- **Factory Address**: `0xD771615c873ba5a2149D5312448cE01D677Ee48A`

## Prerequisites

### For Users
- Must have a pre-existing smart wallet issued by polygon.ac/unicorn.eth
- Wallet must be created from the authorized factory address
- Access through authorized dapp domains only

### For Developers
- Node.js 18+
- npm or yarn
- Environment variables (see below)

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd unicorn-vite

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
```

## Environment Variables

Create a `.env` file in the `unicorn-vite` directory:

```env
# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your_client_id_here
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A

# Smart Contract
VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Architecture

### Authorization System
The app implements a strict authorization system:

1. **AutoConnect Detection**: Automatically connects to existing smart wallets
2. **Factory Validation**: Verifies wallets were created by the authorized factory
3. **Session Management**: Maintains connection state through localStorage
4. **Timeout Handling**: 15-second connection timeout with user feedback

### Contract Integration
All contract interactions use explicit function signatures required by Thirdweb v5:

```javascript
// Example contract call
const { data: hasMinted } = useReadContract({
  contract,
  method: "function hasMinted(address) view returns (bool)",
  params: [address]
});
```

### State Management
- React hooks for wallet and contract state
- Real-time updates for supply and countdown
- Error handling with user-friendly messages
- Rate limiting (8-second cooldown between attempts)

## Key Components

### `App.jsx`
Main application component with Thirdweb provider and AutoConnect setup.

### `MintingInterface`
Core claiming interface with authorization logic and contract interactions.

### `SocialShareButton`
Reusable component for social media sharing with platform-specific URLs.

### `analytics.js`
Google Analytics integration tracking user interactions and contract events.

## Security Features

- **Factory Address Validation**: Only wallets from authorized factory can connect
- **Rate Limiting**: Prevents spam claiming attempts
- **Input Validation**: Address format validation
- **Error Sanitization**: Generic error messages to prevent information leakage
- **Contract Verification**: Bytecode validation (configurable)

## Analytics Tracking

The app tracks these events:
- Page views and user sessions
- Wallet connection success/failure
- Authorization checks
- NFT claiming attempts
- Social media shares
- Drawing countdown views

## Deployment

### Vercel Deployment

1. **Repository Setup**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vercel Configuration**:
   - Root Directory: `unicorn-vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`

3. **Environment Variables**:
   Set all required environment variables in Vercel dashboard.

### Alternative: Manual Configuration

Use `vercel.json` in project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps"
}
```

## Usage

### For Authorized Users

1. **Access**: Visit the deployed dapp URL
2. **AutoConnect**: App automatically detects and connects existing wallet
3. **Claim**: Click "Claim NFT" button for gasless transaction
4. **Share**: Use social buttons to share claim on social media
5. **Wait**: NFT holders are automatically entered in raffle drawing

### For Administrators

Monitor via:
- Google Analytics dashboard for user behavior
- Blockchain explorer for contract interactions
- Vercel dashboard for deployment status

## Smart Contract Functions

### User Functions
- `mint()`: Claim one NFT per wallet (before drawing date)
- `hasMinted(address)`: Check if address has claimed
- `totalSupply()`: Current number of minted NFTs

### Admin Functions
- `pause()`/`unpause()`: Emergency stop mechanism
- `setDrawingDate(uint256)`: Extend deadline (cannot reduce)
- `updateBaseURI(string)`: Change NFT metadata URI

### View Functions
- `MAX_SUPPLY()`: Returns 10,000
- `drawingDate()`: Unix timestamp of raffle drawing
- `isMintingActive()`: Whether claiming is currently allowed
- `paused()`: Contract pause status

## Troubleshooting

### Common Issues

**AutoConnect Not Working**:
- Verify user has existing smart wallet from correct factory
- Check client ID permissions in Thirdweb dashboard
- Ensure proper environment variables are set

**Gas Sponsorship Failing**:
- Confirm gas sponsorship limits in Thirdweb dashboard
- Verify contract is whitelisted for sponsorship
- Check account abstraction configuration

**Build Errors**:
- Use `--legacy-peer-deps` flag for npm install
- Ensure Node.js version 18+
- Verify all environment variables are set

### Development Tips

- Use browser console to monitor AutoConnect process
- Check localStorage for wallet session data
- Verify contract calls return expected data types
- Test with different wallet states (connected/disconnected)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Security Considerations

- Never expose private keys or sensitive credentials
- Validate all user inputs and contract responses
- Implement proper error handling without information leakage
- Monitor for unusual claiming patterns
- Keep dependencies updated

## License

This project is proprietary software for polygon.ac community use.

## Support

For technical issues:
- Check browser console for error messages
- Verify wallet connection and network
- Ensure you have an authorized smart wallet

For access issues:
- Contact polygon.ac administrators
- Verify your account status in the community

---

**Built with Thirdweb v5, React, and deployed on Vercel**