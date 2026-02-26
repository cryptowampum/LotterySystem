import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

export default function TopBar() {
  return (
    <div className="flex justify-end gap-2 mb-4">
      <LanguageSelector />
      <ThemeToggle />
    </div>
  );
}
