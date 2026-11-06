export type HolidayType = 
  | 'regular' // Regular Holiday (Double Pay, mandatory nationwide)
  | 'special-non-working' // Special Non-Working Day (30% premium)
  | 'cultural' // Cultural Fiesta / Religious Observance
  | 'observance'; // Working Observance / Historic Commemoration

export interface HolidayItem {
  id: string;
  name: string;
  filipinoName?: string;
  date: string; // YYYY-MM-DD
  type: HolidayType;
  description: string;
  isMovable?: boolean;
  region?: string; // Nationwide or specific province/city
}

export type MoonPhaseCategory = 
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface MoonPhaseInfo {
  date: string; // YYYY-MM-DD
  phaseValue: number; // 0.0 to 1.0 (0=New, 0.25=First Q, 0.5=Full, 0.75=Last Q)
  illuminationPct: number; // 0 to 100
  elongationDeg: number; // 0.0 to 360.0 degrees (Meeus true celestial elongation)
  phaseName: string;
  filipinoPhaseName: string;
  category: MoonPhaseCategory;
  isMajorPhase: boolean;
  majorPhaseLabel?: 'New Moon' | 'First Quarter' | 'Full Moon' | 'Third Quarter';
  ageInDays: number; // 0 to ~29.53
  farmingFishingSignificance: string; // Traditional Philippine folklore / coastal fishing guide
}

export interface UserEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: 'meeting' | 'family' | 'fiesta' | 'travel' | 'lunar-ritual' | 'other';
  notes?: string;
  color?: string;
}

export interface AdvertConfig {
  enabled: boolean;
  theme: 'classic-ph' | 'modern-gradient' | 'minimal-light' | 'dark-luxury';
  businessName: string;
  tagline: string;
  hotline: string;
  address: string;
  website: string;
  promoBadge: string;
  customBannerText?: string;
}

export type FontFamilyOption = 
  | 'roboto-flex'
  | 'plus-jakarta' 
  | 'space-grotesk' 
  | 'cinzel' 
  | 'playfair' 
  | 'inter' 
  | 'roboto-mono'
  | 'mi-sans';

export type FontWeightOption = 'normal' | 'medium' | 'semibold' | 'bold' | 'black';

/** CSS font-stretch keywords (the only width values canvas text supports). */
export type FontStretchOption =
  | 'ultra-condensed'
  | 'extra-condensed'
  | 'condensed'
  | 'semi-condensed'
  | 'normal'
  | 'semi-expanded'
  | 'expanded'
  | 'extra-expanded';

export type TitleAlignment = 'left' | 'center' | 'right' | 'split';

export type HeaderImagePlacement = 'left' | 'center-watermark' | 'right' | 'banner-bg';

export interface HeaderImageConfig {
  enabled: boolean;
  url: string; // data URL, SVG or web URL
  placement: HeaderImagePlacement;
  size: 'small' | 'medium' | 'large';
  shape: 'rounded' | 'circle' | 'square';
  opacity: number; // 10 to 100
}

export type DateNumberSizeOption = 'sm' | 'md' | 'lg' | 'xl';

export interface CalendarStyleConfig {
  fontFamily: FontFamilyOption;
  fontWeight: FontWeightOption;
  dateFontWeight?: FontWeightOption; // Independent font weight for calendar date numbers
  dateNumberSize?: DateNumberSizeOption; // Size scale for day numbers
  titleFontStretch?: FontStretchOption; // Width of month title & establishment name (variable wdth axis)
  titleSlant?: number; // Oblique angle in degrees (0-10) for month title & establishment name
  borderRadius: number; // 0 to 24
  borderWidth: number; // 1 to 4
  borderColor: string; // hex color for grid & outer bounds
  monthYearAlignment: TitleAlignment;

  // Header Banner Styling
  headerBgColor: string; // Primary hex
  headerGradientEnd: string; // Secondary hex for gradient
  headerTextColor: string; // Text hex
  headerAccentColor: string; // Accent/border hex
  showHeaderAccent?: boolean; // Toggle Header Accent & Border Color on/off
  headerBorderWidth: number; // 0 to 4
  headerImage: HeaderImageConfig;

  // Grid & Day Styling
  gridDensity: 'compact' | 'standard' | 'spacious';
  titleTextColor?: string; // hex for Month & Year title
  sundayColor: string; // hex
  weekdayBgColor: string; // hex
  weekdayTextColor?: string; // hex for Mon-Sat weekday header text
  cellBgColor?: string; // hex for calendar day cells background
  dayNumberColor?: string; // hex for regular day numbers
  holidayBadgeStyle: 'pill' | 'stripe' | 'minimal';
  showHolePunchGuide: boolean; // 1=1 print sheet feature
  showGridShadow: boolean;
  
  // Content Toggles (1=1 Screen & Print)
  recipientType?: 'business' | 'personal' | 'civic' | 'maritime';
  showMoonPhases?: boolean;
  showHolidays?: boolean;
  showCultural?: boolean;
  showWeekNumbers?: boolean; // Display W1-W52 badge on each week row
  showMemoLines?: boolean; // Display ruled Monthly Notes & Reminders section at bottom

  // Paper Print Settings
  paperSize: 'a4' | 'letter';
  printOrientation: 'landscape' | 'portrait';
  printMargin: number; // mm: 2 to 20
}

