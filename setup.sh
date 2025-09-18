#!/bin/bash

# 🦄 Unicorn.eth PolyPrize Collection - Quick Setup Script
# This script sets up the complete project structure for the NFT claiming dapp

echo "🦄 Setting up Unicorn.eth PolyPrize Collection..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Create React app
echo "📦 Creating React application..."
npx create-react-app unicorn-polyprize-minidapp
cd unicorn-polyprize-minidapp

# Install dependencies
echo "⬇️ Installing ThirdWeb dependencies..."
npm install @thirdweb-dev/react @thirdweb-dev/sdk @thirdweb-dev/chains

# Install Tailwind CSS (must be installed before init)
echo "🎨 Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind config (after installation)
echo "⚙️ Initializing Tailwind configuration..."
npx tailwindcss init -p

# Create directory structure
echo "📁 Creating project structure..."
mkdir -p src/components src/hooks src/utils src/styles contracts

# Create environment files
echo "⚙️ Creating environment configuration..."
cat > .env.example << 'EOF'
# ThirdWeb Configuration
REACT_APP_THIRDWEB_CLIENT_ID=your_client_id_here

# Contract Configuration  
REACT_APP_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Network Configuration
REACT_APP_CHAIN_ID=137
REACT_APP_NETWORK_NAME=polygon

# Optional: Analytics & Monitoring
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
EOF

cp .env.example .env.local

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
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
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Update package.json scripts
echo "📝 Updating package.json..."
npm pkg set scripts.deploy="npm run build && echo 'Build complete! Upload build/ folder to your hosting provider'"

# Create constants file
cat > src/utils/constants.js << 'EOF'
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
EOF

# Create useAutoConnect hook
cat > src/hooks/useAutoConnect.js << 'EOF'
import { useState, useEffect } from 'react';
import { useConnectionStatus, useAddress } from "@thirdweb-dev/react";

export const useAutoConnect = () => {
  const connectionStatus = useConnectionStatus();
  const address = useAddress();
  const [isAutoConnected, setIsAutoConnected] = useState(false);
  const [connectionType, setConnectionType] = useState('');

  useEffect(() => {
    if (connectionStatus === "connected" && address) {
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
EOF

# Create useCountdown hook
cat > src/hooks/useCountdown.js << 'EOF'
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
EOF

# Update src/index.css to include Tailwind
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

# Create gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production build
build/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Contract artifacts
contracts/artifacts/
contracts/cache/

# Deployment
deploy.json
EOF

# Create README
cat > README.md << 'EOF'
# 🦄 Unicorn.eth PolyPrize Collection

Authorized-access soul-bound NFT claiming dapp for the PolyPrize lottery system.

## ⚡ Quick Start

1. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

2. **Get ThirdWeb Client ID**
   - Visit https://thirdweb.com/dashboard
   - Create new project and get Client ID
   - Add to .env.local

3. **Deploy Contract** 
   ```bash
   # Use ThirdWeb deploy or your preferred method
   npx thirdweb deploy
   ```

4. **Start Development**
   ```bash
   npm start
   ```

## 🔒 Access Control

- Only wallets with `autoConnect` enabled can claim NFTs
- Manual wallet connections are blocked from claiming
- Perfect for authorized-user-only distributions

## 🚀 Deploy to Production

```bash
npm run build
# Upload build/ folder to Vercel, Netlify, or your hosting provider
```

## 📝 Key Features

- ✅ Soul-bound NFTs (non-transferable)
- ✅ Auto-connect authorization only
- ✅ Time-limited claiming window  
- ✅ Max supply protection (10,000 NFTs)
- ✅ Admin pause/unpause controls
- ✅ On-chain metadata generation
- ✅ Real-time countdown timer

Built with ❤️ by @cryptowampum and Claude AI for unicorn.eth
EOF

echo ""
echo "✅ Setup complete! Here's what to do next:"
echo ""
echo "1. 🔑 Get your ThirdWeb Client ID:"
echo "   - Visit: https://thirdweb.com/dashboard"
echo "   - Create project and copy Client ID"
echo "   - Add to .env.local file"
echo ""
echo "2. 📄 Deploy your contract:"
echo "   - Upload your unicorn image to IPFS"
echo "   - Use: npx thirdweb deploy"
echo "   - Add contract address to .env.local"
echo ""
echo "3. 🚀 Start developing:"
echo "   cd unicorn-polyprize-dapp"
echo "   npm start"
echo ""
echo "4. 📱 Replace src/App.js with the provided React component"
echo ""
echo "🦄 Your Unicorn.eth PolyPrize dapp is ready to build!"

# Final reminder
echo ""
echo "⚠️  IMPORTANT: Remember to:"
echo "   - Never commit .env.local to git"
echo "   - Test on Mumbai testnet first"
echo "   - Set up authorized wallets before launch"
echo "   - Configure your drawing date carefully"