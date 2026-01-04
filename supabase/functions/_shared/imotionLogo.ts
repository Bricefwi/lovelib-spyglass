// ============================================================================
// IMOTION LOGO - BASE64 EMBEDDED
// ============================================================================
// Ce fichier contient le logo IMOTION encodé en Base64 pour une intégration
// directe dans les rapports HTML et emails sans dépendance externe.
// ============================================================================
// Version: 1.0
// Date: Janvier 2026
// ============================================================================

export const IMOTION_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="200" height="50">
  <defs>
    <linearGradient id="imotionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d8232a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff4d54;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="25" cy="25" r="22" fill="url(#imotionGradient)" />
  <text x="25" y="32" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="white" text-anchor="middle">IM</text>
  <text x="58" y="35" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" fill="#1a1a1a">
    <tspan fill="#d8232a">I</tspan>MOTION
  </text>
  <text x="58" y="48" font-family="Inter, Arial, sans-serif" font-size="9" font-weight="500" fill="#666666" letter-spacing="0.5">
    AI No-Code Solutions
  </text>
</svg>`;

export const IMOTION_LOGO_BASE64 = `data:image/svg+xml;base64,${btoa(IMOTION_LOGO_SVG)}`;

export const IMOTION_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d8232a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff4d54;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="25" cy="25" r="23" fill="url(#iconGradient)" />
  <text x="25" y="33" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" fill="white" text-anchor="middle">IM</text>
</svg>`;

export const IMOTION_ICON_BASE64 = `data:image/svg+xml;base64,${btoa(IMOTION_ICON_SVG)}`;

export const IMOTION_LOGO_WHITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="200" height="50">
  <defs>
    <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="25" cy="25" r="22" fill="url(#whiteGradient)" />
  <text x="25" y="32" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="#d8232a" text-anchor="middle">IM</text>
  <text x="58" y="35" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" fill="white">
    <tspan fill="#ffffff">I</tspan>MOTION
  </text>
  <text x="58" y="48" font-family="Inter, Arial, sans-serif" font-size="9" font-weight="500" fill="rgba(255,255,255,0.8)" letter-spacing="0.5">
    AI No-Code Solutions
  </text>
</svg>`;

export const IMOTION_LOGO_WHITE_BASE64 = `data:image/svg+xml;base64,${btoa(IMOTION_LOGO_WHITE_SVG)}`;

export const POWERED_BY_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 30" width="180" height="30">
  <rect x="0" y="0" width="180" height="30" rx="15" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="1"/>
  <circle cx="15" cy="15" r="10" fill="#d8232a" />
  <text x="15" y="19" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="800" fill="white" text-anchor="middle">IM</text>
  <text x="32" y="18" font-family="Inter, Arial, sans-serif" font-size="10" fill="#666666">
    Powered by <tspan fill="#d8232a" font-weight="600">IMOTION</tspan>
  </text>
</svg>`;

export const POWERED_BY_BADGE_BASE64 = `data:image/svg+xml;base64,${btoa(POWERED_BY_BADGE_SVG)}`;

export const IMOTION_LOGO_LARGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 75" width="300" height="75">
  <defs>
    <linearGradient id="largeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d8232a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff4d54;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>
  <circle cx="37" cy="37" r="32" fill="url(#largeGradient)" filter="url(#shadow)" />
  <text x="37" y="47" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" fill="white" text-anchor="middle">IM</text>
  <text x="85" y="48" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="700" fill="#1a1a1a">
    <tspan fill="#d8232a">I</tspan>MOTION
  </text>
  <text x="85" y="68" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="500" fill="#666666" letter-spacing="1">
    AI No-Code Solutions
  </text>
</svg>`;

export const IMOTION_LOGO_LARGE_BASE64 = `data:image/svg+xml;base64,${btoa(IMOTION_LOGO_LARGE_SVG)}`;

export function getLogoImgTag(
  variant: 'main' | 'icon' | 'white' | 'large' = 'main',
  className: string = ''
): string {
  const logos = {
    main: { src: IMOTION_LOGO_BASE64, width: 200, height: 50, alt: 'IMOTION' },
    icon: { src: IMOTION_ICON_BASE64, width: 50, height: 50, alt: 'IMOTION' },
    white: { src: IMOTION_LOGO_WHITE_BASE64, width: 200, height: 50, alt: 'IMOTION' },
    large: { src: IMOTION_LOGO_LARGE_BASE64, width: 300, height: 75, alt: 'IMOTION' }
  };
  
  const logo = logos[variant];
  return `<img src="${logo.src}" width="${logo.width}" height="${logo.height}" alt="${logo.alt}" class="${className}" style="max-width: 100%; height: auto;" />`;
}

export function getLogoSvgInline(variant: 'main' | 'icon' | 'white' | 'large' = 'main'): string {
  const svgs = {
    main: IMOTION_LOGO_SVG,
    icon: IMOTION_ICON_SVG,
    white: IMOTION_LOGO_WHITE_SVG,
    large: IMOTION_LOGO_LARGE_SVG
  };
  
  return svgs[variant];
}

export const IMOTION_BRAND_INFO = {
  name: 'IMOTION',
  tagline: 'AI No-Code Solutions',
  website: 'https://imotion.fr',
  email: 'contact@imotion-conseil.fr',
  colors: {
    primary: '#d8232a',
    primaryDark: '#b01d23',
    primaryLight: '#ff4d54',
    text: '#1a1a1a',
    textSecondary: '#666666',
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5'
  },
  social: {
    linkedin: 'https://linkedin.com/company/imotion-conseil',
    twitter: 'https://twitter.com/imotion_conseil'
  }
};

export default {
  IMOTION_LOGO_SVG,
  IMOTION_LOGO_BASE64,
  IMOTION_ICON_SVG,
  IMOTION_ICON_BASE64,
  IMOTION_LOGO_WHITE_SVG,
  IMOTION_LOGO_WHITE_BASE64,
  IMOTION_LOGO_LARGE_SVG,
  IMOTION_LOGO_LARGE_BASE64,
  POWERED_BY_BADGE_SVG,
  POWERED_BY_BADGE_BASE64,
  getLogoImgTag,
  getLogoSvgInline,
  IMOTION_BRAND_INFO
};