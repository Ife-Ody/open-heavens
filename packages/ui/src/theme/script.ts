interface ThemeOptions {
  attribute: string;
  storageKey: string;
  defaultTheme: string;
  forcedTheme?: string;
  themes: string[];
  value?: Record<string, string>;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
}

export const script = (
  attribute: ThemeOptions["attribute"],
  storageKey: ThemeOptions["storageKey"],
  defaultTheme: ThemeOptions["defaultTheme"],
  forcedTheme: ThemeOptions["forcedTheme"],
  themes: ThemeOptions["themes"],
  value: ThemeOptions["value"],
  enableSystem: ThemeOptions["enableSystem"],
  enableColorScheme: ThemeOptions["enableColorScheme"],
): void => {
  const el = document.documentElement;
  const systemThemes = ["light", "dark"];
  const isClass = attribute === "class";
  const classes = isClass && value ? themes.map((t) => value[t] || t) : themes;

  function updateDOM(theme: string): void {
    if (isClass) {
      el.classList.remove(...classes);
      el.classList.add(theme);
    } else {
      el.setAttribute(attribute, theme);
    }

    setColorScheme(theme);
  }

  function setColorScheme(theme: string): void {
    if (enableColorScheme && systemThemes.includes(theme)) {
      el.style.colorScheme = theme;
    }
  }

  function getSystemTheme(): string {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  if (forcedTheme) {
    updateDOM(forcedTheme);
  } else {
    try {
      const themeName = localStorage.getItem(storageKey) || defaultTheme;
      const isSystem = enableSystem && themeName === "system";
      const theme = isSystem ? getSystemTheme() : themeName;
      updateDOM(theme);
    } catch (e) {
      //
    }
  }
};
