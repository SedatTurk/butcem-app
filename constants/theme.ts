// BütçeM - Design System & Theme Constants
// Koyu lacivert-mor tonları + neon efektler

export const Colors = {
  // Primary Palette
  background: '#070B1A',
  backgroundLight: '#0D1330',
  cardBg: '#111738',
  cardBgLight: '#181F4A',

  // Neon Accents
  neonPurple: '#8B5CF6',
  neonPurpleLight: '#A78BFA',
  neonCyan: '#00F0FF',
  neonPink: '#FF00E5',
  neonGreen: '#00FF88',
  neonOrange: '#FF8A00',
  neonRed: '#FF3D6E',

  // Gradients
  gradientPurpleStart: '#6C3AED',
  gradientPurpleEnd: '#8B5CF6',
  gradientCyanStart: '#0891B2',
  gradientCyanEnd: '#00F0FF',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Utility
  border: '#1E293B',
  success: '#00FF88',
  warning: '#FFB800',
  danger: '#FF3D6E',
  info: '#00F0FF',

  // Category Colors
  categories: {
    kira: '#FF6B6B',
    market: '#4ECDC4',
    fatura: '#45B7D1',
    ulasim: '#96CEB4',
    eglence: '#DDA0DD',
    saglik: '#FF69B4',
    giyim: '#FFD93D',
    egitim: '#6BCB77',
    yemek: '#FF8C42',
    diger: '#8B5CF6',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const Shadow = {
  neonPurple: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  neonCyan: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const CategoryIcons: Record<string, { icon: string; color: string; label: string }> = {
  kira: { icon: 'home', color: Colors.categories.kira, label: 'Kira' },
  market: { icon: 'cart', color: Colors.categories.market, label: 'Market' },
  fatura: { icon: 'flash', color: Colors.categories.fatura, label: 'Faturalar' },
  ulasim: { icon: 'car', color: Colors.categories.ulasim, label: 'Ulaşım' },
  eglence: { icon: 'game-controller', color: Colors.categories.eglence, label: 'Eğlence' },
  saglik: { icon: 'medkit', color: Colors.categories.saglik, label: 'Sağlık' },
  giyim: { icon: 'shirt', color: Colors.categories.giyim, label: 'Giyim' },
  egitim: { icon: 'school', color: Colors.categories.egitim, label: 'Eğitim' },
  yemek: { icon: 'restaurant', color: Colors.categories.yemek, label: 'Yemek' },
  diger: { icon: 'ellipsis-horizontal', color: Colors.categories.diger, label: 'Diğer' },
};
