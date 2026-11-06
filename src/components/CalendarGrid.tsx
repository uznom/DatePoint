import React from 'react';
import { CalendarStyleConfig, HolidayItem, UserEvent } from '../types';
import { getMoonPhaseForDate } from '../utils/moon';
import { getFontFamilyCss, getFontWeightCss } from '../utils/stylePresets';
import { MoonIcon } from './MoonIcon';
import { Surface, Chip } from '@heroui/react';

interface CalendarGridProps {
  year: number;
  month: number;
  holidays: HolidayItem[];
  events: UserEvent[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  styleConfig?: CalendarStyleConfig;
  showMoonPhases?: boolean;
  showHolidays?: boolean;
  showCultural?: boolean;
  showEvents?: boolean;
}

const WEEKDAYS = [
  { full: 'Sunday', short: 'SUN' },
  { full: 'Monday', short: 'MON' },
  { full: 'Tuesday', short: 'TUE' },
  { full: 'Wednesday', short: 'WED' },
  { full: 'Thursday', short: 'THU' },
  { full: 'Friday', short: 'FRI' },
  { full: 'Saturday', short: 'SAT' },
];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  holidays,
  events,
  selectedDate,
  onSelectDate,
  styleConfig,
  showMoonPhases = true,
  showHolidays = true,
  showCultural = true,
  showEvents = true,
}) => {
  // Calendar math
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  // Today string for highlighting
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Build grid cells
  const cells: Array<{
    dayNumber: number;
    monthOffset: number; // -1 = prev month, 0 = current, 1 = next
    dateStr: string;
    isCurrentMonth: boolean;
  }> = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = month === 1 ? 12 : month - 1;
    const prevY = month === 1 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      monthOffset: -1,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      monthOffset: 0,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full 7-day grid rows (35 or 42 cells)
  const remainingCells = 7 - (cells.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextM = month === 12 ? 1 : month + 1;
      const nextY = month === 12 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        monthOffset: 1,
        dateStr,
        isCurrentMonth: false,
      });
    }
  }

  // Dynamic styling props
  const fontFamily = styleConfig ? getFontFamilyCss(styleConfig.fontFamily) : getFontFamilyCss('plus-jakarta');
  const fontWeight = styleConfig ? getFontWeightCss(styleConfig.fontWeight) : 700;
  const borderRadius = styleConfig ? `${styleConfig.borderRadius}px` : '16px';
  const borderWidth = styleConfig ? `${styleConfig.borderWidth}px` : '1px';
  const borderColor = styleConfig?.borderColor || '#e2e8f0';
  const sundayColor = styleConfig?.sundayColor || '#dc2626';
  const weekdayBgColor = styleConfig?.weekdayBgColor || '#f8fafc';
  const weekdayTextColor = styleConfig?.weekdayTextColor || '#334155';
  const cellBgColor = styleConfig?.cellBgColor || '#ffffff';
  const dayNumberColor = styleConfig?.dayNumberColor || '#1e293b';
  const holidayBadgeStyle = styleConfig?.holidayBadgeStyle || 'stripe';
  const gridDensity = styleConfig?.gridDensity || 'standard';

  const cellMinHeightClass = 
    gridDensity === 'compact'
      ? 'min-h-[66px] sm:min-h-[92px] md:min-h-[105px]'
      : gridDensity === 'spacious'
      ? 'min-h-[88px] sm:min-h-[126px] md:min-h-[148px]'
      : 'min-h-[76px] sm:min-h-[112px] md:min-h-[128px]';

  return (
    <Surface 
      className={`transition-all overflow-hidden ${
        styleConfig?.showGridShadow ? 'shadow-xs' : ''
      }`}
      style={{
        backgroundColor: cellBgColor,
        borderRadius,
        borderWidth,
        borderStyle: 'solid',
        borderColor,
        fontFamily,
      }}
    >
      {/* Weekday Column Headers */}
      <div 
        className="grid grid-cols-7 border-b"
        style={{ borderColor, backgroundColor: weekdayBgColor }}
      >
        {WEEKDAYS.map((w, idx) => {
          const isSunday = idx === 0;
          return (
            <div
              key={w.short}
              className={`py-2.5 px-2 text-center border-r last:border-r-0 ${
                isSunday ? 'bg-red-50/30 dark:bg-red-950/10' : ''
              }`}
              style={{ borderColor }}
            >
              <div
                className="text-xs tracking-wider uppercase"
                style={{
                  fontWeight,
                  color: isSunday ? sundayColor : weekdayTextColor,
                }}
              >
                {w.short}
              </div>
              <div
                className="text-[10px] font-medium hidden sm:block opacity-80"
                style={{
                  color: isSunday ? sundayColor : weekdayTextColor,
                }}
              >
                {w.full}
              </div>
            </div>
          );
        })}
      </div>

      {/* Days Grid */}
      <div 
        className="grid grid-cols-7 auto-rows-fr divide-x divide-y"
        style={{ borderColor }}
      >
        {cells.map((cell, idx) => {
          const { dayNumber, dateStr, isCurrentMonth } = cell;
          const dayOfWeek = idx % 7;
          const isSunday = dayOfWeek === 0;
          const isToday = dateStr === todayStr;
          const isSelected = selectedDate === dateStr;

          // Moon calculation
          const moon = getMoonPhaseForDate(dateStr);

          // Holidays
          const dayHolidays = holidays.filter((h) => {
            if (h.date !== dateStr) return false;
            if (h.type === 'cultural' && !showCultural) return false;
            if ((h.type === 'regular' || h.type === 'special-non-working') && !showHolidays) return false;
            return true;
          });

          const hasRegularHoliday = dayHolidays.some((h) => h.type === 'regular');

          // User events
          const dayEvents = showEvents ? events.filter((e) => e.date === dateStr) : [];

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`${cellMinHeightClass} p-1 sm:p-2 transition-colors cursor-pointer flex flex-col justify-between group relative ${
                !isCurrentMonth
                  ? 'bg-zinc-50/40 dark:bg-zinc-950/30 opacity-40 hover:opacity-75'
                  : isToday
                  ? 'bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-500 ring-inset z-10'
                  : isSelected
                  ? 'bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-400 dark:ring-zinc-600 ring-inset'
                  : hasRegularHoliday || isSunday
                  ? 'bg-red-50/15 dark:bg-red-950/5 hover:opacity-95'
                  : 'hover:opacity-95'
              }`}
              style={{
                borderColor,
                backgroundColor:
                  isCurrentMonth && !isToday && !isSelected && !hasRegularHoliday && !isSunday
                    ? cellBgColor
                    : undefined,
              }}
            >
              {/* Day Header: Day Number & Moon Phase */}
              <div>
                <div className="flex items-center justify-between gap-0.5 sm:gap-1 mb-1">
                  {/* Day Number */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span
                      className="text-xs sm:text-base tabular-nums leading-none"
                      style={{
                        fontWeight,
                        color: (hasRegularHoliday || isSunday) 
                          ? sundayColor 
                          : isToday 
                          ? '#4f46e5' 
                          : dayNumberColor,
                      }}
                    >
                      {dayNumber}
                    </span>

                    {isToday && (
                      <span className="text-[9px] sm:text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
                        · Today
                      </span>
                    )}
                  </div>

                  {/* Moon Phase Component */}
                  {showMoonPhases && (
                    <div
                      className="flex items-center gap-0.5 sm:gap-1 group/moon"
                      title={`${moon.phaseName} (${moon.filipinoPhaseName}) • ${moon.illuminationPct}% illumination`}
                    >
                      {moon.isMajorPhase && moon.majorPhaseLabel && (
                        <span className="hidden md:inline-block text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                          {moon.majorPhaseLabel === 'First Quarter' ? '1st Qtr' :
                           moon.majorPhaseLabel === 'Third Quarter' ? '3rd Qtr' :
                           moon.majorPhaseLabel}
                        </span>
                      )}
                      <span className="text-[8px] sm:text-[9px] font-mono tabular-nums text-zinc-400 hidden sm:inline">
                        {moon.illuminationPct}%
                      </span>
                      <MoonIcon
                        category={moon.category}
                        illuminationPct={moon.illuminationPct}
                        elongationDeg={moon.elongationDeg}
                        size={14}
                        showGlow={moon.isMajorPhase && moon.majorPhaseLabel === 'Full Moon'}
                      />
                    </div>
                  )}
                </div>

                {/* Badges Stack: Holidays & Fiestas */}
                <div className="space-y-1">
                  {dayHolidays.map((h) => {
                    const isRegular = h.type === 'regular';
                    const isSpecial = h.type === 'special-non-working';

                    if (holidayBadgeStyle === 'minimal') {
                      return (
                        <div
                          key={h.id}
                          className="text-[9px] sm:text-[10px] font-medium flex items-center gap-1 truncate"
                          title={`${h.name} (${h.type.toUpperCase()})\n${h.description}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isRegular ? 'bg-red-600' : isSpecial ? 'bg-purple-600' : 'bg-amber-600'
                            }`}
                          />
                          <span className="truncate text-zinc-700 dark:text-zinc-300">{h.name}</span>
                        </div>
                      );
                    }

                    if (holidayBadgeStyle === 'pill') {
                      return (
                        <Chip
                          key={h.id}
                          size="sm"
                          variant="soft"
                          color={isRegular ? 'danger' : isSpecial ? 'accent' : 'warning'}
                          className="w-full max-w-full justify-start truncate text-[10px]"
                        >
                          <span className="truncate">{h.name}</span>
                        </Chip>
                      );
                    }

                    // Default 'stripe' style
                    return (
                      <div
                        key={h.id}
                        className={`text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded truncate flex items-center gap-1.5 ${
                          isRegular
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-l-2 border-red-500'
                            : isSpecial
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-l-2 border-purple-500'
                            : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-l-2 border-amber-500'
                        }`}
                        title={`${h.name} (${h.type.toUpperCase()})\n${h.description}`}
                      >
                        <span className="truncate">{h.name}</span>
                      </div>
                    );
                  })}

                  {/* User Personal Events */}
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded truncate flex items-center gap-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-l-2 border-indigo-500"
                      title={ev.title}
                    >
                      <span className="truncate">• {ev.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cell bottom hint on hover */}
              <div className="hidden group-hover:flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                <span>View details</span>
                <span className="font-bold">+</span>
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
};
