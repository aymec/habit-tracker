export const lightTheme = {
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    border: '#C7C7CC',
    notification: '#FF3B30',
    textSecondary: '#8E8E93',
    success: '#34C759',
    danger: '#FF3B30',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 20,
  }
};

export const darkTheme = {
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
    textSecondary: '#8E8E93',
    success: '#32D74B',
    danger: '#FF453A',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 20,
  }
};

export type Theme = typeof lightTheme;
