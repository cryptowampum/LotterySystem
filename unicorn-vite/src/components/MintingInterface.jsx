import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract, clientId } from '../config/thirdweb.config';
import { themeConfig } from '../config/theme.config';
import {
  trackNFTClaim,
  trackAuthorizationCheck,
  trackDrawingInfo,
} from '../utils/analytics';
import { cacheWalletSession, getCachedWalletSession, clearWalletCache } from '../utils/walletCache';

const SocialShareButton = lazy(() => import('./SocialShareButton'));

const MINT_COOLDOWN = 8000;

export default function MintingInterface({ shouldAutoConnect }) {
  const { t } = useTranslation();
  const account = useActiveAccount();
  const address = account?.address;
  // Wallet cache: check for cached address on mount
  const cachedAddress = getCachedWalletSession();

  const [isAuthorizedUnicornWallet, setIsAuthorizedUnicornWallet] = useState(false);
  const [connectionState, setConnectionState] = useState(() => {
    if (cachedAddress && shouldAutoConnect) return "cached_reconnecting";
    if (shouldAutoConnect) return "checking";
    return "no_autoconnect";
  });
  const [mintStatus, setMintStatus] = useState("");
  const [countdown, setCountdown] = useState("");
  const [lastMintAttempt, setLastMintAttempt] = useState(0);

  // Contract read calls
  const { data: hasMinted, isLoading: checkingMinted } = useReadContract({
    contract,
    method: "function hasMinted(address) view returns (bool)",
    params: [address || "0x0000000000000000000000000000000000000000"],
  });

  const { data: totalSupply } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
  });

  const { data: maxSupply } = useReadContract({
    contract,
    method: "function MAX_SUPPLY() view returns (uint256)",
  });

  const { data: drawingDate } = useReadContract({
    contract,
    method: "function drawingDate() view returns (uint256)",
  });

  const { data: isMintingActive } = useReadContract({
    contract,
    method: "function isMintingActive() view returns (bool)",
  });

  const { data: isPaused } = useReadContract({
    contract,
    method: "function paused() view returns (bool)",
  });

  const { mutate: sendTransaction, isPending: isMinting } = useSendTransaction();

  // Authorization check
  useEffect(() => {
    if (account && address) {
      const isAuthorizedWallet = true;
      if (themeConfig.features.analyticsEnabled) {
        trackAuthorizationCheck(isAuthorizedWallet, 'smart_wallet');
      }
      setIsAuthorizedUnicornWallet(isAuthorizedWallet);
      setConnectionState("authorized");

      // Cache the wallet session for return visits
      cacheWalletSession(address);
    } else {
      setIsAuthorizedUnicornWallet(false);
      const timer = setTimeout(() => {
        if (!account) {
          if (themeConfig.features.analyticsEnabled) {
            trackAuthorizationCheck(false, 'no_wallet');
          }
          setConnectionState("unauthorized");
          clearWalletCache();
        }
      }, 15000);
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
      const transaction = prepareContractCall({
        contract,
        method: "function mint()",
        params: [],
      });

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
          console.error("Claiming failed:", error.code);
          setMintStatus(t('claim.transactionFailed'));
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

  // Cached reconnecting: show cached address instantly while ThirdWeb reconnects
  if (connectionState === "cached_reconnecting") {
    return (
      <div className="text-center">
        <div className="bg-surface-muted rounded-lg p-8 max-w-md mx-auto border border-default">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-base mb-4">🔄 {t('connection.lookingForWallet')}</h2>
            <p className="text-muted text-lg mb-4">
              {t('connection.connectingToWallet')}
            </p>
          </div>
          <div className="bg-surface border border-accent rounded-lg p-3 mt-4">
            <p className="text-primary text-sm font-semibold">✅ {t('connectionStatus.connected')}</p>
            <p className="text-sm text-muted">
              {cachedAddress?.slice(0, 6)}...{cachedAddress?.slice(-4)}
            </p>
            <p className="text-xs text-light mt-1">Reconnecting...</p>
          </div>
        </div>
      </div>
    );
  }

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
                <Trans
                  i18nKey="claim.alreadyClaimed"
                  values={{ appName: themeConfig.appName }}
                  components={{ a: <a className="underline font-semibold hover:opacity-80" target="_blank" rel="noopener noreferrer" />, br: <br /> }}
                /> 🎉
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
            <Suspense fallback={null}>
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
            </Suspense>
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
