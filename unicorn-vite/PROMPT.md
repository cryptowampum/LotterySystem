# Unicorn.eth Lottery - Implementation Reference

## Project Overview
A **production-ready soul-bound NFT claiming dapp** for the Unicorn.eth Lottery system. **Vite React app** using **ThirdWeb v5**, deployed on **Arbitrum** (configurable) with **paid or gasless minting**. Optimized for conference mobile performance with unreliable WiFi.

## Production Status

- **Deployment**: https://app.arbitrum.ac (Vercel)
- **Network**: Arbitrum (Chain ID: 42161), configurable via env
- **Contract**: ERC721 soul-bound with mint price
- **Factory**: `0xD771615c873ba5a2149D5312448cE01D677Ee48A`
- **Version**: `GET /version.json` — auto-generated from package.json

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | Vite 7 + React 19 |
| Web3 | ThirdWeb v5 (single `thirdweb` package) |
| Styling | Tailwind CSS 3.4 |
| i18n | i18next + HTTP backend (English bundled, es/zh/ja lazy-loaded) |
| Analytics | Google Analytics 4 (react-ga4) + Vercel Analytics (@vercel/analytics) |
| Hosting | Vercel with cache headers |

## Architecture

### File Structure
```
src/
├── App.jsx                    # Root: ThirdwebProvider, AutoConnect, lazy TopBar, Vercel Analytics
├── main.jsx                   # Entry: StrictMode, ThemeProvider
├── i18n.js                    # English bundled, others via i18next-http-backend
├── index.css                  # Tailwind + CSS custom properties for theming
├── components/
│   ├── Header.jsx             # Title, description, NFTPreview (eager)
│   ├── MintingInterface.jsx   # Claiming logic + wallet cache + mint price detection (eager)
│   ├── NFTPreview.jsx         # NFT image with localStorage cache (eager)
│   ├── TopBar.jsx             # LanguageSelector + ThemeToggle (lazy)
│   ├── LanguageSelector.jsx   # 4-language dropdown
│   ├── ThemeToggle.jsx        # Dark/light toggle
│   └── SocialShareButton.jsx  # Platform share buttons (lazy)
├── config/
│   ├── thirdweb.config.js     # Client, chain, wallets, contract exports
│   └── theme.config.js        # Branding, colors, feature flags (env-driven)
├── contexts/
│   └── ThemeContext.jsx        # Dark mode with system preference detection
└── utils/
    ├── analytics.js           # GA4 event tracking
    ├── walletCache.js         # XOR+base64 obfuscated wallet session (24h TTL)
    └── nftCache.js            # NFT metadata cache (7-day TTL)

public/
├── sw.js                      # Service worker: cache-first static, network-first API
├── version.json               # Auto-generated: { service, version } (gitignored)
└── locales/{es,zh,ja}/        # Lazy-loaded translation files

index.html                     # Loading skeleton, preconnect hints, SW registration
vite.config.js                 # manualChunks splitting, gzip/brotli compression, version.json generation
vercel.json                    # Cache headers (immutable assets, 24h locales, no-cache SW)
```

### Authorization Flow
```
URL params check
  ├── No params → "Access Required" screen
  └── walletId=inApp&authCookie=... OR autoConnect=true
       ├── Cached wallet? → Show cached address + "Reconnecting..."
       └── No cache → "Looking for Wallet..." spinner
            ├── AutoConnect success → "authorized", cache wallet
            └── 15s timeout → "unauthorized", clear cache
```

### Connection States
| State | Trigger | UI |
|---|---|---|
| `no_autoconnect` | No URL params | Access Required instructions |
| `cached_reconnecting` | Has cached wallet + URL params | Cached address shown, reconnecting indicator |
| `checking` | URL params, no cache | Loading spinner |
| `authorized` | AutoConnect succeeds | Claim interface |
| `unauthorized` | 15s timeout | No Wallet Found |

## Mint Price Detection

MintingInterface reads three common price functions from the contract:
```javascript
const { data: mintPrice } = useReadContract({ contract, method: "function mintPrice() view returns (uint256)" });
const { data: price }     = useReadContract({ contract, method: "function price() view returns (uint256)" });
const { data: cost }      = useReadContract({ contract, method: "function cost() view returns (uint256)" });

const resolvedMintPrice = mintPrice ?? price ?? cost ?? 0n;

// Passed as value in prepareContractCall
prepareContractCall({ contract, method: "function mint()", params: [], value: resolvedMintPrice });
```

If all three return nothing, the mint is sent with zero value (free/gasless).

## Mobile Performance Optimizations

### Bundle Splitting (vite.config.js)
```
react-vendor      ~12 KB    React + ReactDOM
thirdweb-core     ~404 KB   ThirdWeb SDK core
thirdweb-react    ~1,278 KB ThirdWeb React UI components
i18n-vendor       ~63 KB    i18next ecosystem
analytics         ~13 KB    react-ga4
App entry         ~300 B    Wiring only
```
All pre-compressed with gzip + brotli via `vite-plugin-compression2`.

### Caching Layers
| Layer | Strategy | TTL |
|---|---|---|
| Wallet session | localStorage, XOR+base64 obfuscated | 24 hours |
| NFT metadata | localStorage, plaintext JSON | 7 days |
| Static assets | Service worker, cache-first | Until SW version change |
| API/RPC calls | Service worker, network-first + cache fallback | Per response |
| Vite assets | HTTP `Cache-Control: immutable` | 1 year |
| Locales | HTTP `Cache-Control: public` | 24 hours |
| SW itself | HTTP `Cache-Control: no-cache` | Always fresh |

### Zero-JS First Paint (index.html)
- Inline CSS + branded skeleton (title, pulsing NFT placeholder, disabled button)
- `prefers-color-scheme: dark` support in inline CSS
- `<link rel="preconnect">` for ThirdWeb and IPFS origins
- Skeleton auto-hides via `#root:not(:empty)` CSS selector when React mounts
- Service worker registered on `window.load` (doesn't block paint)

## Analytics

### Google Analytics 4
Configured via `VITE_GA_MEASUREMENT_ID`. Tracks: page views, wallet connections, authorization checks, NFT claims, social shares, drawing countdown views.

### Vercel Analytics
`<Analytics />` from `@vercel/analytics/react` in `App.jsx`. Automatic page views + Web Vitals. Data appears in Vercel dashboard Analytics tab. No configuration needed.

## Version Endpoint

`GET /version.json` returns `{ "service": "unicorn-vite", "version": "1.0.1" }`.

Generated by `vite.config.js` from `package.json` on every build/dev startup. The `__APP_VERSION__` global constant is available in app code. The file is gitignored (`**/public/version.json`).

## ThirdWeb v5 Requirements

```javascript
// Correct imports — always from sub-paths
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { ThirdwebProvider, useActiveAccount, useReadContract } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { arbitrum } from "thirdweb/chains";

// Contract calls MUST use explicit function signatures
const { data } = useReadContract({
  contract,
  method: "function totalSupply() view returns (uint256)", // NOT just "totalSupply"
});

// Gas sponsorship via smartAccount config, NOT manual calls
const wallets = [inAppWallet({
  smartAccount: { factoryAddress, chain, gasless: true, sponsorGas: true }
})];

// Paid mint — pass value from resolved price
prepareContractCall({ contract, method: "function mint()", params: [], value: resolvedMintPrice });
```

## Environment Variables

All prefixed with `VITE_` (Vite requirement).

| Variable | Required | Default |
|---|---|---|
| `VITE_THIRDWEB_CLIENT_ID` | Yes | — |
| `VITE_THIRDWEB_FACTORY_ADDRESS` | Yes | — |
| `VITE_CONTRACT_ADDRESS` | Yes | — |
| `VITE_APP_NETWORK_NAME` | No | `polygon` |
| `VITE_APP_NAME` | No | `Unicorn Lottery` |
| `VITE_DRAWING_NAME` | No | `Unicorn Lottery` |
| `VITE_APP_EMOJI` | No | `🦄` |
| `VITE_PLATFORM_NAME` | No | `unicorn.eth` |
| `VITE_PLATFORM_URL` | No | `https://app.arbitrum.ac` |
| `VITE_PRIZE_AMOUNT` | No | — |
| `VITE_SHARE_URL` | No | `https://app.arbitrum.ac` |
| `VITE_NFT_IMAGE_URL` | No | Falls back to on-chain tokenURI |
| `VITE_GA_MEASUREMENT_ID` | No | Disables GA4 |

## Smart Contract Interface

```solidity
// User functions
function mint() external payable                      // May require payment (auto-detected)
function hasMinted(address) view returns (bool)
function totalSupply() view returns (uint256)

// Price functions (auto-detected — whichever exists)
function mintPrice() view returns (uint256)
function price() view returns (uint256)
function cost() view returns (uint256)

// View functions
function MAX_SUPPLY() view returns (uint256)
function drawingDate() view returns (uint256)           // Unix timestamp
function isMintingActive() view returns (bool)
function paused() view returns (bool)
function tokenURI(uint256) view returns (string)

// Admin functions
function pause() / unpause()
function setDrawingDate(uint256)                       // Can only increase
function updateBaseURI(string)
function withdrawETH()
```

## Deployment

### Vercel Config (vercel.json)
- Build: `npm run build` → `dist/`
- Install: `npm install --legacy-peer-deps`
- SPA: `/(.*) → /index.html`
- Cache: `/assets/*` immutable 1yr, `/locales/*` 24h, `/sw.js` no-cache

### Build Verification
```bash
npm run build
# Confirm: multiple chunks, app entry < 1 KB, no errors
# Confirm: .gz and .br files generated for all assets
# Confirm: dist/version.json exists with correct version
```

## Critical Lessons

1. **ThirdWeb v5**: Always explicit function signatures, always `--legacy-peer-deps`, imports from `thirdweb/*` sub-paths
2. **Vite**: `VITE_` prefix for env vars, `import.meta.env.DEV` not `process.env.NODE_ENV`
3. **Conference WiFi**: Cache everything possible, skeleton for instant paint, service worker for offline
4. **Wallet cache**: XOR obfuscation is appropriate for public addresses — prevents casual reading without crypto overhead
5. **i18n**: Bundle only the fallback language, lazy-load the rest
6. **Paid mint**: Always read the contract's price function and pass `value` — `InsufficientPayment` revert means a price is required
7. **Version endpoint**: Auto-generate `public/version.json` from `package.json` in vite config — gitignore it

---

**Last Updated**: February 2026
**Status**: Production — optimized for ETHDenver 2026
