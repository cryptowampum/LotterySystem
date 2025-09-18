# Unicorn.eth PolyPrize - Complete Project Structure

## 📁 Project Directory Structure

```
unicorn-polyprize-dapp/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── unicorn-logo.png
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── MintingInterface.js
│   │   ├── StatCard.js
│   │   └── NFTCard.js
│   ├── hooks/
│   │   ├── useAutoConnect.js
│   │   └── useCountdown.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── contracts/
│   ├── PolyPrizeUnicorn.sol
│   └── deploy.js
├── .env.local
├── .env.example
├── package.json
├── tailwind.config.js
├── README.md
└── .gitignore
```

## 📦 Package.json

```json
{
  "name": "unicorn-polyprize-dapp",
  "version": "1.0.0",
  "description": "Soul-bound NFT claiming dapp for Unicorn.eth PolyPrize Collection",
  "private": true,
  "dependencies": {
    "@thirdweb-dev/react": "^4.0.0",
    "@thirdweb-dev/sdk": "^4.0.0",
    "@thirdweb-dev/chains": "^0.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "deploy": "npm run build && echo 'Build complete! Upload build/ folder to your hosting provider'"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

## 🔧 Environment Configuration

### .env.example
```env
# ThirdWeb Configuration
REACT_APP_THIRDWEB_CLIENT_ID=your_client_id_here

# Contract Configuration  
REACT_APP_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Network Configuration
REACT_APP_CHAIN_ID=137
REACT_APP_NETWORK_NAME=polygon

# Optional: Analytics & Monitoring
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
```

### .env.local (Your actual config - never commit this!)
```env
REACT_APP_THIRDWEB_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID
REACT_APP_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
REACT_APP_CHAIN_ID=137
REACT_APP_NETWORK_NAME=polygon
```

## 🎨 Tailwind Configuration

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          800: '#5B21B6',
          900: '#4C1D95'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

### postcss.config.js
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 🗂️ Component Structure

### src/components/Header.js
```jsx
import React from 'react';
import { ConnectWallet } from "@thirdweb-dev/react";

const Header = () => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-white mb-4">
        🦄 Unicorn.eth PolyPrize Collection
      </h1>
      <p className="text-xl text-gray-300 mb-2">
        Claim your exclusive soul-bound NFT
      </p>
      <p className="text-sm text-yellow-300 mb-8">
        🔐 Authorized wallets only • Auto-connect required
      </p>
      <div className="flex justify-center">
        <ConnectWallet 
          theme="dark"
          btnTitle="Connect Wallet"
          className="!bg-purple-600 !border-purple-500 hover:!bg-purple-700"
        />
      </div>
    </div>
  );
};

export default Header;
```

### src/components/StatCard.js
```jsx
import React from 'react';

const StatCard = ({ title, value, subtitle, className = "text-white" }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
      <h3 className="text-sm font-semibold text-gray-300 mb-1">{title}</h3>
      <p className={`text-lg font-bold ${className} mb-1`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
```

### src/utils/constants.js
```jsx
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";
export const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID) || 137;
export const THIRDWEB_CLIENT_ID = process.env.REACT_APP_THIRDWEB_CLIENT_ID || "";

export const MESSAGES = {
  ACCESS_DENIED: "Access denied - unauthorized wallet",
  CLAIMING_IN_PROGRESS: "Claiming your soul-bound NFT...",
  CLAIM_SUCCESS: "Successfully claimed! 🎉",
  CLAIM_FAILED: "Claiming failed. Please try again.",
  DRAWING_ENDED: "Drawing has ended",
};

export const STATUS_TYPES = {
  AUTHORIZED: 'Authorized',
  UNAUTHORIZED: 'Unauthorized',
  CLAIMED: 'Claimed',
  NOT_CLAIMED: 'Not Claimed',
  ACTIVE: 'Active',
  ENDED: 'Ended',
  PAUSED: 'Paused',
};
```

### src/hooks/useAutoConnect.js
```jsx
import { useState, useEffect } from 'react';
import { useConnectionStatus, useAddress } from "@thirdweb-dev/react";

export const useAutoConnect = () => {
  const connectionStatus = useConnectionStatus();
  const address = useAddress();
  const [isAutoConnected, setIsAutoConnected] = useState(false);
  const [connectionType, setConnectionType] = useState('');

  useEffect(() => {
    if (connectionStatus === "connected" && address) {
      // Check if this was an autoconnect by checking localStorage
      const wasAutoConnected = localStorage.getItem('thirdweb:autoConnect') === 'true';
      setIsAutoConnected(wasAutoConnected);
      setConnectionType(wasAutoConnected ? 'Auto-Connected' : 'Manual Connection');
    } else if (connectionStatus === "disconnected") {
      setIsAutoConnected(false);
      setConnectionType('');
    }
  }, [connectionStatus, address]);

  return { isAutoConnected, connectionType };
};
```

### src/hooks/useCountdown.js
```jsx
import { useState, useEffect } from 'react';

export const useCountdown = (targetTimestamp) => {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!targetTimestamp) return;
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const drawingTimestamp = parseInt(targetTimestamp.toString());
      const timeLeft = drawingTimestamp - now;
      
      if (timeLeft <= 0) {
        setCountdown("Drawing has ended");
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(timeLeft / 86400);
      const hours = Math.floor((timeLeft % 86400) / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;
      
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return countdown;
};
```

## 🚀 Deployment Scripts

### scripts/deploy.js (for contract deployment)
```javascript
const hre = require("hardhat");

async function main() {
  // Get deployment parameters
  const baseImageURI = "ipfs://QmYourUnicornImageHashHere";
  const drawingDate = Math.floor(new Date('2024-12-31T23:59:59Z').getTime() / 1000);
  
  console.log("Deploying PolyPrizeUnicorn contract...");
  console.log("Base Image URI:", baseImageURI);
  console.log("Drawing Date:", new Date(drawingDate * 1000).toISOString());
  
  // Deploy contract
  const PolyPrizeUnicorn = await hre.ethers.getContractFactory("PolyPrizeUnicorn");
  const unicorn = await PolyPrizeUnicorn.deploy(baseImageURI, drawingDate);
  
  await unicorn.deployed();
  
  console.log("✅ Contract deployed to:", unicorn.address);
  console.log("🔗 Polygon Explorer:", `https://polygonscan.com/address/${unicorn.address}`);
  console.log("📝 Update your .env.local with:");
  console.log(`REACT_APP_CONTRACT_ADDRESS=${unicorn.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
```

## 📋 Setup Instructions

### 1. Initialize Project
```bash
# Create React app
npx create-react-app unicorn-polyprize-dapp
cd unicorn-polyprize-dapp

# Install dependencies
npm install @thirdweb-dev/react @thirdweb-dev/sdk @thirdweb-dev/chains

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual values:
# - Get ThirdWeb Client ID from https://thirdweb.com/dashboard
# - Add your deployed contract address
# - Configure network settings
```

### 3. Deploy Contract
```bash
# Using ThirdWeb CLI (recommended)
npx thirdweb deploy

# Or using Hardhat/other tools
# Update deploy script with your parameters
# Run deployment to Polygon network
```

### 4. Configure Authorized Wallets
```bash
# Authorized users should visit the dapp once to enable autoconnect
# Their wallet will be stored in localStorage with autoConnect flag
# Only these pre-authorized wallets can claim NFTs
```

### 5. Test & Deploy Frontend
```bash
# Test locally
npm start

# Build for production
npm run build

# Deploy to hosting (Vercel, Netlify, etc.)
# Make sure to set environment variables in hosting platform
```

## 🔒 Security Considerations

### Auto-Connect Authorization
- Only wallets that have previously connected and authorized the dapp can claim
- Uses ThirdWeb's autoConnect feature + localStorage detection
- Manual connections are rejected for claiming

### Contract Security
- Soul-bound NFTs (non-transferable)
- One claim per wallet maximum
- Time-limited claiming window
- Admin pause/unpause functionality
- Max supply hard cap (10,000)

### Frontend Security  
- Environment variables for sensitive data
- Client-side validation before blockchain calls
- Error handling for all user interactions
- Clear access level indicators

## 📊 Monitoring & Analytics

### Recommended Tracking
- Total claims vs authorized wallets
- Claiming success/failure rates
- Peak claiming times
- Geographic distribution (if collecting)
- Contract interaction costs

### Error Monitoring
- Failed claims (gas issues, network problems)
- Unauthorized access attempts
- Contract call failures
- Frontend JavaScript errors

## 🎯 Production Checklist

- [ ] Contract deployed and verified on Polygon
- [ ] Base image uploaded to IPFS with backup
- [ ] Environment variables configured
- [ ] Authorized wallet list prepared
- [ ] Frontend deployed with SSL
- [ ] Error monitoring configured
- [ ] Analytics tracking setup
- [ ] Legal documentation prepared
- [ ] Community announcement ready
- [ ] Admin access procedures documented

---

This structure provides a professional, scalable foundation for your authorized-access NFT claiming dapp! 🦄