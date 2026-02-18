//Lovingly coded by @cryptowampum and Claude AI
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Trans } from 'react-i18next';
import { ThirdwebProvider, AutoConnect } from "thirdweb/react";
import { client, supportedWallets } from './config/thirdweb.config';
import { themeConfig } from './config/theme.config';
import { initGA, trackPageView, trackWalletConnection } from './utils/analytics';
import Header from './components/Header';
import MintingInterface from './components/MintingInterface';
import './index.css';

// Lazy-load non-critical UI controls
const TopBar = lazy(() => import('./components/TopBar'));

function App() {
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

    const hasAutoConnectParams = (
      (walletId === 'inApp' && authCookie) ||
      (autoConnect === 'true')
    );

    if (import.meta.env.DEV) {
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
      {shouldAutoConnect && (
        <AutoConnect
          client={client}
          wallets={supportedWallets}
          timeout={15000}
          onConnect={(wallet) => {
            console.log("🦄 AutoConnect successful:", wallet);
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
          <Suspense fallback={null}>
            <TopBar />
          </Suspense>
          <Header />
          <MintingInterface shouldAutoConnect={shouldAutoConnect} />
        </div>
        <footer className="text-center py-8 text-muted text-sm border-t border-default mt-8">
          <p className="mb-2">
            <Trans
              i18nKey="footer.broughtToYouBy"
              components={{ a: <a className="underline font-semibold hover:opacity-80" target="_blank" rel="noopener noreferrer" /> }}
            />
          </p>
          <p><Trans i18nKey="footer.copyright" /></p>
        </footer>
      </div>
    </ThirdwebProvider>
  );
}

export default App;
