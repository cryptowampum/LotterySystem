import { themeConfig } from '../config/theme.config';
import { trackSocialShare } from '../utils/analytics';

export default function SocialShareButton({ platform, url, text }) {
  const handleShare = () => {
    if (themeConfig.features.analyticsEnabled) {
      trackSocialShare(platform);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getIcon = () => {
    switch (platform) {
      case 'LinkedIn': return '💼';
      case 'Twitter': return '🐦';
      case 'Farcaster': return '🟣';
      case 'Bluesky': return '🦋';
      default: return '🔗';
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
