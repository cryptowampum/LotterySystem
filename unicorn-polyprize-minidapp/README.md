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
