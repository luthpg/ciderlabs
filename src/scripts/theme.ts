type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const THEME_COLORS: Record<Theme, string> = {
  light: '#35654e',
  dark: '#111317',
};

function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;

  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (meta != null) {
    meta.content = THEME_COLORS[theme];
  }

  const isDark = theme === 'dark';
  const label = isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え';

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    '[data-theme-toggle]',
  )) {
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }
}

applyTheme(getCurrentTheme());

document.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>(
    '[data-theme-toggle]',
  );
  if (button == null) return;

  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore storage errors
  }
  applyTheme(next);
});

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (event) => {
  if (getStoredTheme() != null) return;
  applyTheme(event.matches ? 'dark' : 'light');
});
