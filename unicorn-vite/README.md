# PolyPrize Claiming DApp

A React application for claiming exclusive soul-bound NFTs, built for polygon.ac community members with existing smart wallets. Optimized for mobile performance at conferences with unreliable WiFi.

## Overview

This decentralized application (dapp) allows authorized users to claim PolyPrize NFTs on the Polygon blockchain. The NFTs are soul-bound (non-transferable) and serve as both collectibles and raffle entries for a prize drawing.

### Key Features

- **Gasless Claiming**: Users pay no transaction fees thanks to account abstraction
- **Soul-Bound NFTs**: Tokens cannot be transferred, ensuring fair lottery participation
- **Smart Wallet Integration**: Works exclusively with pre-issued Thirdweb smart accounts
- **Social Sharing**: Built-in sharing to LinkedIn, Twitter, Farcaster, and Bluesky
- **Real-Time Data**: Live contract data showing supply, drawing date, and countdown
- **Dark Mode**: Automatic theme detection with manual toggle
- **Internationalization**: English (bundled), Spanish, Chinese, Japanese (lazy-loaded)
- **Offline Support**: Service worker caches static assets for unreliable connectivity
- **Instant Load**: HTML loading skeleton renders before any JavaScript executes

## Technology Stack

- **Frontend**: React 19 with Vite 7
- **Web3**: Thirdweb v5 SDK
- **Blockchain**: Polygon mainnet (configurable)
- **Styling**: Tailwind CSS
- **Analytics**: Google Analytics 4
- **i18n**: i18next with HTTP backend for lazy loading
- **Deployment**: Vercel

## Smart Contract Details

- **Type**: ERC721 with soul-bound restrictions
- **Max Supply**: 10,000
- **Factory Address**: `0xD771615c873ba5a2149D5312448cE01D677Ee48A`
- **Network**: Configurable via `VITE_APP_NETWORK_NAME` (polygon, arbitrum, optimism, base, sepolia)

## Prerequisites

### For Users
- Must have a pre-existing smart wallet issued by polygon.ac/unicorn.eth
- Wallet must be created from the authorized factory address
- Access through authorized dapp domains only

### For Developers
- Node.js 18+
- npm
- Environment variables (see below)

## Installation

```bash
git clone [repository-url]
cd unicorn-vite
npm install --legacy-peer-deps
cp .env.example .env
```

## Environment Variables

Create a `.env` file:

```env
# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your_client_id_here
VITE_THIRDWEB_FACTORY_ADDRESS=0xD771615c873ba5a2149D5312448cE01D677Ee48A

# Smart Contract
VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS

# Network (polygon, arbitrum, optimism, base, sepolia)
VITE_APP_NETWORK_NAME=polygon

# Branding (all optional, have defaults)
VITE_APP_NAME=PolyPrize
VITE_APP_EMOJI=🦄
VITE_PLATFORM_NAME=unicorn.eth
VITE_PLATFORM_URL=https://polygon.ac
VITE_PRIZE_AMOUNT=$100
VITE_SHARE_URL=https://app.polygon.ac

# NFT Preview (optional — falls back to on-chain tokenURI)
VITE_NFT_IMAGE_URL=
VITE_NFT_IMAGE_ALT=NFT Preview
VITE_NFT_IMAGE_IS_VIDEO=false

# Social Handles (optional)
VITE_TWITTER_HANDLE=@MyUnicornAcct
VITE_FARCASTER_HANDLE=@unicornslfg
VITE_BLUESKY_HANDLE=@myunicornaccount

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Development

```bash
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Production build with bundle splitting + compression
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Project Structure

```
unicorn-vite/
├── public/
│   ├── sw.js                          # Service worker (cache-first static, network-first API)
│   ├── locales/
│   │   ├── es/translation.json        # Spanish (lazy-loaded)
│   │   ├── zh/translation.json        # Chinese (lazy-loaded)
│   │   └── ja/translation.json        # Japanese (lazy-loaded)
│   └── unicorn-logo*.{jpg,png}        # Favicons
├── src/
│   ├── App.jsx                        # Root component with ThirdwebProvider + AutoConnect
│   ├── main.jsx                       # React entry point
│   ├── i18n.js                        # i18next config (English bundled, others via HTTP backend)
│   ├── index.css                      # Tailwind + CSS custom properties
│   ├── components/
│   │   ├── Header.jsx                 # App header with title + NFT preview
│   │   ├── MintingInterface.jsx       # Core claiming UI + wallet cache integration
│   │   ├── NFTPreview.jsx             # NFT image/video with localStorage cache
│   │   ├── TopBar.jsx                 # Language selector + theme toggle (lazy-loaded)
│   │   ├── LanguageSelector.jsx       # Language dropdown
│   │   ├── ThemeToggle.jsx            # Dark/light mode toggle
│   │   └── SocialShareButton.jsx      # Social share buttons (lazy-loaded)
│   ├── config/
│   │   ├── thirdweb.config.js         # ThirdWeb client, chain, wallets, contract
│   │   └── theme.config.js            # Branding, colors, feature flags
│   ├── contexts/
│   │   └── ThemeContext.jsx            # Dark mode context provider
│   └── utils/
│       ├── analytics.js               # Google Analytics 4 event tracking
│       ├── walletCache.js             # Wallet session cache (XOR + base64, 24h TTL)
│       └── nftCache.js                # NFT metadata cache (localStorage, 7-day TTL)
├── index.html                         # Loading skeleton, preconnect hints, SW registration
├── vite.config.js                     # Bundle splitting + gzip/brotli compression
├── vercel.json                        # Cache headers + SPA rewrites
├── tailwind.config.js
└── package.json
```

## Mobile Performance Optimizations

This app is optimized for conference attendees on phones with limited WiFi.

### Bundle Splitting
Vite splits the build into cacheable chunks via `manualChunks`:
- `react-vendor` (~12 KB) — React + ReactDOM
- `thirdweb-core` (~404 KB) — ThirdWeb SDK core
- `thirdweb-react` (~1,278 KB) — ThirdWeb React components
- `i18n-vendor` (~63 KB) — i18next + language detector + HTTP backend
- `analytics` (~13 KB) — react-ga4
- App entry (~300 bytes) — just wiring

All chunks are pre-compressed with gzip and brotli via `vite-plugin-compression2`.

### Loading Performance
| Technique | What It Does |
|---|---|
| **HTML skeleton** | Branded loading UI renders with zero JS — title, pulsing NFT placeholder, disabled button |
| **Preconnect hints** | DNS + TLS handshake starts immediately for `embedded-wallet.thirdweb.com`, `rpc.thirdweb.com`, `ipfs.io` |
| **Wallet session cache** | Return visitors see their cached address instantly while ThirdWeb reconnects in background (24h TTL) |
| **NFT metadata cache** | NFT image URL cached in localStorage after first fetch — instant render on return visits (7-day TTL) |
| **i18n lazy loading** | Only English is bundled; es/zh/ja load on demand when the browser language matches |
| **Component lazy loading** | TopBar and SocialShareButton are lazy-loaded; Header and MintingInterface are eager |
| **Service worker** | Cache-first for static assets, network-first for API/RPC calls — works offline after first visit |
| **Immutable caching** | Vercel serves `/assets/*` with 1-year immutable cache (Vite hashes filenames) |

### Dark Mode
- Respects `prefers-color-scheme` system preference
- Manual toggle persisted in localStorage
- Loading skeleton also supports dark mode via inline CSS media query

## Architecture

### Authorization System
1. **AutoConnect Detection**: Only runs when URL contains `walletId=inApp&authCookie=...` or `autoConnect=true`
2. **Wallet Session Cache**: On return visits, shows cached address instantly with "Reconnecting..." indicator
3. **Factory Validation**: Wallets must be from the authorized factory
4. **15s Timeout**: Falls back to "unauthorized" state if connection fails

### Contract Integration
All contract interactions use explicit function signatures (ThirdWeb v5 requirement):

```javascript
const { data: hasMinted } = useReadContract({
  contract,
  method: "function hasMinted(address) view returns (bool)",
  params: [address]
});
```

### Caching Strategy

| Cache | Storage | TTL | Obfuscation |
|---|---|---|---|
| Wallet session | localStorage | 24 hours | XOR + base64 |
| NFT metadata | localStorage | 7 days | None (public data) |
| Static assets | Service worker | Until new SW version | N/A |
| API responses | Service worker | Network-first with fallback | N/A |

## Smart Contract Functions

### User Functions
- `mint()`: Claim one NFT per wallet (before drawing date, gasless)
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

## Deployment

### Vercel

1. Import GitHub repository in Vercel dashboard
2. Set **Root Directory**: `unicorn-vite`
3. Configure environment variables
4. Deploy

`vercel.json` handles build config, SPA rewrites, and cache headers automatically.

### Verification Checklist

- [ ] `npm run build` succeeds with no single chunk > 500 KB (excluding thirdweb-react)
- [ ] Loading skeleton appears immediately on page load (before JS)
- [ ] Skeleton disappears when React mounts
- [ ] Dark mode skeleton matches system preference
- [ ] Wallet cache: connect once, refresh — cached address shows instantly
- [ ] NFT cache: load once, go offline, refresh — image still appears
- [ ] Network tab (Slow 3G): chunks load in parallel
- [ ] Service worker registers after page load
- [ ] Non-English browser: translation loads on demand from `/locales/`
- [ ] Test on actual phone at conference WiFi

## Security

- **No private keys in client code** — all signing happens via smart accounts
- **Rate limiting** — 8-second cooldown between mint attempts
- **Input validation** — Address format checked before contract calls
- **Error sanitization** — Generic error messages, error codes logged (not full messages)
- **Wallet cache obfuscation** — XOR + base64 prevents casual DevTools reading (wallet addresses are public, but no reason to display plaintext)
- **Cache TTLs** — All cached data expires; stale data is discarded

## Troubleshooting

**AutoConnect Not Working**:
- Verify URL contains `walletId=inApp&authCookie=...` or `autoConnect=true`
- Check ThirdWeb client ID permissions in dashboard
- Ensure environment variables are set

**Slow Load on Conference WiFi**:
- Service worker should cache assets after first visit
- Check DevTools > Application > Service Workers for registration status
- Verify `Cache-Control` headers on `/assets/*` responses

**Build Errors**:
- Use `--legacy-peer-deps` flag for npm install
- Ensure Node.js 18+
- Run `npm run lint` to check for code issues

## License

This project is proprietary software for polygon.ac community use.

---

**Built with Thirdweb v5, React 19, Vite 7, Tailwind CSS, and deployed on Vercel**
