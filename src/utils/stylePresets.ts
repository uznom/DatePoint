import { CalendarStyleConfig, FontFamilyOption } from '../types';

// Curated vector SVG data URLs for instant header emblems
export const EMBLEM_PRESETS = [
  {
    id: 'ph-sun',
    name: 'Philippine 8-Ray Sun',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23FCD34D"><circle cx="50" cy="50" r="18" fill="%23FBBF24"/><g stroke="%23F59E0B" stroke-width="3" stroke-linecap="round"><line x1="50" y1="12" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="88"/><line x1="12" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="88" y2="50"/><line x1="23" y1="23" x2="32" y2="32"/><line x1="68" y1="68" x2="77" y2="77"/><line x1="23" y1="77" x2="32" y2="68"/><line x1="68" y1="32" x2="77" y2="23"/></g><circle cx="50" cy="50" r="14" fill="%23FEF08A"/></svg>`,
  },
  {
    id: 'republic-crest',
    name: 'Civic Star & Shield',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 15 L80 25 L80 55 C80 72 50 85 50 85 C50 85 20 72 20 55 L20 25 Z" fill="%231E3A8A" stroke="%23FBBF24" stroke-width="4"/><polygon points="50,30 55,42 68,43 57,51 61,64 50,56 39,64 43,51 32,43 45,42" fill="%23FCD34D"/></svg>`,
  },
  {
    id: 'maritime-anchor',
    name: 'Maritime Port Anchor',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2338BDF8"><circle cx="50" cy="22" r="8" fill="none" stroke="%2338BDF8" stroke-width="5"/><line x1="50" y1="30" x2="50" y2="82" stroke="%2338BDF8" stroke-width="7" stroke-linecap="round"/><line x1="28" y1="42" x2="72" y2="42" stroke="%2338BDF8" stroke-width="6" stroke-linecap="round"/><path d="M22 60 C22 84 78 84 78 60" fill="none" stroke="%2338BDF8" stroke-width="7" stroke-linecap="round"/><polygon points="22,54 15,64 29,64" fill="%2338BDF8"/><polygon points="78,54 71,64 85,64" fill="%2338BDF8"/></svg>`,
  },
  {
    id: 'harvest-agri',
    name: 'Agriculture & Harvest Leaf',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2334D399"><path d="M50 85 C50 85 45 55 25 40 C45 35 50 15 50 15 C50 15 55 35 75 40 C55 55 50 85 50 85 Z" fill="%2310B981" stroke="%23A7F3D0" stroke-width="3"/><path d="M50 85 L50 25" stroke="%23FCD34D" stroke-width="3"/></svg>`,
  },
  {
    id: 'corporate-diamond',
    name: 'Corporate Geometric Monogram',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect x="50" y="15" width="48" height="48" rx="8" transform="rotate(45 50 15)" fill="%236366F1" stroke="%23A5B4FC" stroke-width="4"/><circle cx="50" cy="49" r="10" fill="%23FFFFFF"/></svg>`,
  },
];

export const DEFAULT_STYLE_CONFIG: CalendarStyleConfig = {
  fontFamily: 'plus-jakarta',
  fontWeight: 'bold',
  dateFontWeight: 'bold',
  dateNumberSize: 'md',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#e2e8f0',
  monthYearAlignment: 'split',

  // Header Banner Styling
  headerBgColor: '#991b1b', // Red-800
  headerGradientEnd: '#78350f', // Amber-900
  headerTextColor: '#ffffff',
  headerAccentColor: '#fde047', // Yellow-300
  showHeaderAccent: true,
  headerBorderWidth: 1,
  headerImage: {
    enabled: true,
    url: EMBLEM_PRESETS[0].dataUrl,
    placement: 'left',
    size: 'medium',
    shape: 'circle',
    opacity: 100,
  },

  // Grid & Day Styling
  gridDensity: 'standard',
  titleTextColor: '#09090b',
  sundayColor: '#dc2626',
  weekdayBgColor: '#f8fafc',
  weekdayTextColor: '#334155',
  cellBgColor: '#ffffff',
  dayNumberColor: '#1e293b',
  holidayBadgeStyle: 'stripe',
  showHolePunchGuide: false,
  showGridShadow: true,

  // Content Toggles (1=1 Screen & Print)
  recipientType: 'business',
  showMoonPhases: true,
  showHolidays: true,
  showCultural: true,
  showWeekNumbers: false,
  showMemoLines: false,

  // Paper Print Settings
  paperSize: 'a4',
  printOrientation: 'landscape',
  printMargin: 6,
};

export const STYLE_PRESETS: Array<{
  id: string;
  name: string;
  tagline: string;
  config: Partial<CalendarStyleConfig>;
}> = [
  {
    id: 'ph-classic',
    name: 'Philippine Heritage & Civic',
    tagline: 'Traditional burgundy banner with gold accents and Roman typography',
    config: {
      fontFamily: 'cinzel',
      fontWeight: 'bold',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#cbd5e1',
      monthYearAlignment: 'split',
      headerBgColor: '#991b1b',
      headerGradientEnd: '#450a0a',
      headerTextColor: '#ffffff',
      headerAccentColor: '#facc15',
      headerBorderWidth: 2,
      headerImage: {
        enabled: true,
        url: EMBLEM_PRESETS[0].dataUrl,
        placement: 'left',
        size: 'medium',
        shape: 'circle',
        opacity: 100,
      },
      holidayBadgeStyle: 'stripe',
      sundayColor: '#dc2626',
    },
  },
  {
    id: 'corporate-navy',
    name: 'Executive Corporate Navy',
    tagline: 'Modern tech & logistics clean design with crisp hairline borders',
    config: {
      fontFamily: 'plus-jakarta',
      fontWeight: 'bold',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      monthYearAlignment: 'split',
      headerBgColor: '#0f172a',
      headerGradientEnd: '#1e293b',
      headerTextColor: '#f8fafc',
      headerAccentColor: '#38bdf8',
      headerBorderWidth: 1,
      headerImage: {
        enabled: true,
        url: EMBLEM_PRESETS[4].dataUrl,
        placement: 'left',
        size: 'medium',
        shape: 'rounded',
        opacity: 100,
      },
      holidayBadgeStyle: 'pill',
      sundayColor: '#ef4444',
    },
  },
  {
    id: 'editorial-serif',
    name: 'Editorial Luxury Gold',
    tagline: 'High-end publication feel with centered Playfair serif headlines',
    config: {
      fontFamily: 'playfair',
      fontWeight: 'bold',
      borderRadius: 6,
      borderWidth: 2,
      borderColor: '#d4d4d8',
      monthYearAlignment: 'center',
      headerBgColor: '#18181b',
      headerGradientEnd: '#27272a',
      headerTextColor: '#fafafa',
      headerAccentColor: '#f59e0b',
      headerBorderWidth: 2,
      headerImage: {
        enabled: true,
        url: EMBLEM_PRESETS[1].dataUrl,
        placement: 'left',
        size: 'medium',
        shape: 'square',
        opacity: 100,
      },
      holidayBadgeStyle: 'minimal',
      sundayColor: '#b91c1c',
    },
  },
  {
    id: 'maritime-blue',
    name: 'Island Maritime & Aquaculture',
    tagline: 'Deep Pacific blue gradient for ports, coastal trading & angling',
    config: {
      fontFamily: 'inter',
      fontWeight: 'bold',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#bae6fd',
      monthYearAlignment: 'left',
      headerBgColor: '#0369a1',
      headerGradientEnd: '#0f766e',
      headerTextColor: '#ffffff',
      headerAccentColor: '#7dd3fc',
      headerBorderWidth: 1,
      headerImage: {
        enabled: true,
        url: EMBLEM_PRESETS[2].dataUrl,
        placement: 'left',
        size: 'medium',
        shape: 'circle',
        opacity: 100,
      },
      holidayBadgeStyle: 'pill',
      sundayColor: '#e11d48',
    },
  },
  {
    id: 'minimal-studio',
    name: 'Architectural Minimalist',
    tagline: 'Sharp zero-radius layout with Space Grotesk technical typography',
    config: {
      fontFamily: 'space-grotesk',
      fontWeight: 'black',
      borderRadius: 0,
      borderWidth: 3,
      borderColor: '#18181b',
      monthYearAlignment: 'left',
      headerBgColor: '#ffffff',
      headerGradientEnd: '#f4f4f5',
      headerTextColor: '#09090b',
      headerAccentColor: '#4f46e5',
      headerBorderWidth: 3,
      headerImage: {
        enabled: false,
        url: '',
        placement: 'left',
        size: 'small',
        shape: 'square',
        opacity: 100,
      },
      holidayBadgeStyle: 'stripe',
      sundayColor: '#dc2626',
    },
  },
  {
    id: 'mi-modernist',
    name: 'Mi Dynamic Modernist',
    tagline: 'Sleek consumer tech aesthetic with Mi Sans typography, smooth 12px radii and vibrant accent',
    config: {
      fontFamily: 'mi-sans',
      fontWeight: 'semibold',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#cbd5e1',
      monthYearAlignment: 'split',
      headerBgColor: '#0f172a',
      headerGradientEnd: '#334155',
      headerTextColor: '#f8fafc',
      headerAccentColor: '#ff6900',
      headerBorderWidth: 1,
      headerImage: {
        enabled: true,
        url: EMBLEM_PRESETS[4].dataUrl,
        placement: 'left',
        size: 'medium',
        shape: 'rounded',
        opacity: 100,
      },
      holidayBadgeStyle: 'pill',
      sundayColor: '#ea580c',
    },
  },
];

export function getFontFamilyCss(family: FontFamilyOption): string {
  switch (family) {
    case 'mi-sans':
      return "'MiSans VF', 'MiSans', 'Mi Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    case 'mi-lanting':
      return "'MI LANTING', 'Mi Lanting', 'MiLanting', 'MILANPro', 'FZLanTingHei-R-GBK', 'FZLanTingHei', 'PingFang SC', 'Microsoft YaHei', sans-serif";
    case 'plus-jakarta':
      return "'Plus Jakarta Sans', system-ui, sans-serif";
    case 'space-grotesk':
      return "'Space Grotesk', system-ui, sans-serif";
    case 'cinzel':
      return "'Cinzel', Georgia, serif";
    case 'playfair':
      return "'Playfair Display', Georgia, serif";
    case 'inter':
      return "'Inter', system-ui, sans-serif";
    case 'roboto-mono':
      return "'Roboto Mono', monospace";
    default:
      return "'Plus Jakarta Sans', sans-serif";
  }
}

export function getFontWeightCss(weight: string): number {
  switch (weight) {
    case 'normal':
      return 400;
    case 'medium':
      return 500;
    case 'semibold':
      return 600;
    case 'bold':
      return 700;
    case 'black':
      return 900;
    default:
      return 700;
  }
}
