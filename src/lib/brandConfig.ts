/**
 * Configuration de la Charte Visuelle IMOTION
 * 
 * Ce fichier centralise tous les éléments de la charte visuelle IMOTION
 * pour garantir la cohérence sur tous les documents et interfaces.
 */

export const IMOTION_BRAND = {
  // Couleurs Principales
  colors: {
    primary: '#d8232a',        // Rouge IMOTION - Couleur signature
    primaryDark: '#b01d23',    // Rouge foncé pour hover
    primaryLight: '#ff4d54',   // Rouge clair pour accents
    
    text: {
      primary: '#1a1a1a',      // Noir corporate pour textes principaux
      secondary: '#666666',    // Gris pour textes secondaires
      muted: '#999999',        // Gris clair pour textes discrets
    },
    
    background: {
      main: '#ffffff',         // Blanc principal
      secondary: '#f5f5f5',    // Gris fond pour cards
      accent: '#fafafa',       // Gris très clair
    },
    
    border: {
      default: '#e0e0e0',      // Bordure standard
      light: '#f0f0f0',        // Bordure légère
      accent: '#d8232a',       // Bordure rouge pour accents
    },
    
    status: {
      success: '#10b981',      // Vert succès
      warning: '#f59e0b',      // Orange warning
      error: '#ef4444',        // Rouge erreur
      info: '#3b82f6',         // Bleu info
    }
  },

  // Typographie
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    
    fontWeights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    }
  },

  // Logos
  logos: {
    main: '/assets/LogoIMOTION.png',
    compact: '/assets/LogoIMOTIONv2.png',
    alt: 'IMOTION - AI No-Code Solutions',
  },

  // Espacements
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Informations Entreprise
  company: {
    name: 'IMOTION',
    tagline: 'AI No-Code Solutions',
    website: 'https://imotion.fr',
    email: 'contact@imotion.fr',
    phone: '+33 (0)1 XX XX XX XX',
    address: {
      street: 'XX Rue Example',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    }
  },

  // Configuration Documents PDF
  pdf: {
    format: 'A4' as const,
    orientation: 'portrait' as const,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
    quality: {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    }
  }
} as const;

/**
 * Classe CSS pour le rouge IMOTION
 */
export const imotionRedClass = 'text-[#d8232a]';

/**
 * Classe CSS pour le fond rouge IMOTION
 */
export const imotionRedBgClass = 'bg-[#d8232a]';

/**
 * Classe CSS pour la bordure rouge IMOTION
 */
export const imotionRedBorderClass = 'border-[#d8232a]';

/**
 * Helper pour générer un gradient rouge IMOTION
 */
export const imotionGradient = (direction: 'to-r' | 'to-b' | 'to-br' = 'to-r') => {
  return `bg-gradient-${direction} from-[#d8232a] to-[#ff4d54]`;
};

/**
 * Configuration des badges de statut avec couleurs IMOTION
 */
export const STATUS_BADGES = {
  success: {
    bg: IMOTION_BRAND.colors.status.success,
    text: '#ffffff',
    label: 'Terminé',
  },
  pending: {
    bg: IMOTION_BRAND.colors.status.warning,
    text: '#ffffff',
    label: 'En cours',
  },
  error: {
    bg: IMOTION_BRAND.colors.status.error,
    text: '#ffffff',
    label: 'Erreur',
  },
  info: {
    bg: IMOTION_BRAND.colors.primary,
    text: '#ffffff',
    label: 'Information',
  },
} as const;

export default IMOTION_BRAND;
