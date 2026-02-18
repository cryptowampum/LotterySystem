import { useTranslation, Trans } from 'react-i18next';
import { themeConfig } from '../config/theme.config';
import NFTPreview from './NFTPreview';

export default function Header() {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-base mb-4">
        {themeConfig.appEmoji} <br/>{t('header.title', { appName: themeConfig.appName })}
      </h1>
      <p className="text-xl text-muted mb-2 text-left max-w-4xl mx-auto">
        <Trans
          i18nKey="header.description"
          values={{ appName: themeConfig.appName, prizeAmount: themeConfig.prizeAmount }}
          components={{ a: <a className="underline font-semibold hover:opacity-80" target="_blank" rel="noopener noreferrer" />, br: <br /> }}
        />
      </p><br/>
      <p className="text-sm text-primary mb-8">
        🔐 {t('header.accessNote', { platformName: themeConfig.platformName })} • {t('header.claimFree')}
      </p>
      <NFTPreview />
    </div>
  );
}
