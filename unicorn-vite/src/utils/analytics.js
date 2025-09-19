import ReactGA from 'react-ga4';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (MEASUREMENT_ID && typeof window !== 'undefined') {
    ReactGA.initialize(MEASUREMENT_ID, {
      gtagOptions: {
        send_page_view: false // We'll send page views manually
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Google Analytics initialized:', MEASUREMENT_ID);
    }
  }
};

// Track page views
export const trackPageView = (path) => {
  if (MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// Track custom events
export const trackEvent = (action, category = 'engagement', label = '', value = 0) => {
  if (MEASUREMENT_ID) {
    ReactGA.event({
      action,
      category,
      label,
      value
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('GA Event:', { action, category, label, value });
    }
  }
};

// Specific tracking functions for your dapp
export const trackWalletConnection = (address, success = true) => {
  trackEvent(
    success ? 'wallet_connected' : 'wallet_connection_failed',
    'wallet',
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'unknown'
  );
};

export const trackNFTClaim = (address, success = true, error = '') => {
  trackEvent(
    success ? 'nft_claimed' : 'nft_claim_failed',
    'nft',
    error || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'unknown')
  );
};

export const trackSocialShare = (platform) => {
  trackEvent('social_share', 'engagement', platform);
};

export const trackContractInteraction = (method, success = true) => {
  trackEvent(
    `contract_${method}`,
    'contract',
    success ? 'success' : 'failed'
  );
};

export const trackAuthorizationCheck = (authorized, walletType = '') => {
  trackEvent(
    authorized ? 'authorization_success' : 'authorization_failed',
    'security',
    walletType
  );
};

export const trackDrawingInfo = (daysRemaining) => {
  trackEvent('drawing_info_viewed', 'engagement', `${daysRemaining}_days_remaining`);
};