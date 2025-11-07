// Theme utility functions extracted from theme-provider for better fast refresh support

export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getResolvedTheme = (theme: 'dark' | 'light' | 'system'): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const isDarkTheme = (theme: 'dark' | 'light' | 'system'): boolean => {
  return getResolvedTheme(theme) === 'dark';
};