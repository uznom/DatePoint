import { MoonPhaseCategory, MoonPhaseInfo } from '../types';

// Mean synodic month in days
const SYNODIC_MONTH = 29.530588853;
const RAD = Math.PI / 180;

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Calculates Julian Date from Gregorian calendar date and UTC hour.
 */
export function getJulianDate(year: number, month: number, day: number, hourUtc = 12): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day + b - 1524.5 +
    hourUtc / 24;
  return jd;
}

/**
 * Computes Meeus astronomical ecliptic elongation (Moon longitude minus Sun longitude) in degrees [0, 360)
 * at a given date and UTC hour.
 */
export function getMeeusElongation(year: number, month: number, day: number, hourUtc = 4): number {
  const jd = getJulianDate(year, month, day, hourUtc);
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0

  // 1. Sun's Ecliptic Longitude (Meeus Chapter 25)
  const L0 = 280.46646 + 36000.76983 * T;
  const M_sun = 357.52911 + 35999.05029 * T;
  const C = (1.914602 - 0.004817 * T) * Math.sin(M_sun * RAD) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun * RAD);
  const sun_lon = normalizeDeg(L0 + C);

  // 2. Moon's Ecliptic Longitude with Core Periodic Perturbations (Meeus Chapter 47)
  const L_moon = 218.3164477 + 481267.88123421 * T;
  const M_moon = 134.9633964 + 477198.8675055 * T;
  const F_moon = 93.2720950 + 483202.0175233 * T;
  const D = 297.8501921 + 445267.1114034 * T;

  const moon_lon = normalizeDeg(L_moon +
    6.288774 * Math.sin(M_moon * RAD) +
    1.274020 * Math.sin((2 * D - M_moon) * RAD) +
    0.658309 * Math.sin(2 * D * RAD) +
    0.213618 * Math.sin(2 * M_moon * RAD) -
    0.185116 * Math.sin(M_sun * RAD) -
    0.114332 * Math.sin(2 * F_moon * RAD) +
    0.058793 * Math.sin((2 * D - 2 * M_moon) * RAD) +
    0.057066 * Math.sin((2 * D - M_sun - M_moon) * RAD) +
    0.053322 * Math.sin((2 * D + M_moon) * RAD) +
    0.046100 * Math.sin((2 * D - M_sun) * RAD)
  );

  return normalizeDeg(moon_lon - sun_lon);
}

/**
 * Gets the raw moon phase cycle value [0, 1) for a given date
 * 0.0 = New Moon, 0.25 = First Quarter, 0.5 = Full Moon, 0.75 = Last Quarter
 */
export function getMoonPhaseValue(year: number, month: number, day: number, hourUtc = 4): number {
  const elongation = getMeeusElongation(year, month, day, hourUtc);
  return elongation / 360;
}

/**
 * Calculates exact moon details for a given date string 'YYYY-MM-DD'
 * Calibrated for Philippine Standard Time (PHT = UTC+8).
 */
export function getMoonPhaseForDate(dateStr: string): MoonPhaseInfo {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // In Philippine Standard Time (UTC+8), local noon 12:00 PHT is 04:00 UTC
  const elongationDeg = getMeeusElongation(year, month, day, 4);
  const phaseValue = elongationDeg / 360;
  const ageInDays = phaseValue * SYNODIC_MONTH;

  // Illumination percentage from 0% to 100%
  const illuminationPct = Math.round(((1 - Math.cos(elongationDeg * RAD)) / 2) * 100);

  // Determine category from true elongation angle
  let category: MoonPhaseCategory;
  let phaseName: string;
  let filipinoPhaseName: string;
  let farmingFishingSignificance: string;

  if (elongationDeg >= 348.75 || elongationDeg < 11.25) {
    category = 'new';
    phaseName = 'New Moon';
    filipinoPhaseName = 'New Moon (Spring Tides)';
    farmingFishingSignificance = 'Maximum tidal amplitude (Spring Tides). Dark sky conditions; high nocturnal squid feeding in coastal shallows. Recommended for root crop agriculture.';
  } else if (elongationDeg < 78.75) {
    category = 'waxing-crescent';
    phaseName = 'Waxing Crescent';
    filipinoPhaseName = 'Waxing Crescent';
    farmingFishingSignificance = 'Ascending sap pressure in flora. Optimal for planting leafy vegetables, bamboo forestry, and nearshore gathering.';
  } else if (elongationDeg < 101.25) {
    category = 'first-quarter';
    phaseName = 'First Quarter';
    filipinoPhaseName = 'First Quarter (Neap Tides)';
    farmingFishingSignificance = 'Moderate tidal ranges (Neap Tides); steady coastal angling. Ideal period for sowing fruiting crops and transplanting seedlings.';
  } else if (elongationDeg < 168.75) {
    category = 'waxing-gibbous';
    phaseName = 'Waxing Gibbous';
    filipinoPhaseName = 'Waxing Gibbous';
    farmingFishingSignificance = 'Expanding ambient illumination; pelagic species migrate toward outer reefs. Excellent for soil enrichment.';
  } else if (elongationDeg < 191.25) {
    category = 'full';
    phaseName = 'Full Moon';
    filipinoPhaseName = 'Full Moon (Maximum Spring Tides)';
    farmingFishingSignificance = 'Maximum tidal amplitude (King / Spring Tides). Peak near-surface marine feeding; traditional community harvest celebrations.';
  } else if (elongationDeg < 258.75) {
    category = 'waning-gibbous';
    phaseName = 'Waning Gibbous';
    filipinoPhaseName = 'Waning Gibbous';
    farmingFishingSignificance = 'Gravitational pull recedes. Optimal timing for orchard pruning, weed management, and deep-line drop fishing.';
  } else if (elongationDeg < 281.25) {
    category = 'last-quarter';
    phaseName = 'Third Quarter';
    filipinoPhaseName = 'Third Quarter (Neap Tides)';
    farmingFishingSignificance = 'Minimum tidal amplitude (Neap Tides). Schooling fish gather along ocean drop-offs. Favorable for harvesting grains & tubers.';
  } else {
    category = 'waning-crescent';
    phaseName = 'Waning Crescent';
    filipinoPhaseName = 'Waning Crescent';
    farmingFishingSignificance = 'Diminished nocturnal illumination; ocean phosphorescence visible. Best window for soil aeration and equipment maintenance.';
  }

  // Major phase detection:
  // Check if the phase boundary (0°, 90°, 180°, 270°) was crossed during this calendar day in PHT
  // Start of day in PHT (00:00 PHT = 16:00 UTC previous day)
  const elStart = getMeeusElongation(year, month, day - 1, 16);
  // End of day in PHT (24:00 PHT = 16:00 UTC current day)
  const elEnd = getMeeusElongation(year, month, day, 16);

  let isMajorPhase = false;
  let majorPhaseLabel: 'New Moon' | 'First Quarter' | 'Full Moon' | 'Third Quarter' | undefined;

  // New Moon crossing: 340° -> 20°
  if (elStart > 340 && elEnd < 20) {
    isMajorPhase = true;
    majorPhaseLabel = 'New Moon';
  } else if (elStart <= 90 && elEnd > 90) {
    isMajorPhase = true;
    majorPhaseLabel = 'First Quarter';
  } else if (elStart <= 180 && elEnd > 180) {
    isMajorPhase = true;
    majorPhaseLabel = 'Full Moon';
  } else if (elStart <= 270 && elEnd > 270) {
    isMajorPhase = true;
    majorPhaseLabel = 'Third Quarter';
  }

  return {
    date: dateStr,
    phaseValue,
    illuminationPct,
    elongationDeg,
    phaseName,
    filipinoPhaseName,
    category,
    isMajorPhase,
    majorPhaseLabel,
    ageInDays,
    farmingFishingSignificance,
  };
}
