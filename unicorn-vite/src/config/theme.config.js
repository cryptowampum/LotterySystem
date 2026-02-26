// Theme and branding configuration
// Customize these values to white-label the dapp

export const themeConfig = {
  // App Branding - can be overridden via environment variables
  drawingName: import.meta.env.VITE_DRAWING_NAME || 'Unicorn Lottery',
  appName: import.meta.env.VITE_APP_NAME || 'Unicorn Lottery',
  appEmoji: import.meta.env.VITE_APP_EMOJI || '🦄',
  platformName: import.meta.env.VITE_PLATFORM_NAME || 'unicorn.eth',
  platformUrl: import.meta.env.VITE_PLATFORM_URL || 'https://app.arbitrum.ac',
  prizeAmount: import.meta.env.VITE_PRIZE_AMOUNT,
  shareUrl: import.meta.env.VITE_SHARE_URL || 'https://app.arbitrum.ac',
  additionalInstructions: import.meta.env.VITE_ADDITIONAL_INSTRUCTIONS || '',
  // NFT Image (supports static images, GIFs, and videos)
  nftImage: {
    url: import.meta.env.VITE_NFT_IMAGE_URL || '',
    alt: import.meta.env.VITE_NFT_IMAGE_ALT || 'NFT Preview',
    isVideo: import.meta.env.VITE_NFT_IMAGE_IS_VIDEO === 'true',
  },

  // Social handles for sharing
  social: {
    twitter: import.meta.env.VITE_TWITTER_HANDLE || '@MyUnicornAcct',
    farcaster: import.meta.env.VITE_FARCASTER_HANDLE || '@unicornslfg',
    bluesky: import.meta.env.VITE_BLUESKY_HANDLE || '@myunicornaccount',
  },

  // Colors (CSS custom properties)
  colors: {
    light: {
      primary: '#A83DCC',        // Main brand color (purple)
      primaryHover: '#9333EA',   // Hover state
      secondary: '#5B21B6',      // Secondary accent
      background: '#FFFFFF',     // Page background
      surface: '#FBE9FB',        // Card/highlight backgrounds
      surfaceMuted: '#F3F4F6',   // Gray card backgrounds (gray-100)
      border: '#E5E7EB',         // Default borders (gray-200)
      borderAccent: '#D8B4FE',   // Purple borders (purple-300)
      text: '#1F2937',           // Primary text (gray-800)
      textMuted: '#374151',      // Secondary text (gray-700)
      textLight: '#6B7280',      // Light text (gray-500)
      success: '#15803D',        // Success text (green-700)
      successBg: '#DCFCE7',      // Success background (green-100)
      successBorder: '#86EFAC',  // Success border (green-300)
      warning: '#A16207',        // Warning text (yellow-700)
      warningBg: '#FEF9C3',      // Warning background (yellow-100)
      warningBorder: '#FDE047',  // Warning border (yellow-300)
      error: '#991B1B',          // Error text (red-800)
      errorBg: '#FEE2E2',        // Error background (red-100)
      errorBorder: '#FCA5A5',    // Error border (red-300)
      info: '#9A3412',           // Info text (orange-800)
      infoBg: '#FFEDD5',         // Info background (orange-100)
      infoBorder: '#FDBA74',     // Info border (orange-300)
    },
    dark: {
      primary: '#C084FC',        // Lighter purple for dark mode
      primaryHover: '#A855F7',   // Hover state
      secondary: '#7C3AED',      // Secondary accent
      background: '#111827',     // Page background (gray-900)
      surface: '#2D1F3D',        // Card/highlight backgrounds (purple tint)
      surfaceMuted: '#1F2937',   // Gray card backgrounds (gray-800)
      border: '#374151',         // Default borders (gray-700)
      borderAccent: '#7C3AED',   // Purple borders
      text: '#F9FAFB',           // Primary text (gray-50)
      textMuted: '#E5E7EB',      // Secondary text (gray-200)
      textLight: '#9CA3AF',      // Light text (gray-400)
      success: '#22C55E',        // Success text
      successBg: '#14532D',      // Success background
      successBorder: '#166534',  // Success border
      warning: '#FBBF24',        // Warning text
      warningBg: '#78350F',      // Warning background
      warningBorder: '#92400E',  // Warning border
      error: '#F87171',          // Error text
      errorBg: '#7F1D1D',        // Error background
      errorBorder: '#991B1B',    // Error border
      info: '#FB923C',           // Info text
      infoBg: '#7C2D12',         // Info background
      infoBorder: '#9A3412',     // Info border
    }
  },

  // Wallet activity widget
  walletActivityEnabled: import.meta.env.VITE_WALLET_ACTIVITY_ENABLED !== 'false',
  transactionThreshold: parseInt(import.meta.env.VITE_TRANSACTION_THRESHOLD, 10) || 0,

  // Feature flags
  features: {
    darkModeEnabled: true,
    socialShareEnabled: true,
    analyticsEnabled: true,
    languageSelectorEnabled: true,
  }
};

export default themeConfig;
