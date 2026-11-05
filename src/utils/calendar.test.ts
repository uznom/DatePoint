import test from 'node:test';
import assert from 'node:assert/strict';
import { getMoonPhaseForDate, getMoonPhaseValue, getJulianDate } from './moon';
import { getPhilippineHolidaysForYear, getEasterSunday, getHolidaysForMonth } from './phHolidays';

test('Julian Date calculation is accurate for standard reference', () => {
  // Jan 6, 2000 12:00 UTC should be close to 2451550.0
  const jd = getJulianDate(2000, 1, 6, 12);
  assert.ok(Math.abs(jd - 2451550.0) < 0.5, `Expected close to 2451550.0, got ${jd}`);
});

test('Moon phase calculates correct illumination range and category', () => {
  const moon = getMoonPhaseForDate('2026-05-15');
  assert.ok(moon.phaseValue >= 0 && moon.phaseValue <= 1, 'Phase value must be in [0, 1]');
  assert.ok(moon.illuminationPct >= 0 && moon.illuminationPct <= 100, 'Illumination must be 0-100%');
  assert.ok(moon.phaseName.length > 0, 'Phase name should not be empty');
  assert.ok(moon.filipinoPhaseName.length > 0, 'Filipino phase name should not be empty');
  assert.ok(moon.farmingFishingSignificance.length > 0, 'Significance text should exist');
});

test('Philippine holidays include major regular holidays and Undas for 2026', () => {
  const holidays2026 = getPhilippineHolidaysForYear(2026);
  
  // Verify New Year
  const newYear = holidays2026.find(h => h.name.includes("New Year's Day"));
  assert.ok(newYear, 'New Year must be present');
  assert.equal(newYear?.date, '2026-01-01');
  assert.equal(newYear?.type, 'regular');

  // Verify Independence Day
  const independence = holidays2026.find(h => h.name.includes('Independence Day'));
  assert.ok(independence, 'Independence Day must be present');
  assert.equal(independence?.date, '2026-06-12');
  assert.equal(independence?.type, 'regular');

  // Verify Rizal Day
  const rizal = holidays2026.find(h => h.name.includes('Rizal Day'));
  assert.ok(rizal, 'Rizal Day must be present');
  assert.equal(rizal?.date, '2026-12-30');

  // Verify All Saints' Day (Undas)
  const undas = holidays2026.find(h => h.name.includes("All Saints' Day"));
  assert.ok(undas, 'All Saints Day must be present');
  assert.equal(undas?.date, '2026-11-01');
  assert.equal(undas?.type, 'special-non-working');
});

test('Easter Sunday and Holy Week calculation is valid', () => {
  // Easter in 2026 is April 5, 2026
  const easter2026 = getEasterSunday(2026);
  assert.equal(easter2026.month, 4);
  assert.equal(easter2026.day, 5);

  const aprilHolidays = getHolidaysForMonth(2026, 4);
  const maundyThu = aprilHolidays.find(h => h.name === 'Maundy Thursday');
  const goodFri = aprilHolidays.find(h => h.name === 'Good Friday');
  const blackSat = aprilHolidays.find(h => h.name === 'Black Saturday');

  assert.ok(maundyThu, 'Maundy Thursday should be in April 2026');
  assert.equal(maundyThu?.date, '2026-04-02');
  assert.ok(goodFri, 'Good Friday should be in April 2026');
  assert.equal(goodFri?.date, '2026-04-03');
  assert.ok(blackSat, 'Black Saturday should be in April 2026');
  assert.equal(blackSat?.date, '2026-04-04');
});

test('Astronomical lunar phases for November 2026 align with celestial almanac', () => {
  const nov2 = getMoonPhaseForDate('2026-11-02');
  const nov9 = getMoonPhaseForDate('2026-11-09');
  const nov17 = getMoonPhaseForDate('2026-11-17');
  const nov24 = getMoonPhaseForDate('2026-11-24');

  // Nov 2: Third Quarter
  assert.equal(nov2.isMajorPhase, true);
  assert.equal(nov2.majorPhaseLabel, 'Third Quarter');

  // Nov 9: New Moon
  assert.equal(nov9.isMajorPhase, true);
  assert.equal(nov9.majorPhaseLabel, 'New Moon');
  assert.ok(nov9.illuminationPct <= 2, 'New Moon should have minimal illumination');

  // Nov 17: First Quarter
  assert.equal(nov17.isMajorPhase, true);
  assert.equal(nov17.majorPhaseLabel, 'First Quarter');

  // Nov 24: Full Moon
  assert.equal(nov24.isMajorPhase, true);
  assert.equal(nov24.majorPhaseLabel, 'Full Moon');
  assert.ok(nov24.illuminationPct >= 98, 'Full Moon should have maximum illumination');
});

import { getPaperDimensions, buildCalendarMonthCells, formatMajorPhaseShort } from './pdfExport';
import { getFontFamilyCss, getFontWeightCss } from './stylePresets';

test('1=1 paper dimensions match physical A4 and US Letter aspect ratios in landscape and portrait', () => {
  const a4Land = getPaperDimensions('a4', 'landscape');
  assert.equal(a4Land.widthMm, 297);
  assert.equal(a4Land.heightMm, 210);
  assert.equal(a4Land.logicalWidthPx, 1050);
  assert.equal(a4Land.logicalHeightPx, Math.round(1050 / (297 / 210)));

  const a4Port = getPaperDimensions('a4', 'portrait');
  assert.equal(a4Port.widthMm, 210);
  assert.equal(a4Port.heightMm, 297);
  assert.equal(a4Port.logicalWidthPx, 760);

  const letterLand = getPaperDimensions('letter', 'landscape');
  assert.equal(letterLand.widthMm, 279.4);
  assert.equal(letterLand.heightMm, 215.9);
  assert.ok(letterLand.logicalHeightPx > a4Land.logicalHeightPx, 'Letter landscape is taller in ratio than A4 landscape');
});

test('buildCalendarMonthCells produces full 7-column rows with accurate overflow days', () => {
  const nov2026 = buildCalendarMonthCells(2026, 11);
  assert.equal(nov2026.length % 7, 0, 'Cell count must be a multiple of 7');
  assert.equal(nov2026[0].dateStr, '2026-11-01');
  assert.equal(nov2026[0].isCurrentMonth, true);
  assert.equal(nov2026[34].dateStr, '2026-12-05');
  assert.equal(nov2026[34].isCurrentMonth, false);
});

test('Font family and weight helpers support Mi Sans and Mi Lanting for 1=1 canvas rendering', () => {
  assert.ok(getFontFamilyCss('mi-sans').includes('Mi Sans'));
  assert.ok(getFontFamilyCss('mi-lanting').includes('Mi Lanting'));
  assert.equal(getFontWeightCss('black'), 900);
  assert.equal(formatMajorPhaseShort('First Quarter'), '1st');
  assert.equal(formatMajorPhaseShort('Full Moon'), 'Full');
});

