import { jsPDF } from 'jspdf';
import { AdvertConfig, CalendarStyleConfig, HolidayItem, MoonPhaseCategory, UserEvent } from '../types';
import { getMoonPhaseForDate } from './moon';
import { getHolidaysForMonth } from './phHolidays';
import {
  DEFAULT_STYLE_CONFIG,
  MONO_FONT_STACK,
  getFontFamilyCss,
  getFontWeightCss,
  getTitleFontAxes,
} from './stylePresets';

export interface PdfExportOptions {
  year: number;
  month: number; // 1-12
  advertConfig: AdvertConfig;
  events: UserEvent[];
  styleConfig?: CalendarStyleConfig;
  orientation?: 'landscape' | 'portrait';
  fullYear: boolean; // true = all 12 months, false = single month
  dpiQuality?: 'standard-300' | 'ultra-450';
}

export interface SheetDimensions {
  widthMm: number;
  heightMm: number;
  logicalWidthPx: number;
  logicalHeightPx: number;
  aspectRatio: number;
}

export interface CalendarCellData {
  dayNumber: number;
  monthOffset: number; // -1 = prev, 0 = current, 1 = next
  dateStr: string;
  isCurrentMonth: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// In-memory cache of loaded HTMLImageElements so slider updates draw synchronously without flicker
const imageCache = new Map<string, HTMLImageElement>();

export function getCachedHeaderImage(url?: string): HTMLImageElement | null {
  if (!url) return null;
  return imageCache.get(url) || null;
}

export function loadHeaderImage(url?: string): Promise<HTMLImageElement | null> {
  if (!url || typeof Image === 'undefined') {
    return Promise.resolve(null);
  }
  const cached = imageCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Explicitly warms up and awaits web font faces used by the 1=1 canvas renderer
 * so exported PDFs and first-paint canvases always render with exact typography.
 */
export async function ensureCalendarFontsLoaded(styleConfig: CalendarStyleConfig): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    const fontFamily = getFontFamilyCss(styleConfig.fontFamily);
    const fontWeight = getFontWeightCss(styleConfig.fontWeight);
    const { slant } = getTitleFontAxes(styleConfig);
    await Promise.allSettled([
      document.fonts.ready,
      document.fonts.load(`${fontWeight} 28px ${fontFamily}`),
      ...(slant > 0 ? [document.fonts.load(`oblique ${slant}deg ${fontWeight} 28px ${fontFamily}`)] : []),
      document.fonts.load(`700 14px ${fontFamily}`),
      document.fonts.load(`600 12px ${fontFamily}`),
      document.fonts.load(`500 11px ${fontFamily}`),
      document.fonts.load(`400 10px ${fontFamily}`),
      document.fonts.load(`500 9px ${MONO_FONT_STACK}`),
    ]);
  } catch {
    // Ignore if font loading API fails in headless environments
  }
}

/**
 * Computes exact physical millimeter and 1=1 logical pixel dimensions for A4 and US Letter sheets.
 */
export function getPaperDimensions(
  paperSize: 'a4' | 'letter' = 'a4',
  orientation: 'landscape' | 'portrait' = 'landscape'
): SheetDimensions {
  const isLandscape = orientation === 'landscape';
  const baseShortMm = paperSize === 'letter' ? 215.9 : 210;
  const baseLongMm = paperSize === 'letter' ? 279.4 : 297;

  const widthMm = isLandscape ? baseLongMm : baseShortMm;
  const heightMm = isLandscape ? baseShortMm : baseLongMm;
  const aspectRatio = widthMm / heightMm;

  const logicalWidthPx = isLandscape ? 1050 : 760;
  const logicalHeightPx = Math.round(logicalWidthPx / aspectRatio);

  return {
    widthMm,
    heightMm,
    logicalWidthPx,
    logicalHeightPx,
    aspectRatio,
  };
}

/**
 * Generates the exact 35 or 42 calendar cells for a given year and month (1-12),
 * including trailing previous-month days and leading next-month days.
 */
export function buildCalendarMonthCells(year: number, month: number): CalendarCellData[] {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const cells: CalendarCellData[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = month === 1 ? 12 : month - 1;
    const prevY = month === 1 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ dayNumber: d, monthOffset: -1, dateStr, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ dayNumber: d, monthOffset: 0, dateStr, isCurrentMonth: true });
  }

  const remainingCells = 7 - (cells.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextM = month === 12 ? 1 : month + 1;
      const nextY = month === 12 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dayNumber: d, monthOffset: 1, dateStr, isCurrentMonth: false });
    }
  }

  return cells;
}

export function formatMajorPhaseShort(majorPhaseLabel: string | null): string {
  if (!majorPhaseLabel) return '';
  if (majorPhaseLabel === 'First Quarter') return '1st';
  if (majorPhaseLabel === 'Third Quarter') return '3rd';
  if (majorPhaseLabel === 'Full Moon') return 'Full';
  return 'New';
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (radius === 0) {
    ctx.rect(x, y, w, h);
  } else if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

type TitleFontAxes = ReturnType<typeof getTitleFontAxes>;
type CanvasWithStretch = CanvasRenderingContext2D & { fontStretch?: string };

/**
 * Applies a title font with the variable width (font-stretch) and slant (oblique angle)
 * settings. If the browser rejects the oblique shorthand, the upright font stays applied.
 */
function setTitleFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  sizePx: number,
  family: string,
  axes: TitleFontAxes,
) {
  const base = `${weight} ${sizePx}px ${family}`;
  ctx.font = base;
  if (axes.slant > 0) ctx.font = `oblique ${axes.slant}deg ${base}`;
  const c = ctx as CanvasWithStretch;
  if ('fontStretch' in c) c.fontStretch = axes.stretch;
}

function resetFontStretch(ctx: CanvasRenderingContext2D) {
  const c = ctx as CanvasWithStretch;
  if ('fontStretch' in c) c.fontStretch = 'normal';
}

function truncateTextToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (!text || maxWidth <= 0) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  const ellipsis = '…';
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = text.slice(0, mid).trimEnd() + ellipsis;
    if (ctx.measureText(candidate).width <= maxWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low > 0 ? text.slice(0, low).trimEnd() + ellipsis : '';
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Draws crisp vector micro-icons for the Sponsor Header contact column (Phone, Pin, Globe)
 */
function drawContactMicroIcon(
  ctx: CanvasRenderingContext2D,
  kind: 'phone' | 'pin' | 'globe',
  cx: number,
  cy: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (kind === 'phone') {
    ctx.beginPath();
    ctx.arc(cx, cy, 4.2, 0.2 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 2.3, cy - 1.6, 1.1, 0, Math.PI * 2);
    ctx.arc(cx + 2.3, cy + 1.6, 1.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'pin') {
    ctx.beginPath();
    ctx.arc(cx, cy - 1, 2.8, Math.PI * 0.85, Math.PI * 0.15, false);
    ctx.lineTo(cx, cy + 4);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 1.1, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, 3.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 1.8, 3.8, 0, 0, Math.PI * 2);
    ctx.moveTo(cx - 3.6, cy);
    ctx.lineTo(cx + 3.6, cy);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws the exact SVG astronomical MoonIcon onto a 2D canvas context.
 */
export function drawCanvasMoonIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  category: MoonPhaseCategory,
  illuminationPct: number,
  elongationDeg?: number,
  showGlow = false
) {
  let deg = elongationDeg;
  if (deg === undefined) {
    const isWax = category.startsWith('waxing') || category === 'first-quarter';
    const angleFromIllum = Math.acos(1 - (2 * illuminationPct) / 100) * (180 / Math.PI);
    deg = isWax ? angleFromIllum : 360 - angleFromIllum;
  }

  const isFull = illuminationPct >= 98 || category === 'full';
  const isNew = illuminationPct <= 2 || category === 'new';
  const isWaxing = deg > 0 && deg < 180;

  const r = 9.5;
  const cx = 12;
  const cy = 12;
  const theta = (deg * Math.PI) / 180;
  const rx = Math.max(0.01, r * Math.abs(Math.cos(theta))).toFixed(2);
  const topY = (cy - r).toFixed(1);
  const botY = (cy + r).toFixed(1);

  let pathD = '';
  if (!isFull && !isNew) {
    if (isWaxing) {
      if (illuminationPct < 50) {
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 1 ${cx} ${botY} A ${rx} ${r} 0 0 0 ${cx} ${topY} Z`;
      } else {
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 1 ${cx} ${botY} A ${rx} ${r} 0 0 1 ${cx} ${topY} Z`;
      }
    } else {
      if (illuminationPct >= 50) {
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 0 ${cx} ${botY} A ${rx} ${r} 0 0 0 ${cx} ${topY} Z`;
      } else {
        pathD = `M ${cx} ${topY} A ${r} ${r} 0 0 0 ${cx} ${botY} A ${rx} ${r} 0 0 1 ${cx} ${topY} Z`;
      }
    }
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);

  // Full moon glow
  if (showGlow && isFull) {
    const glowGrad = ctx.createRadialGradient(12, 12, 5.5, 12, 12, 11);
    glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.78)');
    glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(12, 12, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  // Base dark celestial body
  const darkGrad = ctx.createLinearGradient(0, 0, 24, 24);
  darkGrad.addColorStop(0, '#1E293B');
  darkGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = darkGrad;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.arc(12, 12, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dark side craters
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.beginPath();
  ctx.arc(9, 8.5, 1.1, 0, Math.PI * 2);
  ctx.arc(14, 14.5, 1.6, 0, Math.PI * 2);
  ctx.arc(14.5, 9, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Illuminated portion
  const lightGrad = ctx.createLinearGradient(0, 0, 24, 24);
  lightGrad.addColorStop(0, '#FEF9C3');
  lightGrad.addColorStop(0.65, '#FDE047');
  lightGrad.addColorStop(1, '#EAB308');

  if (isFull) {
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.arc(12, 12, r, 0, Math.PI * 2);
    ctx.fill();

    // Crater shadows on full moon
    ctx.fillStyle = 'rgba(202, 138, 4, 0.22)';
    ctx.beginPath();
    ctx.arc(10, 9, 1.5, 0, Math.PI * 2);
    ctx.arc(14, 14, 2.2, 0, Math.PI * 2);
    ctx.arc(15, 8, 1.2, 0, Math.PI * 2);
    ctx.arc(8, 14, 1.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (isNew) {
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 0.85;
    ctx.setLineDash([1.5, 1.5]);
    ctx.beginPath();
    ctx.arc(12, 12, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (pathD && typeof Path2D !== 'undefined') {
    ctx.fillStyle = lightGrad;
    const p = new Path2D(pathD);
    ctx.fill(p);
  }

  ctx.restore();
}

export interface RenderSheetParams {
  year: number;
  month: number;
  advertConfig: AdvertConfig;
  styleConfig: CalendarStyleConfig;
  holidays: HolidayItem[];
  events: UserEvent[];
  headerImg?: HTMLImageElement | null;
  scale?: number;
}

/**
 * Renders the complete 1=1 calendar sheet onto the given HTMLCanvasElement.
 * Used identically by both the live 1=1 PrintPreviewSheet and the PDF exporter.
 */
export function renderCalendarSheetToCanvas(
  canvas: HTMLCanvasElement,
  params: RenderSheetParams
): SheetDimensions {
  const {
    year,
    month,
    advertConfig,
    styleConfig,
    holidays,
    events,
    headerImg = getCachedHeaderImage(styleConfig.headerImage?.url),
    scale = 3.5,
  } = params;

  const orientation = styleConfig.printOrientation || 'landscape';
  const paperSize = styleConfig.paperSize || 'a4';
  const dims = getPaperDimensions(paperSize, orientation);
  const W = dims.logicalWidthPx;
  const H = dims.logicalHeightPx;
  const isLandscape = orientation === 'landscape';

  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return dims;

  ctx.save();
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 0. Crisp Pure White Sheet Base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const fontFamily = getFontFamilyCss(styleConfig.fontFamily);
  const fontWeight = getFontWeightCss(styleConfig.fontWeight);
  const titleAxes = getTitleFontAxes(styleConfig);
  const borderRadius = styleConfig.borderRadius ?? 12;
  const borderWidth = Math.max(0.5, styleConfig.borderWidth ?? 1);
  const borderColor = styleConfig.borderColor || '#cbd5e1';
  const titleTextColor = styleConfig.titleTextColor || '#09090b';
  const sundayColor = styleConfig.sundayColor || '#dc2626';
  const weekdayBgColor = styleConfig.weekdayBgColor || '#f8fafc';
  const weekdayTextColor = styleConfig.weekdayTextColor || '#334155';
  const cellBgColor = styleConfig.cellBgColor || '#ffffff';
  const dayNumberColor = styleConfig.dayNumberColor || '#1e293b';
  const holidayBadgeStyle = styleConfig.holidayBadgeStyle || 'stripe';
  const headerImage = styleConfig.headerImage;
  const hasImage = Boolean(headerImage?.enabled && headerImage?.url && headerImg);

  // Convert printMargin (mm) to logical pixels
  const mmToPx = W / dims.widthMm;
  const pad = Math.max(4, styleConfig.printMargin ?? 8) * mmToPx;

  const contentX = pad;
  let curY = pad;
  const contentW = W - pad * 2;
  const contentBottom = H - pad;

  // 0.5 Wall Calendar Hole-Punch Guide
  if (styleConfig.showHolePunchGuide) {
    const punchY = Math.max(11, pad * 0.48);
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const px = W * 0.12 + (W * 0.76 * i) / 5;
      ctx.fillStyle = '#f4f4f5';
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.arc(px, punchY, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#71717a';
      ctx.font = `500 6.5px ${MONO_FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('PUNCH', px, punchY + 6.5);
    }
    ctx.restore();

    if (curY < punchY + 18) {
      curY = punchY + 18;
    }
  }

  // 1. ADVERT SPONSOR BANNER
  if (advertConfig.enabled) {
    const logoPx =
      headerImage?.size === 'small' ? 38 : headerImage?.size === 'large' ? 58 : 48;
    const bannerH = Math.max(isLandscape ? 74 : 78, hasImage ? logoPx + 24 : 74);
    const bannerX = contentX;
    const bannerY = curY;
    const bannerW = contentW;

    // Optional subtle shadow
    if (styleConfig.showGridShadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      drawRoundedRectPath(ctx, bannerX, bannerY, bannerW, bannerH, borderRadius);
      ctx.fillStyle = styleConfig.headerBgColor || '#1e3a8a';
      ctx.fill();
      ctx.restore();
    }

    // Clip to banner rounded rect
    ctx.save();
    drawRoundedRectPath(ctx, bannerX, bannerY, bannerW, bannerH, borderRadius);
    ctx.clip();

    // 135deg Linear Gradient Background
    const grad = ctx.createLinearGradient(
      bannerX,
      bannerY,
      bannerX + bannerW,
      bannerY + bannerH
    );
    grad.addColorStop(0, styleConfig.headerBgColor || '#1e3a8a');
    grad.addColorStop(1, styleConfig.headerGradientEnd || '#172554');
    ctx.fillStyle = grad;
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

    // Optional Banner Background or Center Watermark Image
    if (hasImage && headerImg && headerImage.placement === 'banner-bg') {
      ctx.save();
      ctx.globalAlpha = (headerImage.opacity ?? 30) / 100;
      drawImageCover(ctx, headerImg, bannerX, bannerY, bannerW, bannerH);
      ctx.restore();
    } else if (hasImage && headerImg && headerImage.placement === 'center-watermark') {
      ctx.save();
      ctx.globalAlpha = (headerImage.opacity ?? 20) / 100;
      try {
        ctx.filter = 'grayscale(100%) brightness(125%)';
      } catch {
        // ignore if unsupported
      }
      const wmW = bannerW * 0.45;
      const wmH = bannerH * 0.88;
      drawImageContain(
        ctx,
        headerImg,
        bannerX + (bannerW - wmW) / 2,
        bannerY + (bannerH - wmH) / 2,
        wmW,
        wmH
      );
      ctx.restore();
    }

    const innerPadX = 16;
    let leftCursorX = bannerX + innerPadX;
    let rightCursorX = bannerX + bannerW - innerPadX;

    const drawLogoBadge = (lx: number, ly: number) => {
      if (!headerImg) return;
      const shapeRadius =
        headerImage.shape === 'circle'
          ? logoPx / 2
          : headerImage.shape === 'rounded'
          ? 9
          : 2;

      ctx.save();
      drawRoundedRectPath(ctx, lx, ly, logoPx, logoPx, shapeRadius);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.clip();

      ctx.globalAlpha = (headerImage.opacity ?? 100) / 100;
      drawImageContain(ctx, headerImg, lx + 4, ly + 4, logoPx - 8, logoPx - 8);
      ctx.restore();
    };

    if (hasImage && headerImage.placement === 'left') {
      drawLogoBadge(leftCursorX, bannerY + (bannerH - logoPx) / 2);
      leftCursorX += logoPx + 13;
    }

    if (hasImage && headerImage.placement === 'right') {
      drawLogoBadge(rightCursorX - logoPx, bannerY + (bannerH - logoPx) / 2);
      rightCursorX -= logoPx + 13;
    }

    const showHeaderAccent = styleConfig.showHeaderAccent !== false;
    const accentIconColor = showHeaderAccent
      ? (styleConfig.headerAccentColor || '#fde047')
      : (styleConfig.headerTextColor || '#ffffff');

    // Collect non-empty contact lines so we only render active contact info
    const contactEntries: Array<{
      kind: 'phone' | 'pin' | 'globe';
      text: string;
      font: string;
      alpha: number;
    }> = [];

    if (advertConfig.hotline && advertConfig.hotline.trim()) {
      contactEntries.push({
        kind: 'phone',
        text: advertConfig.hotline.trim(),
        font: `600 10px ${fontFamily}`,
        alpha: 1,
      });
    }
    if (advertConfig.address && advertConfig.address.trim()) {
      contactEntries.push({
        kind: 'pin',
        text: advertConfig.address.trim(),
        font: `400 9.5px ${fontFamily}`,
        alpha: 0.92,
      });
    }
    if (advertConfig.website && advertConfig.website.trim()) {
      contactEntries.push({
        kind: 'globe',
        text: advertConfig.website.trim(),
        font: `500 9px ${MONO_FONT_STACK}`,
        alpha: 0.92,
      });
    }

    let maxBrandW = Math.max(120, rightCursorX - leftCursorX - 12);

    if (contactEntries.length > 0) {
      const contactBlockW = isLandscape ? 225 : 192;
      const dividerX = rightCursorX - contactBlockW - 14;
      maxBrandW = Math.max(120, dividerX - leftCursorX - 16);

      // Vertical divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dividerX, bannerY + 13);
      ctx.lineTo(dividerX, bannerY + bannerH - 13);
      ctx.stroke();

      const iconCenterX = dividerX + 14;
      const textStartX = dividerX + 24;
      const maxContactTextW = contactBlockW - 10;
      const lineSpacing = 14;
      const totalH = (contactEntries.length - 1) * lineSpacing;
      const startY = bannerY + bannerH / 2 - totalH / 2;

      contactEntries.forEach((entry, idx) => {
        const lineY = startY + idx * lineSpacing;
        drawContactMicroIcon(ctx, entry.kind, iconCenterX, lineY, accentIconColor);

        ctx.save();
        ctx.globalAlpha = entry.alpha;
        ctx.fillStyle = styleConfig.headerTextColor || '#ffffff';
        ctx.font = entry.font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          truncateTextToWidth(ctx, entry.text, maxContactTextW),
          textStartX,
          lineY + 0.5
        );
        ctx.restore();
      });
    }

    // Left: Business Name & Tagline
    const hasTagline = Boolean(advertConfig.tagline && advertConfig.tagline.trim());
    const titleFontSize = isLandscape ? 18 : 16;
    ctx.fillStyle = styleConfig.headerTextColor || '#ffffff';
    setTitleFont(ctx, fontWeight, titleFontSize, fontFamily, titleAxes);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      truncateTextToWidth(ctx, (advertConfig.businessName || '').toUpperCase(), maxBrandW),
      leftCursorX,
      hasTagline ? bannerY + bannerH / 2 - 9.5 : bannerY + bannerH / 2
    );
    resetFontStretch(ctx);

    if (hasTagline) {
      ctx.save();
      if (!showHeaderAccent) {
        ctx.globalAlpha = 0.92;
      }
      ctx.fillStyle = accentIconColor;
      ctx.font = `500 11px ${fontFamily}`;
      ctx.fillText(
        truncateTextToWidth(ctx, advertConfig.tagline.trim(), maxBrandW),
        leftCursorX,
        bannerY + bannerH / 2 + 11.5
      );
      ctx.restore();
    }

    ctx.restore(); // undo banner clip

    // Banner border
    if (showHeaderAccent && (styleConfig.headerBorderWidth ?? 0) > 0) {
      ctx.save();
      drawRoundedRectPath(ctx, bannerX, bannerY, bannerW, bannerH, borderRadius);
      ctx.strokeStyle = styleConfig.headerAccentColor || '#eab308';
      ctx.lineWidth = styleConfig.headerBorderWidth;
      ctx.stroke();
      ctx.restore();
    }

    curY += bannerH + 11;
  }

  // 2. CALENDAR TITLE HEADER WITH CONFIGURABLE ALIGNMENT
  const titleH = isLandscape ? 32 : 30;
  const titleBaselineY = curY + titleH * 0.75;
  const monthUpper = MONTH_NAMES[month - 1].toUpperCase();
  const monthTitle = `${monthUpper} ${year}`;
  const mainTitleSize = isLandscape ? 27.5 : 25;

  ctx.fillStyle = titleTextColor;
  setTitleFont(ctx, fontWeight, mainTitleSize, fontFamily, titleAxes);
  ctx.textBaseline = 'alphabetic';

  if (styleConfig.monthYearAlignment === 'center') {
    ctx.textAlign = 'center';
    ctx.fillText(monthTitle, contentX + contentW / 2, titleBaselineY);
  } else if (styleConfig.monthYearAlignment === 'right') {
    ctx.textAlign = 'right';
    ctx.fillText(monthTitle, contentX + contentW, titleBaselineY);
  } else if (styleConfig.monthYearAlignment === 'left') {
    ctx.textAlign = 'left';
    ctx.fillText(monthTitle, contentX, titleBaselineY);
  } else {
    // 'split': Month on left, Year on right
    ctx.textAlign = 'left';
    ctx.fillText(monthUpper, contentX, titleBaselineY);

    ctx.textAlign = 'right';
    ctx.fillText(String(year), contentX + contentW, titleBaselineY);
  }
  resetFontStretch(ctx);

  curY += titleH + 8;

  // 3. DYNAMIC EDGE-TO-EDGE CALENDAR GRID
  const showMoonPhases = styleConfig.showMoonPhases !== false;
  const showHolidays = styleConfig.showHolidays !== false;
  const showCultural = styleConfig.showCultural !== false;
  const showWeekNumbers = Boolean(styleConfig.showWeekNumbers);
  const showMemoLines = Boolean(styleConfig.showMemoLines);
  const dateFontWeight = getFontWeightCss(styleConfig.dateFontWeight || styleConfig.fontWeight);

  const hasFooterBar = showMoonPhases || showHolidays;
  const footerH = hasFooterBar ? 23 : 0;
  const footerY = contentBottom - footerH;

  const memoBoxH = showMemoLines ? (isLandscape ? 54 : 68) : 0;
  const memoBoxY = (hasFooterBar ? footerY - 7 : contentBottom) - memoBoxH;

  const gridX = contentX;
  const gridY = curY;
  const gridW = contentW;
  const gridBottom = showMemoLines
    ? memoBoxY - 8
    : hasFooterBar
    ? footerY - 7
    : contentBottom;
  const gridH = Math.max(180, gridBottom - gridY);

  if (styleConfig.showGridShadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.05)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    drawRoundedRectPath(ctx, gridX, gridY, gridW, gridH, borderRadius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }

  const cells = buildCalendarMonthCells(year, month);
  const numRows = Math.ceil(cells.length / 7);
  const weekdayHeaderH =
    styleConfig.gridDensity === 'compact'
      ? 24
      : styleConfig.gridDensity === 'spacious'
      ? 30
      : 27;
  const colW = gridW / 7;
  const rowH = (gridH - weekdayHeaderH) / numRows;
  const cellPad =
    styleConfig.gridDensity === 'compact'
      ? 5
      : styleConfig.gridDensity === 'spacious'
      ? 8
      : 6.5;

  // Proportional day number size with configurable dateNumberSize ('sm' | 'md' | 'lg' | 'xl')
  const baseDayNumSize = Math.min(18.5, Math.max(13.5, Math.min(colW, rowH) * 0.21));
  const sizeScale =
    styleConfig.dateNumberSize === 'sm'
      ? 0.85
      : styleConfig.dateNumberSize === 'lg'
      ? 1.22
      : styleConfig.dateNumberSize === 'xl'
      ? 1.45
      : 1.0;
  const dayNumSize = Math.round(
    (styleConfig.gridDensity === 'compact'
      ? baseDayNumSize - 1
      : styleConfig.gridDensity === 'spacious'
      ? baseDayNumSize + 1
      : baseDayNumSize) * sizeScale * 10
  ) / 10;

  // Clip inside rounded grid container
  ctx.save();
  drawRoundedRectPath(ctx, gridX, gridY, gridW, gridH, borderRadius);
  ctx.clip();

  // Base cell fill
  ctx.fillStyle = cellBgColor;
  ctx.fillRect(gridX, gridY, gridW, gridH);

  // Weekday Header Bar
  ctx.fillStyle = weekdayBgColor;
  ctx.fillRect(gridX, gridY, gridW, weekdayHeaderH);

  // Subtle Sunday column header tint
  ctx.save();
  ctx.fillStyle = 'rgba(254, 226, 226, 0.22)';
  ctx.fillRect(gridX, gridY, colW, weekdayHeaderH);
  ctx.restore();

  for (let col = 0; col < 7; col++) {
    const isSunday = col === 0;
    ctx.fillStyle = isSunday ? sundayColor : weekdayTextColor;
    ctx.font = `${fontWeight} 11.5px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      WEEKDAYS_SHORT[col],
      gridX + col * colW + colW / 2,
      gridY + weekdayHeaderH / 2 + 0.5
    );
  }

  // Helper to compute calendar week number (1-53)
  const getWeekNumber = (dateStr: string): number => {
    const d = new Date(dateStr + 'T00:00:00');
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const diffDays = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
    return Math.max(1, Math.ceil((diffDays + startOfYear.getDay() + 1) / 7));
  };

  // Day Cells Content
  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx];
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const cx = gridX + col * colW;
    const cy = gridY + weekdayHeaderH + row * rowH;
    const isSunday = col === 0;

    const moon = getMoonPhaseForDate(cell.dateStr);
    const dayHolidays = holidays.filter((h) => {
      if (h.date !== cell.dateStr) return false;
      if (h.type === 'cultural' && !showCultural) return false;
      if ((h.type === 'regular' || h.type === 'special-non-working') && !showHolidays) return false;
      return true;
    });
    const dayEvents = events.filter((e) => e.date === cell.dateStr);
    const hasRegular = dayHolidays.some((h) => h.type === 'regular');

    // Cell background
    if (!cell.isCurrentMonth) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cx, cy, colW, rowH);
    } else if (hasRegular || isSunday) {
      ctx.fillStyle = 'rgba(254, 242, 242, 0.35)';
      ctx.fillRect(cx, cy, colW, rowH);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(cx + 1, cy + 1, colW - 2, rowH - 2);
    ctx.clip();

    if (!cell.isCurrentMonth) {
      ctx.globalAlpha = 0.38;
    }

    // Top Left: Day Number (using independent dateFontWeight & dateNumberSize)
    const dayStr = String(cell.dayNumber);
    ctx.fillStyle = hasRegular || isSunday ? sundayColor : dayNumberColor;
    ctx.font = `${dateFontWeight} ${dayNumSize}px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(dayStr, cx + cellPad, cy + cellPad);

    // Optional Week Number pill on the first column (Sunday) of each row
    if (showWeekNumbers && col === 0) {
      const dayWidth = ctx.measureText(dayStr).width;
      const wkNum = getWeekNumber(cell.dateStr);
      const wkLabel = `W${wkNum}`;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.font = `600 7px ${MONO_FONT_STACK}`;
      const wkW = ctx.measureText(wkLabel).width + 6;
      const wkH = 10.5;
      const wkX = cx + cellPad + dayWidth + 4.5;
      const wkY = cy + cellPad + Math.max(0, (dayNumSize - wkH) * 0.35);
      drawRoundedRectPath(ctx, wkX, wkY, wkW, wkH, 3);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(wkLabel, wkX + wkW / 2, wkY + wkH / 2 + 0.5);
      ctx.restore();
    }

    // Top Right: Moon Icon + Illumination % + Major Phase Label (if enabled)
    if (showMoonPhases) {
      const moonSize = Math.min(13, Math.max(11.5, rowH * 0.15));
      const moonX = cx + colW - cellPad - moonSize;
      const moonY = cy + cellPad;

      drawCanvasMoonIcon(
        ctx,
        moonX,
        moonY,
        moonSize,
        moon.category,
        moon.illuminationPct,
        moon.elongationDeg,
        moon.majorPhaseLabel === 'Full Moon'
      );

      ctx.fillStyle = '#64748b';
      ctx.font = `500 7.2px ${MONO_FONT_STACK}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const pctText = `${moon.illuminationPct}%`;
      const pctX = moonX - 3.2;
      const moonCenterY = moonY + moonSize / 2;
      ctx.fillText(pctText, pctX, moonCenterY);

      if (moon.isMajorPhase && moon.majorPhaseLabel) {
        const pctWidth = ctx.measureText(pctText).width;
        const shortPhase = formatMajorPhaseShort(moon.majorPhaseLabel);
        const phaseX = pctX - pctWidth - 3.5;

        ctx.fillStyle =
          moon.majorPhaseLabel === 'Full Moon'
            ? '#b45309'
            : moon.majorPhaseLabel === 'New Moon'
            ? '#334155'
            : '#1d4ed8';
        ctx.font = `700 7.5px ${fontFamily}`;
        ctx.fillText(shortPhase, phaseX, moonCenterY);
      }
    }

    // Bottom of Cell: Holidays & User Events
    type BadgeItem =
      | { kind: 'holiday'; holiday: HolidayItem }
      | { kind: 'event'; event: UserEvent };

    const badgeItems: BadgeItem[] = [
      ...dayHolidays.map((holiday): BadgeItem => ({ kind: 'holiday', holiday })),
      ...dayEvents.map((event): BadgeItem => ({ kind: 'event', event })),
    ];

    if (badgeItems.length > 0) {
      const badgeH = Math.min(13.5, Math.max(11.5, rowH * 0.155));
      const badgeFontPx = Math.min(8.4, Math.max(7.4, badgeH * 0.65));
      const badgeGap = 2.2;
      const maxTopY = cy + cellPad + dayNumSize + 3.5;
      const availH = Math.max(0, cy + rowH - cellPad - maxTopY);
      const maxSlots = Math.max(
        1,
        Math.floor((availH + badgeGap) / (badgeH + badgeGap))
      );

      const hasOverflow = badgeItems.length > maxSlots && maxSlots >= 2;
      const visibleBadges = hasOverflow
        ? badgeItems.slice(0, maxSlots - 1)
        : badgeItems.slice(0, maxSlots);
      const hiddenCount = badgeItems.length - visibleBadges.length;
      const totalRenderedRows = visibleBadges.length + (hasOverflow ? 1 : 0);

      const totalStackH =
        totalRenderedRows * badgeH + (totalRenderedRows - 1) * badgeGap;
      let by = cy + rowH - cellPad - totalStackH;
      const bx = cx + cellPad;
      const bw = colW - cellPad * 2;

      for (const item of visibleBadges) {
        if (item.kind === 'holiday') {
          const h = item.holiday;
          const isReg = h.type === 'regular';
          const isSpec = h.type === 'special-non-working';

          const bgCol = isReg ? '#fee2e2' : isSpec ? '#f3e8ff' : '#fef3c7';
          const txtCol = isReg ? '#991b1b' : isSpec ? '#6b21a8' : '#92400e';
          const accentCol = isReg ? '#dc2626' : isSpec ? '#9333ea' : '#d97706';
          const borderCol = isReg ? '#fecaca' : isSpec ? '#e9d5ff' : '#fde68a';

          if (holidayBadgeStyle === 'minimal') {
            ctx.fillStyle = accentCol;
            ctx.beginPath();
            ctx.arc(bx + 3, by + badgeH / 2, 2.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1e293b';
            ctx.font = `600 ${badgeFontPx}px ${fontFamily}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              truncateTextToWidth(ctx, h.name, bw - 9),
              bx + 8,
              by + badgeH / 2 + 0.5
            );
          } else if (holidayBadgeStyle === 'pill') {
            drawRoundedRectPath(ctx, bx, by, bw, badgeH, badgeH / 2);
            ctx.fillStyle = bgCol;
            ctx.fill();
            ctx.strokeStyle = borderCol;
            ctx.lineWidth = 0.75;
            ctx.stroke();

            ctx.fillStyle = txtCol;
            ctx.font = `700 ${badgeFontPx}px ${fontFamily}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              truncateTextToWidth(ctx, h.name, bw - 10),
              bx + 5.5,
              by + badgeH / 2 + 0.5
            );
          } else {
            // 'stripe'
            ctx.save();
            drawRoundedRectPath(ctx, bx, by, bw, badgeH, 2.5);
            ctx.fillStyle = bgCol;
            ctx.fill();
            ctx.clip();

            ctx.fillStyle = accentCol;
            ctx.fillRect(bx, by, 2.8, badgeH);
            ctx.restore();

            ctx.fillStyle = txtCol;
            ctx.font = `700 ${badgeFontPx}px ${fontFamily}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              truncateTextToWidth(ctx, h.name, bw - 9.5),
              bx + 5.8,
              by + badgeH / 2 + 0.5
            );
          }
        } else {
          const ev = item.event;
          ctx.save();
          drawRoundedRectPath(ctx, bx, by, bw, badgeH, 2.5);
          ctx.fillStyle = '#eef2ff';
          ctx.fill();
          ctx.clip();

          ctx.fillStyle = '#6366f1';
          ctx.fillRect(bx, by, 2.8, badgeH);
          ctx.restore();

          ctx.fillStyle = '#3730a3';
          ctx.font = `600 ${badgeFontPx}px ${fontFamily}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            truncateTextToWidth(ctx, `• ${ev.title}`, bw - 9.5),
            bx + 5.5,
            by + badgeH / 2 + 0.5
          );
        }

        by += badgeH + badgeGap;
      }

      if (hasOverflow && hiddenCount > 0) {
        drawRoundedRectPath(ctx, bx, by, bw, badgeH, 2.5);
        ctx.fillStyle = '#f1f5f9';
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.font = `600 ${badgeFontPx - 0.5}px ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${hiddenCount} more`, bx + 5, by + badgeH / 2 + 0.5);
      }
    }

    ctx.restore();
  }

  // Grid Internal Divider Lines (crisp hairline weight)
  const innerLineWidth = Math.max(0.75, borderWidth * 0.8);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = innerLineWidth;

  // Weekday bottom line
  ctx.beginPath();
  ctx.moveTo(gridX, gridY + weekdayHeaderH);
  ctx.lineTo(gridX + gridW, gridY + weekdayHeaderH);
  ctx.stroke();

  // Vertical column lines
  for (let col = 1; col < 7; col++) {
    const lx = gridX + col * colW;
    ctx.beginPath();
    ctx.moveTo(lx, gridY);
    ctx.lineTo(lx, gridY + gridH);
    ctx.stroke();
  }

  // Horizontal row lines
  for (let row = 1; row < numRows; row++) {
    const ly = gridY + weekdayHeaderH + row * rowH;
    ctx.beginPath();
    ctx.moveTo(gridX, ly);
    ctx.lineTo(gridX + gridW, ly);
    ctx.stroke();
  }

  ctx.restore(); // undo grid clip

  // Outer Grid Rounded Border (authoritative frame stroke)
  ctx.save();
  drawRoundedRectPath(ctx, gridX, gridY, gridW, gridH, borderRadius);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = Math.max(1.1, borderWidth);
  ctx.stroke();
  ctx.restore();

  // 3.5 OPTIONAL PRINTABLE MONTHLY NOTES & REMINDERS RULED BOX
  if (showMemoLines) {
    ctx.save();
    drawRoundedRectPath(ctx, contentX, memoBoxY, contentW, memoBoxH, Math.min(10, borderRadius));
    ctx.fillStyle = weekdayBgColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, borderWidth * 0.9);
    ctx.stroke();

    ctx.fillStyle = weekdayTextColor;
    ctx.font = `${fontWeight} 9px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MONTHLY NOTES & IMPORTANT REMINDERS', contentX + 12, memoBoxY + 8);

    // Draw 2 or 3 ruled writing lines across 2 columns in landscape or 1 column in portrait
    const numCols = isLandscape ? 2 : 1;
    const colGap = 24;
    const lineColW = (contentW - 24 - (numCols - 1) * colGap) / numCols;
    const numLines = isLandscape ? 2 : 3;
    const firstLineY = memoBoxY + 28;
    const lineStep = 14;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 0.75;
    ctx.setLineDash([2, 2]);
    for (let c = 0; c < numCols; c++) {
      const lx = contentX + 12 + c * (lineColW + colGap);
      for (let r = 0; r < numLines; r++) {
        const ly = firstLineY + r * lineStep;
        if (ly < memoBoxY + memoBoxH - 5) {
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + lineColW, ly);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 4. FOOTER BAR: LUNAR KEY (left) & HOLIDAY KEY (right)
  if (hasFooterBar) {
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(contentX, footerY);
    ctx.lineTo(contentX + contentW, footerY);
    ctx.stroke();

    const footerCenterY = footerY + footerH * 0.62;

    if (showMoonPhases) {
      let fx = contentX;
      ctx.fillStyle = '#3f3f46';
      ctx.font = `700 8.8px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('LUNAR KEY:', fx, footerCenterY);
      fx += ctx.measureText('LUNAR KEY:').width + 10;

      const lunarKeyItems: Array<{
        label: string;
        category: MoonPhaseCategory;
        pct: number;
        deg: number;
      }> = [
        { label: 'New', category: 'new', pct: 0, deg: 0 },
        { label: '1st Qtr', category: 'first-quarter', pct: 50, deg: 90 },
        { label: 'Full Moon', category: 'full', pct: 100, deg: 180 },
        { label: '3rd Qtr', category: 'last-quarter', pct: 50, deg: 270 },
      ];

      for (const item of lunarKeyItems) {
        drawCanvasMoonIcon(
          ctx,
          fx,
          footerCenterY - 5.5,
          11,
          item.category,
          item.pct,
          item.deg,
          false
        );
        fx += 13.5;
        ctx.fillStyle = '#52525b';
        ctx.font = `500 8.8px ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, fx, footerCenterY);
        fx += ctx.measureText(item.label).width + 11;
      }
    }

    if (showHolidays) {
      const holidayLegend: Array<{ label: string; color: string }> = [
        { label: 'Regular Holiday', color: '#dc2626' },
        { label: 'Special Non-Working', color: '#9333ea' },
        ...(showCultural ? [{ label: 'Observance', color: '#d97706' }] : []),
      ];

      let rx = contentX + contentW;
      ctx.font = `500 8.5px ${fontFamily}`;
      ctx.textBaseline = 'middle';

      for (let i = holidayLegend.length - 1; i >= 0; i--) {
        const item = holidayLegend[i];
        const labelW = ctx.measureText(item.label).width;
        ctx.fillStyle = '#52525b';
        ctx.textAlign = 'right';
        ctx.fillText(item.label, rx, footerCenterY);
        rx -= labelW + 5.5;

        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(rx, footerCenterY - 0.5, 2.8, 0, Math.PI * 2);
        ctx.fill();
        rx -= 11;
      }

      ctx.fillStyle = '#3f3f46';
      ctx.font = `700 8.5px ${fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText('HOLIDAYS:', rx + 2, footerCenterY);
    }
  }

  ctx.restore();
  return dims;
}

/**
 * Exports a single month or full 12-month calendar to a commercial print-ready PDF
 * with 100% 1=1 fidelity to the PrintPreviewSheet and ultra-crisp supersampled DPI.
 */
export async function exportCalendarToPdf(options: PdfExportOptions): Promise<void> {
  const {
    year,
    month,
    advertConfig,
    events,
    styleConfig = DEFAULT_STYLE_CONFIG,
    orientation = styleConfig.printOrientation || 'landscape',
    fullYear,
    dpiQuality = 'ultra-450',
  } = options;

  const effectiveStyle: CalendarStyleConfig = {
    ...styleConfig,
    printOrientation: orientation,
  };

  // Explicitly pre-load all required font faces and header emblem before rendering
  await ensureCalendarFontsLoaded(effectiveStyle);

  const headerImg =
    effectiveStyle.headerImage?.enabled && effectiveStyle.headerImage?.url
      ? await loadHeaderImage(effectiveStyle.headerImage.url)
      : null;

  const paperFormat = effectiveStyle.paperSize === 'letter' ? 'letter' : 'a4';
  const dims = getPaperDimensions(paperFormat, orientation);

  const doc = new jsPDF({
    orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: paperFormat,
    compress: true,
    precision: 16,
  });

  const fileSuffix = fullYear
    ? `FullYear_${year}`
    : `${MONTH_NAMES[month - 1]}_${year}`;

  doc.setProperties({
    title: `DatePoint Calendar - ${fileSuffix.replace('_', ' ')}`,
    subject: `1=1 Print-Ready Calendar (${paperFormat.toUpperCase()} ${orientation})`,
    author: advertConfig.enabled && advertConfig.businessName ? advertConfig.businessName : 'DatePoint Calendar Studio',
    creator: 'DatePoint 1=1 Print Engine',
  });

  const monthsToRender = fullYear
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    : [month];

  // Ultra-HD supersampling scale for razor-sharp typography, borders, and lunar vectors
  const renderScale =
    dpiQuality === 'ultra-450'
      ? fullYear
        ? 4.0
        : 4.5
      : 3.2;

  const offscreenCanvas = document.createElement('canvas');

  monthsToRender.forEach((m, index) => {
    if (index > 0) {
      doc.addPage(paperFormat, orientation === 'landscape' ? 'landscape' : 'portrait');
    }

    const monthHolidays = getHolidaysForMonth(year, m);

    renderCalendarSheetToCanvas(offscreenCanvas, {
      year,
      month: m,
      advertConfig,
      styleConfig: effectiveStyle,
      holidays: monthHolidays,
      events,
      headerImg,
      scale: renderScale,
    });

    const dataUrl = offscreenCanvas.toDataURL('image/png', 1.0);
    doc.addImage(
      dataUrl,
      'PNG',
      0,
      0,
      dims.widthMm,
      dims.heightMm,
      `page_${m}`,
      'NONE'
    );
  });

  doc.save(`DatePoint_Calendar_${fileSuffix}_${orientation}.pdf`);
}
