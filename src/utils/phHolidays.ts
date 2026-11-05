import { HolidayItem } from '../types';

/**
 * Computes Western Easter Sunday for a given year using the anonymous Gregorian algorithm
 */
export function getEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/**
 * Formats year, month, day into 'YYYY-MM-DD'
 */
export function formatDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Finds the last occurrence of a given day of week (0=Sun, 1=Mon, ..., 6=Sat) in a given month
 */
export function getLastDayOfWeekInMonth(year: number, month: number, targetDayOfWeek: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = daysInMonth; day >= 1; day--) {
    const d = new Date(year, month - 1, day);
    if (d.getDay() === targetDayOfWeek) {
      return day;
    }
  }
  return daysInMonth;
}

/**
 * Known Islamic Holiday estimates for the Philippines (proclaimed annually by Presidential Proclamation)
 */
const ISLAMIC_HOLIDAYS_MAP: Record<number, { eidFitr: string; eidAdha: string }> = {
  2024: { eidFitr: '2024-04-10', eidAdha: '2024-06-17' },
  2025: { eidFitr: '2025-03-31', eidAdha: '2025-06-06' },
  2026: { eidFitr: '2026-03-20', eidAdha: '2026-05-27' },
  2027: { eidFitr: '2027-03-10', eidAdha: '2027-05-16' },
  2028: { eidFitr: '2028-02-27', eidAdha: '2028-05-05' },
};

/**
 * Chinese New Year mapping
 */
const CHINESE_NEW_YEAR_MAP: Record<number, string> = {
  2024: '2024-02-10',
  2025: '2025-01-29',
  2026: '2026-02-17',
  2027: '2027-02-06',
  2028: '2028-01-26',
};

/**
 * Gets all Philippine holidays and cultural observances for a given year in professional English
 */
export function getPhilippineHolidaysForYear(year: number): HolidayItem[] {
  const holidays: HolidayItem[] = [];

  // --- FIXED REGULAR HOLIDAYS ---
  holidays.push({
    id: `reg-new-year-${year}`,
    name: "New Year's Day",
    date: formatDate(year, 1, 1),
    type: 'regular',
    description: 'First day of the Gregorian calendar. Nationwide public holiday observed with civic gatherings and family reunions.',
  });

  holidays.push({
    id: `reg-kagitingan-${year}`,
    name: 'Day of Valor (Araw ng Kagitingan)',
    date: formatDate(year, 4, 9),
    type: 'regular',
    description: 'Honors the bravery of Filipino and Allied forces who served in the Battle of Bataan and the Bataan Death March during World War II.',
  });

  holidays.push({
    id: `reg-labor-day-${year}`,
    name: 'Labor Day',
    date: formatDate(year, 5, 1),
    type: 'regular',
    description: 'National holiday dedicated to honoring the contributions, achievements, and rights of the Filipino workforce.',
  });

  holidays.push({
    id: `reg-independence-${year}`,
    name: 'Independence Day',
    date: formatDate(year, 6, 12),
    type: 'regular',
    description: 'Commemorates the 1898 historic declaration of Philippine national independence from colonial rule in Kawit, Cavite.',
  });

  // National Heroes Day: Last Monday of August
  const lastMonAug = getLastDayOfWeekInMonth(year, 8, 1);
  holidays.push({
    id: `reg-heroes-day-${year}`,
    name: 'National Heroes Day',
    date: formatDate(year, 8, lastMonAug),
    type: 'regular',
    isMovable: true,
    description: 'National holiday commemorating the 1896 Cry of Pugad Lawin and honoring all heroes of the Philippine revolution.',
  });

  holidays.push({
    id: `reg-bonifacio-${year}`,
    name: 'Bonifacio Day',
    date: formatDate(year, 11, 30),
    type: 'regular',
    description: 'Commemorates the birthday of Andres Bonifacio, leader of the Katipunan movement and father of the Philippine Revolution.',
  });

  holidays.push({
    id: `reg-christmas-${year}`,
    name: 'Christmas Day',
    date: formatDate(year, 12, 25),
    type: 'regular',
    description: 'Celebrates the Nativity of Jesus Christ; a major public holiday across the Philippines.',
  });

  holidays.push({
    id: `reg-rizal-${year}`,
    name: 'Rizal Day',
    date: formatDate(year, 12, 30),
    type: 'regular',
    description: 'Commemorates the martyrdom and execution of national hero Dr. Jose Rizal at Bagumbayan (Luneta) in 1896.',
  });

  // --- MOVABLE HOLY WEEK (Christian) ---
  const easter = getEasterSunday(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);

  // Maundy Thursday: 3 days before Easter
  const maundyThu = new Date(easterDate);
  maundyThu.setDate(easterDate.getDate() - 3);
  holidays.push({
    id: `reg-maundy-thu-${year}`,
    name: 'Maundy Thursday',
    date: formatDate(maundyThu.getFullYear(), maundyThu.getMonth() + 1, maundyThu.getDate()),
    type: 'regular',
    isMovable: true,
    description: 'Commemorates the Last Supper of Jesus Christ and the Institution of the Eucharist.',
  });

  // Good Friday: 2 days before Easter
  const goodFri = new Date(easterDate);
  goodFri.setDate(easterDate.getDate() - 2);
  holidays.push({
    id: `reg-good-fri-${year}`,
    name: 'Good Friday',
    date: formatDate(goodFri.getFullYear(), goodFri.getMonth() + 1, goodFri.getDate()),
    type: 'regular',
    isMovable: true,
    description: 'Solemn Christian commemoration of the Passion, Crucifixion, and Death of Jesus Christ.',
  });

  // Black Saturday: 1 day before Easter
  const blackSat = new Date(easterDate);
  blackSat.setDate(easterDate.getDate() - 1);
  holidays.push({
    id: `snw-black-sat-${year}`,
    name: 'Black Saturday',
    date: formatDate(blackSat.getFullYear(), blackSat.getMonth() + 1, blackSat.getDate()),
    type: 'special-non-working',
    isMovable: true,
    description: 'Vigil day commemorating the repose of Christ in the tomb prior to Easter Sunday.',
  });

  // Easter Sunday: Observance
  holidays.push({
    id: `cult-easter-sun-${year}`,
    name: 'Easter Sunday',
    date: formatDate(year, easter.month, easter.day),
    type: 'cultural',
    isMovable: true,
    description: 'Celebrates the Resurrection of Jesus Christ, marked by dawn processions and church services nationwide.',
  });

  // --- SPECIAL NON-WORKING DAYS ---
  // Chinese New Year
  const cnyDate = CHINESE_NEW_YEAR_MAP[year] || `${year}-02-01`;
  holidays.push({
    id: `snw-chinese-new-year-${year}`,
    name: 'Chinese New Year',
    date: cnyDate,
    type: 'special-non-working',
    isMovable: true,
    description: 'Lunar New Year celebrations observed widely across Filipino-Chinese commercial districts and communities.',
  });

  // EDSA People Power Revolution Anniversary
  holidays.push({
    id: `snw-edsa-${year}`,
    name: 'EDSA People Power Revolution Anniversary',
    date: formatDate(year, 2, 25),
    type: 'special-non-working',
    description: 'Commemorates the historic 1986 peaceful civic movement that restored democratic constitutional rule in the Philippines.',
  });

  // Ninoy Aquino Day
  holidays.push({
    id: `snw-ninoy-${year}`,
    name: 'Ninoy Aquino Day',
    date: formatDate(year, 8, 21),
    type: 'special-non-working',
    description: 'Commemorates the 1983 martyrdom of former Senator Benigno Aquino Jr.',
  });

  // All Saints' Day
  holidays.push({
    id: `snw-all-saints-${year}`,
    name: "All Saints' Day",
    date: formatDate(year, 11, 1),
    type: 'special-non-working',
    description: 'National remembrance day honoring all Christian saints and departed ancestors at memorial parks nationwide.',
  });

  // All Souls' Day
  holidays.push({
    id: `snw-all-souls-${year}`,
    name: "All Souls' Day",
    date: formatDate(year, 11, 2),
    type: 'special-non-working',
    description: 'Traditional day of prayer and memorial visitations for departed relatives and friends.',
  });

  // Feast of the Immaculate Conception
  holidays.push({
    id: `snw-immaculate-conception-${year}`,
    name: 'Feast of the Immaculate Conception',
    date: formatDate(year, 12, 8),
    type: 'special-non-working',
    description: 'Catholic religious feast honoring the Blessed Virgin Mary, Principal Patroness of the Philippines.',
  });

  // Christmas Eve
  holidays.push({
    id: `snw-christmas-eve-${year}`,
    name: 'Christmas Eve',
    date: formatDate(year, 12, 24),
    type: 'special-non-working',
    description: 'Eve of Christmas Day celebrated with family gatherings, midnight church services, and celebrations.',
  });

  // Last Day of the Year
  holidays.push({
    id: `snw-new-year-eve-${year}`,
    name: 'New Year’s Eve',
    date: formatDate(year, 12, 31),
    type: 'special-non-working',
    description: 'Final day of the Gregorian calendar year with nationwide civic countdown celebrations.',
  });

  // --- ISLAMIC HOLIDAYS (PROCLAIMED BY PRESIDENT) ---
  const islamic = ISLAMIC_HOLIDAYS_MAP[year];
  if (islamic) {
    holidays.push({
      id: `reg-eid-fitr-${year}`,
      name: 'Eid al-Fitr (Feast of Ramadhan)',
      date: islamic.eidFitr,
      type: 'regular',
      isMovable: true,
      description: 'Islamic holiday concluding the holy month of fasting (Ramadan); celebrated with community prayers and charity.',
    });
    holidays.push({
      id: `reg-eid-adha-${year}`,
      name: 'Eid al-Adha (Feast of the Sacrifice)',
      date: islamic.eidAdha,
      type: 'regular',
      isMovable: true,
      description: 'Major Islamic celebration commemorating the obedience of Prophet Ibrahim, celebrated by Muslim Filipinos nationwide.',
    });
  }

  // --- FAMOUS PHILIPPINE CULTURAL FESTIVALS & OBSERVANCES ---
  // 3rd Sunday of January: Sinulog (Cebu)
  const janSundays: number[] = [];
  for (let d = 1; d <= 31; d++) {
    if (new Date(year, 0, d).getDay() === 0) janSundays.push(d);
  }
  if (janSundays.length >= 3) {
    holidays.push({
      id: `cult-sinulog-${year}`,
      name: 'Sinulog Festival (Cebu)',
      date: formatDate(year, 1, janSundays[2]),
      type: 'cultural',
      isMovable: true,
      region: 'Cebu City',
      description: 'Renowned cultural and religious festival in Cebu celebrating heritage and devotion with elaborate street choreography.',
    });
  }

  // Ati-Atihan (3rd Sunday of January)
  if (janSundays.length >= 3) {
    holidays.push({
      id: `cult-ati-atihan-${year}`,
      name: 'Ati-Atihan Festival (Kalibo)',
      date: formatDate(year, 1, janSundays[2] - 1),
      type: 'cultural',
      isMovable: true,
      region: 'Kalibo, Aklan',
      description: 'Historical festival recognized as the Mother of Philippine Festivals, celebrated with rhythmic percussion and dance.',
    });
  }

  // Dinagyang (4th Sunday of January)
  if (janSundays.length >= 4) {
    holidays.push({
      id: `cult-dinagyang-${year}`,
      name: 'Dinagyang Festival (Iloilo)',
      date: formatDate(year, 1, janSundays[3]),
      type: 'cultural',
      isMovable: true,
      region: 'Iloilo City',
      description: 'Prestigious cultural showcase in Iloilo featuring precision choreography and synchronized drumming.',
    });
  }

  // Panagbenga (Baguio Flower Festival)
  holidays.push({
    id: `cult-panagbenga-${year}`,
    name: 'Panagbenga Flower Festival (Baguio)',
    date: formatDate(year, 2, 24),
    type: 'cultural',
    region: 'Baguio City',
    description: 'Annual month-long flower festival in the mountain city of Baguio showcasing floral floats and Cordilleran heritage.',
  });

  // Pahiyas Festival (May 15)
  holidays.push({
    id: `cult-pahiyas-${year}`,
    name: 'Pahiyas Harvest Festival (Lucban)',
    date: formatDate(year, 5, 15),
    type: 'cultural',
    region: 'Lucban, Quezon',
    description: 'Vibrant thanksgiving agricultural festival honoring San Isidro Labrador with rice-wafer decorated homes.',
  });

  // Santacruzan (May 31)
  holidays.push({
    id: `cult-santacruzan-${year}`,
    name: 'Santacruzan Procession Culmination',
    date: formatDate(year, 5, 31),
    type: 'cultural',
    description: 'Traditional procession commemorating historical cultural pageantry and floral tributes during May.',
  });

  // Kadayawan Festival (Davao) - 3rd Sunday of August
  const augSundays: number[] = [];
  for (let d = 1; d <= 31; d++) {
    if (new Date(year, 7, d).getDay() === 0) augSundays.push(d);
  }
  if (augSundays.length >= 3) {
    holidays.push({
      id: `cult-kadayawan-${year}`,
      name: 'Kadayawan Festival (Davao)',
      date: formatDate(year, 8, augSundays[2]),
      type: 'cultural',
      isMovable: true,
      region: 'Davao City',
      description: 'Thanksgiving celebration honoring indigenous ethnolinguistic heritage, harvest abundance, and regional arts in Mindanao.',
    });
  }

  // MassKara Festival (Bacolod) - 4th Sunday of October
  const octSundays: number[] = [];
  for (let d = 1; d <= 31; d++) {
    if (new Date(year, 9, d).getDay() === 0) octSundays.push(d);
  }
  if (octSundays.length >= 4) {
    holidays.push({
      id: `cult-masskara-${year}`,
      name: 'MassKara Festival (Bacolod)',
      date: formatDate(year, 10, octSundays[3]),
      type: 'cultural',
      isMovable: true,
      region: 'Bacolod City',
      description: 'World-famous festival in the City of Smiles showcasing elaborate smiling masks and dynamic street choreography.',
    });
  }

  // Simbang Gabi Start (Dec 16)
  holidays.push({
    id: `cult-simbang-gabi-${year}`,
    name: 'Start of Christmas Novena Services',
    date: formatDate(year, 12, 16),
    type: 'cultural',
    description: 'Opening day of the traditional nine-day dawn novena services preceding Christmas.',
  });

  // Sort chronologically by date
  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Filter holidays for a given month ('YYYY-MM')
 */
export function getHolidaysForMonth(year: number, month: number): HolidayItem[] {
  const all = getPhilippineHolidaysForYear(year);
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return all.filter((h) => h.date.startsWith(prefix));
}
