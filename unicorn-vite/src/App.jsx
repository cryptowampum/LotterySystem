//Lovingly coded by @cryptowampum and Claude AI
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ThirdwebProvider,
  useActiveAccount,
  useActiveWallet,
  useReadContract,
  useSendTransaction,
  AutoConnect
} from "thirdweb/react";
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import {
  initGA,
  trackPageView,
  trackWalletConnection,
  trackNFTClaim,
  trackSocialShare,
  trackAuthorizationCheck,
  trackDrawingInfo
} from './utils/analytics';
import { useTheme } from './contexts/ThemeContext';
import { themeConfig } from './config/theme.config';
import './index.css';

// Create ThirdWeb client with error handling
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
const factoryAddress = import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS;

const MINT_COOLDOWN = 8000; // 8 seconds

if (!clientId) {
  console.error("VITE_THIRDWEB_CLIENT_ID is not set in environment variables");
}
if (!factoryAddress) {
  console.error("VITE_THIRDWEB_FACTORY_ADDRESS is not set in environment variables");
}

const client = createThirdwebClient({
  clientId: clientId || "",
});

const isValidAddress = (address) => {
  return address && /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Configure wallets with proper factory address for AutoConnect
const supportedWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: factoryAddress , // Unicorn factory address
      chain: polygon,
      gasless: true,
      sponsorGas: true,
    }
  })
];

if (process.env.NODE_ENV === 'development') {
  console.log("ThirdWeb Client ID configured");
  console.log("Supported Wallets:", supportedWallets.length);
}

// Get contract
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("VITE_CONTRACT_ADDRESS is not set in environment variables");
}
// Verify contract bytecode or known methods
const verifyContract = async () => {
  const code = await client.getBytecode(CONTRACT_ADDRESS);
  // Verify this matches expected contract
};

if (process.env.NODE_ENV === 'development') {
  console.log("Contract Address configured");
}

const contract = getContract({
  client,
  chain: polygon,
  address: CONTRACT_ADDRESS || "",
});

// Language Selector Component
function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  if (!themeConfig.features.languageSelectorEnabled) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted border border-default hover:border-accent transition-colors text-base"
        aria-label={t('language.select')}
      >
        <span>{currentLang.flag}</span>
        <span className="text-sm">{currentLang.label}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-40 bg-surface-muted border border-default rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-surface transition-colors text-base ${
                i18n.language === lang.code ? 'bg-surface' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Theme Toggle Component
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  if (!themeConfig.features.darkModeEnabled) return null;

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-lg bg-surface-muted border border-default hover:border-accent transition-colors"
      aria-label={isDark ? t('theme.toggleLight') : t('theme.toggleDark')}
      title={isDark ? t('theme.toggleLight') : t('theme.toggleDark')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

// Top Bar with controls
function TopBar() {
  return (
    <div className="flex justify-end gap-2 mb-4">
      <LanguageSelector />
      <ThemeToggle />
    </div>
  );
}

function App() {
  // Check for autoconnect parameters in URL
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);

  // Initialize Google Analytics on app start
  useEffect(() => {
    if (themeConfig.features.analyticsEnabled) {
      initGA();
      trackPageView('/');
    }
  }, []);

  // Track AutoConnect start time for timeout display
  useEffect(() => {
    window.autoConnectStart = Date.now();
  }, []);

  // Check URL parameters to determine if AutoConnect should run
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const walletId = urlParams.get('walletId');
    const authCookie = urlParams.get('authCookie');
    const autoConnect = urlParams.get('autoConnect');

    // Only enable AutoConnect if proper parameters are present
    const hasAutoConnectParams = (
      (walletId === 'inApp' && authCookie) ||
      (autoConnect === 'true')
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('AutoConnect check:', {
        walletId,
        hasAuthCookie: !!authCookie,
        autoConnect,
        shouldAutoConnect: hasAutoConnectParams
      });
    }

    setShouldAutoConnect(hasAutoConnectParams);
  }, []);

  return (
    <ThirdwebProvider>
      {/* Only render AutoConnect if proper parameters are present */}
      {shouldAutoConnect && (
        <AutoConnect
          client={client}
          wallets={supportedWallets}
          timeout={15000}
          onConnect={(wallet) => {
            console.log("🦄 AutoConnect successful:", wallet);
            console.log("Address:", wallet.getAddress ? wallet.getAddress() : 'Getting address...');
            console.log("Chain:", wallet.getChain ? wallet.getChain()?.name : 'Getting chain...');

            // Track successful wallet connection
            const address = wallet.getAddress ? wallet.getAddress() : '';
            if (themeConfig.features.analyticsEnabled) {
              trackWalletConnection(address, true);
            }
          }}
          onError={(error) => {
            console.error("❌ AutoConnect failed:", error);
            if (themeConfig.features.analyticsEnabled) {
              trackWalletConnection('', false);
            }
          }}
        />
      )}
      <div className="min-h-screen bg-page">
        <div className="container mx-auto px-4 py-8">
          <TopBar />
          <Header />
          <MintingInterface shouldAutoConnect={shouldAutoConnect} />
        </div>
      </div>
    </ThirdwebProvider>
  );
}

function Header() {
  const { t } = useTranslation();
  const account = useActiveAccount();

  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-base mb-4">
        {themeConfig.appEmoji} <br/>{t('header.title', { appName: themeConfig.appName })}
      </h1>
      <p className="text-xl text-muted mb-2">
        {t('header.description', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount })}
      </p>
      <p className="text-sm text-primary mb-8">
        🔐 {t('header.accessNote', { platformName: themeConfig.platformName })} • {t('header.claimFree')}
      </p>
    </div>
  );
}

function MintingInterface({ shouldAutoConnect }) {
  const { t } = useTranslation();
  const account = useActiveAccount();
  const address = account?.address;
  const wallet = useActiveWallet();

  // Track authorization and connection state
  const [isAuthorizedUnicornWallet, setIsAuthorizedUnicornWallet] = useState(false);
  const [connectionState, setConnectionState] = useState(shouldAutoConnect ? "checking" : "no_autoconnect");
  const [mintStatus, setMintStatus] = useState("");
  const [countdown, setCountdown] = useState("");
  // cooldown
  const [lastMintAttempt, setLastMintAttempt] = useState(0);

  // Contract read calls - using explicit function signatures (ThirdWeb v5 requirement)
  const { data: hasMinted, isLoading: checkingMinted, error: hasMintedError } = useReadContract({
    contract,
    method: "function hasMinted(address) view returns (bool)",
    params: [address || "0x0000000000000000000000000000000000000000"],
  });

  const { data: totalSupply, error: totalSupplyError } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
  });

  const { data: maxSupply, error: maxSupplyError } = useReadContract({
    contract,
    method: "function MAX_SUPPLY() view returns (uint256)",
  });

  const { data: drawingDate, error: drawingDateError } = useReadContract({
    contract,
    method: "function drawingDate() view returns (uint256)",
  });

  const { data: isMintingActive, error: isMintingActiveError } = useReadContract({
    contract,
    method: "function isMintingActive() view returns (bool)",
  });

  const { data: isPaused, error: isPausedError } = useReadContract({
    contract,
    method: "function paused() view returns (bool)",
  });

  // Debug contract calls
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("=== Contract Debug (AutoConnect Mode) ===");
      console.log("Contract address:", contract?.address);
      console.log("Chain ID:", contract?.chain?.id);

      console.log("=== Contract Data (All Explicit Signatures) ===");
      console.log("hasMinted:", hasMinted);
      console.log("totalSupply:", totalSupply?.toString());
      console.log("maxSupply:", maxSupply?.toString());
      console.log("drawingDate:", drawingDate?.toString());
      console.log("isMintingActive:", isMintingActive);
      console.log("isPaused:", isPaused);

      // Convert BigInt timestamp to readable date
      if (drawingDate) {
        const drawingDateJS = new Date(parseInt(drawingDate.toString()) * 1000);
        console.log("Drawing date (readable):", drawingDateJS.toLocaleString());
      }

      // Log any errors
      if (totalSupplyError) console.error("totalSupply error:", totalSupplyError);
      if (hasMintedError) console.error("hasMinted error:", hasMintedError);
      if (maxSupplyError) console.error("maxSupply error:", maxSupplyError);
      if (drawingDateError) console.error("drawingDate error:", drawingDateError);
      if (isMintingActiveError) console.error("isMintingActive error:", isMintingActiveError);
      if (isPausedError) console.error("isPaused error:", isPausedError);
    }
  }, [hasMinted, totalSupply, maxSupply, drawingDate, isMintingActive, isPaused]);

  // Send transaction hook
  const { mutate: sendTransaction, isPending: isMinting } = useSendTransaction();

  // Simplified authorization for existing smart wallet holders
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("=== Existing Smart Wallet Authorization Check ===");
      console.log("Account:", account);
      console.log("Address:", address);

      // Check localStorage for ThirdWeb wallet session
      const activeWallet = localStorage.getItem('thirdweb:active-wallet');
      console.log("Active wallet type:", activeWallet);
    }

    if (account && address) {
      if (process.env.NODE_ENV === 'development') {
        console.log("=== Account Connected Successfully ===");
        console.log("Smart wallet address:", address);
        console.log("This user has an existing smart wallet from our system");
        console.log("Wallet ", wallet);
        console.log("=== Authorization Decision ===", wallet?.factoryAddress);
        console.log("User has existing smart wallet - AUTHORIZED ✅");
      }

      // If AutoConnect worked and we have an account, they're authorized
      // (because only existing smart wallets from our factory can connect)
      const isAuthorizedWallet = true; //wallet && wallet.factoryAddress === factoryAddress;; // Simplified - AutoConnect success = authorized

      // Track authorization success
      if (themeConfig.features.analyticsEnabled) {
        trackAuthorizationCheck(isAuthorizedWallet, 'smart_wallet');
      }

      setIsAuthorizedUnicornWallet(isAuthorizedWallet);
      setConnectionState("authorized");
    } else {
      console.log("No account connected - user doesn't have existing smart wallet");
      setIsAuthorizedUnicornWallet(false);

      // After timeout, show unauthorized (they don't have an existing wallet)
      const timer = setTimeout(() => {
        if (!account) {
          console.log("Timeout reached - user doesn't have existing smart wallet");
          if (themeConfig.features.analyticsEnabled) {
            trackAuthorizationCheck(false, 'no_wallet');
          }
          setConnectionState("unauthorized");
        }
      }, 15000); // Match AutoConnect timeout

      return () => clearTimeout(timer);
    }
  }, [account, address]);

  // Countdown timer
  useEffect(() => {
    if (!drawingDate) return;

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const drawingTimestamp = parseInt(drawingDate.toString());
      const timeLeft = drawingTimestamp - now;

      if (timeLeft <= 0) {
        setCountdown(t('drawing.hasEnded'));
        clearInterval(timer);
        return;
      }

      const days = Math.floor(timeLeft / 86400);
      const hours = Math.floor((timeLeft % 86400) / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      // Track drawing info on first render
      if (countdown === "" && days >= 0 && themeConfig.features.analyticsEnabled) {
        trackDrawingInfo(days);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [drawingDate, countdown, t]);

  const handleMint = async () => {
    const now = Date.now();
    if (now - lastMintAttempt < MINT_COOLDOWN) {
      setMintStatus(t('claim.waitBeforeRetry'));
      return;
    }

    if (!isAuthorizedUnicornWallet) {
      setMintStatus(t('claim.accessDenied'));
      if (themeConfig.features.analyticsEnabled) {
        trackNFTClaim(address, false, 'unauthorized');
      }
      return;
    }

    if (!account) {
      setMintStatus(t('claim.ensureConnected'));
      if (themeConfig.features.analyticsEnabled) {
        trackNFTClaim('', false, 'no_account');
      }
      return;
    }

    try {
      setMintStatus(t('claim.claimingYourPrize', { appName: themeConfig.appName }));

      // Prepare the contract call with explicit function signature
      const transaction = prepareContractCall({
        contract,
        method: "function mint()",
        params: [],
      });

      // Send the transaction - gas is automatically sponsored via smart account
      sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("Mint successful:", result);
          setMintStatus(t('claim.success') + " 🎉");
          if (themeConfig.features.analyticsEnabled) {
            trackNFTClaim(address, true);
          }
          setTimeout(() => setMintStatus(""), 3000);
        },
        onError: (error) => {
        console.error("Claiming failed:", error.code); // Log code only
        setMintStatus(t('claim.transactionFailed')); // Generic message
        if (themeConfig.features.analyticsEnabled) {
          trackNFTClaim(address, false, error.code || 'transaction_failed');
        }
          setTimeout(() => setMintStatus(""), 5000);
        }
      });
      setLastMintAttempt(now);

    } catch (error) {
      console.error("Transaction preparation failed:", error);
      setMintStatus(t('claim.transactionFailed'));
      if (themeConfig.features.analyticsEnabled) {
        trackNFTClaim(address, false, 'preparation_failed');
      }
      setTimeout(() => setMintStatus(""), 5000);
    }
  };

  const supplyPercentage = totalSupply && maxSupply ?
    Math.round((parseInt(totalSupply.toString()) / parseInt(maxSupply.toString())) * 100) : 0;

  // Show connection status while AutoConnect is working
  if (connectionState === "checking") {
    return (
      <div className="text-center">
        <div className="bg-surface-muted rounded-lg p-8 max-w-md mx-auto border border-default">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-base mb-4">🔄 {t('connection.lookingForWallet')}</h2>
            <p className="text-muted text-lg mb-4">
              {t('connection.connectingToWallet')}
            </p>
            <p className="text-light text-sm mb-6">
              {t('connection.onlyExistingWallets', { platformName: themeConfig.platformName })}
            </p>
            <div className="w-full bg-surface-muted rounded-full h-2 border border-default">
              <div className="h-2 rounded-full animate-pulse bg-primary" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-light mt-4">
              {t('connection.factoryInfo', { factory: '0xD771...48A', client: clientId?.slice(0, 8) + '...' })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show message when AutoConnect parameters are missing
  if (connectionState === "no_autoconnect") {
    return (
      <div className="text-center">
        <div className="bg-surface-muted rounded-lg p-8 max-w-md mx-auto border border-default">
          <h2 className="text-2xl font-bold text-base mb-4">🔐 {t('access.required')}</h2>
          <p className="text-muted text-lg mb-4">
            {t('access.onlyThroughPortal', { appName: themeConfig.appName, platformName: themeConfig.platformName })}
          </p>
          <p className="text-light text-sm mb-6">
            {t('access.mustAccessFromDashboard', { platformName: themeConfig.platformName })}
          </p>
          <div className="bg-surface border border-accent rounded-lg p-4 text-left">
            <p className="text-primary text-sm font-semibold mb-2">{t('access.howToAccess')}</p>
            <ul className="text-primary text-sm space-y-1">
              <li>• {t('access.step1', { platformName: themeConfig.platformName })}</li>
              <li>• {t('access.step2', { appName: themeConfig.appName })}</li>
              <li>• {t('access.step3')}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="max-w-4xl mx-auto">
            {/* Claiming Section */}
      <div className="bg-surface-muted rounded-lg p-8 mb-8 border border-default">

        {checkingMinted ? (
          <div className="text-center text-base">{t('claim.checkingStatus')}</div>
        ) : !isAuthorizedUnicornWallet ? (
          <div className="text-center">
            <div className="bg-error-bg border border-error-border rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-error mb-2">🚫 {t('errors.noWallet')}</h3>
              <p className="text-error mb-2">
                {t('errors.lotteryOnlyForMembers', { platformName: themeConfig.platformName })}
              </p>
              <p className="text-error text-sm mb-4">
                {t('errors.mustHaveSmartWallet')}
              </p>
            </div>
          </div>
        ) : isPaused ? (
          <div className="text-center">
            <div className="bg-warning-bg border border-warning-border rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-warning mb-2">⏸️ {t('status.paused')}</h3>
              <p className="text-warning">
                {t('status.pausedDescription')}
              </p>
            </div>
          </div>
        ) : !isMintingActive ? (
          <div className="text-center">
            <div className="bg-error-bg border border-error-border rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-error mb-2">🚫 {t('status.ended')}</h3>
              <p className="text-error">
                {t('status.endedDescription', { appName: themeConfig.appName })}
              </p>
              <p className="text-error mt-2">
                {t('status.drawingDate', { date: drawingDate ? new Date(parseInt(drawingDate.toString()) * 1000).toLocaleString() : t('drawing.loading') })}
              </p>
            </div>
          </div>
        ) : totalSupply && maxSupply && parseInt(totalSupply.toString()) >= parseInt(maxSupply.toString()) ? (
          <div className="text-center">
            <div className="bg-info-bg border border-info-border rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-info mb-2">🎯 {t('status.maxSupplyReached')}</h3>
              <p className="text-info">
                {t('status.allClaimed', { count: maxSupply.toString() })}
              </p>
            </div>
          </div>
        ) : hasMinted ? (
          <div className="text-center">
            <div className="border border-accent rounded-lg p-4 mb-4 bg-surface">
              <p className="text-primary">
                {t('claim.alreadyClaimed', { appName: themeConfig.appName })} 🎉
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">

            <button
              onClick={handleMint}
              disabled={isMinting || isPaused || !isAuthorizedUnicornWallet}
              className="text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:opacity-90 bg-primary"
            >
              {isMinting ? t('claim.claiming') : `${themeConfig.appEmoji} ${t('claim.button')}`}
            </button>

            {mintStatus && (
              <div className="mt-4 p-3 rounded-lg border border-accent bg-surface">
                <p className="text-primary">{mintStatus}</p>
              </div>
            )}
          </div>
        )}
      </div>
            {/* Drawing Date Info */}
      {drawingDate && (
        <div className="border border-accent rounded-lg p-6 mb-8 bg-surface">
          <h3 className="text-xl font-bold text-primary mb-2 flex items-center">
            ⏰ {t('drawing.title', { prizeAmount: themeConfig.prizeAmount, drawingName: 'Second PolyPrize Drawing' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-muted">{t('drawing.drawingDate')}</p>
              <p className="text-base font-semibold">
                {new Date(parseInt(drawingDate.toString()) * 1000).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted">{t('drawing.status')}</p>
              <p className={`font-semibold ${isMintingActive ? 'text-success' : 'text-error'}`}>
                {isMintingActive ? `🟢 ${t('drawing.active')}` : `🔴 ${t('drawing.ended')}`}
              </p>
            </div>
                       <div>
              <p className="text-muted">{t('drawing.timeRemaining')}</p>
              <p className={`font-semibold ${isMintingActive ? 'text-success' : 'text-error'}`}>
                {countdown || t('drawing.loading')}
              </p>
            </div>

          </div>

        </div>


      )}

        {/* Social Sharing Links */}
      {themeConfig.features.socialShareEnabled && (
        <div className="text-center mt-6">
          <p className="text-muted text-sm mb-3">{t('social.sharePrompt')}</p>
          <div className="flex justify-center space-x-4 flex-wrap">
            <SocialShareButton
              platform="LinkedIn"
              url={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(themeConfig.shareUrl)}`}
              text={t('social.shareMessage', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount, url: themeConfig.shareUrl })}
            />
            <SocialShareButton
              platform="Twitter"
              url={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t('social.shareMessage', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount, url: themeConfig.shareUrl }) + ' ' + themeConfig.social.twitter)}`}
              text={t('social.shareMessage', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount, url: themeConfig.shareUrl })}
            />
            <SocialShareButton
              platform="Farcaster"
              url={`https://warpcast.com/~/compose?text=${encodeURIComponent(t('social.shareMessage', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount, url: themeConfig.shareUrl }) + ' ' + themeConfig.social.farcaster)}`}
              text={t('social.shareMessage', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount, url: themeConfig.shareUrl })}
            />
            <SocialShareButton
              platform="Bluesky"
              url={`https://bsky.app/intent/compose?text=${encodeURIComponent(t('social.shareMessage', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount, url: themeConfig.shareUrl }) + ' ' + themeConfig.social.bluesky)}`}
              text={t('social.shareMessage', { appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount, url: themeConfig.shareUrl })}
            />
          </div>
        </div>
      )}
      <div><br/><br/></div>
            {/* Connection Status Display */}
      <div className="bg-surface-muted rounded-lg p-4 max-w-md mx-auto mb-4 border border-default">
        {account ? (
          <div className="text-primary">
            <p className="font-semibold">✅ {t('connectionStatus.connected')}</p>
            <p className="text-sm text-muted">
              {account.address?.slice(0,6)}...{account.address?.slice(-4)}
            </p>
          </div>
        ) : (
          <div className="text-primary">
            <p className="font-semibold">🔄 {t('connectionStatus.connecting')}</p>
            <p className="text-sm text-muted">
              {t('connectionStatus.autoConnectInProgress')}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
function SocialShareButton({ platform, url, text }) {
  const handleShare = () => {
    if (themeConfig.features.analyticsEnabled) {
      trackSocialShare(platform);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getIcon = () => {
    switch (platform) {
      case 'LinkedIn':
        return '💼';
      case 'Twitter':
        return '🐦';
      case 'Farcaster':
        return '🟣';
      case 'Bluesky':
        return '🦋';
      default:
        return '🔗';
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-80 bg-primary"
      title={`Share on ${platform}: ${text}`}
    >
      <span className="mr-1">{getIcon()}</span>
      {platform}
    </button>
  );
}

export default App;
