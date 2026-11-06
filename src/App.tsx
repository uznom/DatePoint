import React, { useState, useEffect } from 'react';
import { 
  AdvertConfig, 
  CalendarStyleConfig, 
  UserEvent 
} from './types';
import { DEFAULT_ADVERT, DEFAULT_EVENTS, sanitizeAdvert, sanitizeEvents } from './config/defaults';
import { getHolidaysForMonth } from './utils/phHolidays';
import { usePersistedState } from './hooks/usePersistedState';
import { DEFAULT_STYLE_CONFIG } from './utils/stylePresets';
import { CalendarCustomizer } from './components/CalendarCustomizer';
import { PrintPreviewSheet } from './components/PrintPreviewSheet';
import { ExportModal } from './components/ExportModal';
import { CalendarSetupFlow, WizardStep } from './components/CalendarSetupFlow';
import { 
  Button, 
  ButtonGroup, 
  Chip,
  ListBox, 
  Select, 
  Surface 
} from '@heroui/react';
import { 
  FileDown, 
  Sun, 
  Moon as MoonDark,
  ChevronLeft, 
  ChevronRight,
  Sliders,
  Palette,
  Printer,
  CalendarDays,
  Check
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];


type AppStage = 'landing' | 'wizard' | 'preview';

export default function App() {
  const todayActual = new Date();
  const currentActualYear = todayActual.getFullYear();
  const currentActualMonth = todayActual.getMonth() + 1;

  // Active Date & Flow Stage Selection
  const [year, setYear] = useState<number>(currentActualYear || 2026);
  const [month, setMonth] = useState<number>(currentActualMonth || 1);
  const [appStage, setAppStage] = useState<AppStage>('landing');
  const [wizardInitialStep, setWizardInitialStep] = useState<WizardStep>('recipient');

  // Modals & Drawers
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isCustomizingStyle, setIsCustomizingStyle] = useState<boolean>(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Style Customizer Config State
  const [styleConfig, setStyleConfig] = usePersistedState<CalendarStyleConfig>(
    'datepoint_style_config',
    DEFAULT_STYLE_CONFIG,
    (saved) => ({ ...DEFAULT_STYLE_CONFIG, ...saved }),
  );

  // Advert Header Config
  const [advertConfig, setAdvertConfig] = usePersistedState<AdvertConfig>(
    'kalendaryo_ph_advert',
    DEFAULT_ADVERT,
    sanitizeAdvert,
  );

  // User Events
  const [events, setEvents] = usePersistedState<UserEvent[]>(
    'kalendaryo_ph_events',
    DEFAULT_EVENTS,
    sanitizeEvents,
  );

  // (persistence handled by usePersistedState)

  const handleAddEvent = (newEvent: Omit<UserEvent, 'id'>) => {
    const id = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setEvents((prev) => [...prev, { ...newEvent, id }]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const currentMonthHolidays = getHolidaysForMonth(year, month);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const openWizardAtStep = (step: WizardStep = 'recipient') => {
    setWizardInitialStep(step);
    setAppStage('wizard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors overflow-x-hidden">
      {/* STREAMLINED FLOW HEADER BAR (No Old Multi-Tab Nav) */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border print:hidden">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setAppStage('landing')}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 cursor-pointer text-left"
          >
            <Surface variant="secondary" className="size-8 sm:size-9 rounded-2xl flex items-center justify-center text-accent shrink-0">
              <CalendarDays className="size-4" />
            </Surface>
            <span className="text-base sm:text-lg font-black tracking-tight text-foreground whitespace-nowrap shrink-0 font-['Space_Grotesk']">
              DatePoint
            </span>
          </button>

          {/* Center: Clean 3-Stage Flow Breadcrumb / Status (Hidden on small phones, visible on md+) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAppStage('landing')}
              className="cursor-pointer"
            >
              <Chip
                size="sm"
                variant="soft"
                color={appStage === 'landing' ? 'accent' : 'default'}
              >
                1. Start
              </Chip>
            </button>
            <ChevronRight className="size-3.5 text-muted" />
            <button
              type="button"
              onClick={() => openWizardAtStep('recipient')}
              className="cursor-pointer"
            >
              <Chip
                size="sm"
                variant="soft"
                color={appStage === 'wizard' ? 'accent' : 'default'}
              >
                2. Customize Calendar
              </Chip>
            </button>
            <ChevronRight className="size-3.5 text-muted" />
            <button
              type="button"
              onClick={() => setAppStage('preview')}
              className="cursor-pointer"
            >
              <Chip
                size="sm"
                variant="soft"
                color={appStage === 'preview' ? 'accent' : 'default'}
              >
                {appStage === 'preview' && <Check className="size-3 shrink-0" />}
                <span>3. 1=1 Preview & Export</span>
              </Chip>
            </button>
          </div>

          {/* Right: Stage-Specific Primary Actions + Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {appStage === 'landing' && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => setAppStage('preview')}
                >
                  <Printer className="size-4 shrink-0" />
                  <span className="hidden sm:inline">1=1 Preview</span>
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => openWizardAtStep('recipient')}
                >
                  <Sliders className="size-4 shrink-0" />
                  <span className="hidden sm:inline">Customize My Calendar</span>
                  <span className="sm:hidden">Customize</span>
                </Button>
              </>
            )}

            {appStage === 'wizard' && (
              <Button
                size="sm"
                variant="primary"
                onPress={() => setAppStage('preview')}
              >
                <Printer className="size-4 shrink-0" />
                <span className="hidden sm:inline">Show 1=1 Preview</span>
                <span className="sm:hidden">Preview</span>
              </Button>
            )}

            {appStage === 'preview' && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => openWizardAtStep('recipient')}
                  aria-label="Edit setup steps"
                >
                  <Sliders className="size-4 shrink-0" />
                  <span className="hidden sm:inline">Edit Setup</span>
                </Button>

                <Button
                  size="sm"
                  variant={isCustomizingStyle ? 'primary' : 'secondary'}
                  onPress={() => setIsCustomizingStyle(!isCustomizingStyle)}
                  aria-label="Open style customizer drawer"
                >
                  <Palette className="size-4 shrink-0" />
                  <span className="hidden sm:inline">Styles</span>
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => setShowExportModal(true)}
                  aria-label="Export printable PDF calendar"
                >
                  <FileDown className="size-4 shrink-0" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </>
            )}

            <Button
              size="sm"
              isIconOnly
              variant="tertiary"
              onPress={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="size-4" /> : <MoonDark className="size-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container - Responsive padding & max-width up to 1600px for large screens */}
      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 flex-1 w-full">
        {/* STAGE 1 & 2: HEROUI LANDING PAGE OR 4-STEP CUSTOMIZATION FLOW */}
        {appStage !== 'preview' ? (
          <>
            <div className="print:hidden">
              <CalendarSetupFlow
                mode={appStage}
                initialStep={wizardInitialStep}
                year={year}
                month={month}
                onYearChange={setYear}
                onMonthChange={setMonth}
                styleConfig={styleConfig}
                onStyleChange={setStyleConfig}
                advertConfig={advertConfig}
                onAdvertChange={setAdvertConfig}
                holidays={currentMonthHolidays}
                events={events}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onStartWizard={(step) => openWizardAtStep(step || 'recipient')}
                onFinishToPreview={() => setAppStage('preview')}
                onBackToLanding={() => setAppStage('landing')}
              />
            </div>

            {/* Hidden print sheet so Ctrl+P always prints the 1=1 sheet even from Landing/Wizard */}
            <PrintPreviewSheet
              year={year}
              month={month}
              advertConfig={advertConfig}
              styleConfig={styleConfig}
              holidays={currentMonthHolidays}
              events={events}
              onOpenCustomizer={() => setIsCustomizingStyle(true)}
              onStyleChange={setStyleConfig}
              printOnly={true}
            />
          </>
        ) : (
          /* STAGE 3: 1=1 PREVIEW, EXPORT OR EDIT */
          <div className="space-y-3 sm:space-y-4">
            {/* Responsive Month / Year Selector Bar for 1=1 Preview */}
            <Surface
              variant="default"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-border print:hidden"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <ButtonGroup size="sm" variant="secondary" className="shrink-0">
                  <Button isIconOnly onPress={prevMonth} aria-label="Previous month">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button isIconOnly onPress={nextMonth} aria-label="Next month">
                    <ButtonGroup.Separator />
                    <ChevronRight className="size-4" />
                  </Button>
                </ButtonGroup>

                <div className="min-w-0">
                  <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">
                    1=1 Calendar Preview — {MONTH_NAMES[month - 1]} {year}
                  </h2>
                  <p className="text-xs text-muted hidden sm:block">
                    Click any step pill below to edit your setup, or export/print your finished 1=1 sheet.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Select
                  aria-label="Preview Year"
                  selectedKey={String(year)}
                  onSelectionChange={(k) => {
                    if (k) setYear(Number(k));
                  }}
                  className="w-full sm:w-28"
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <ListBox.Item key={y} id={String(y)} textValue={`Year ${y}`}>
                          Year {y}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  aria-label="Preview Month"
                  selectedKey={String(month)}
                  onSelectionChange={(k) => {
                    if (k) setMonth(Number(k));
                  }}
                  className="w-full sm:w-36"
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {MONTH_NAMES.map((m, idx) => (
                        <ListBox.Item key={idx + 1} id={String(idx + 1)} textValue={m}>
                          {m}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </Surface>

            <PrintPreviewSheet
              year={year}
              month={month}
              advertConfig={advertConfig}
              styleConfig={styleConfig}
              holidays={currentMonthHolidays}
              events={events}
              onOpenCustomizer={() => setIsCustomizingStyle(true)}
              onEditWizardSteps={(step) => openWizardAtStep(step || 'recipient')}
              onOpenExportModal={() => setShowExportModal(true)}
              onStyleChange={setStyleConfig}
            />
          </div>
        )}
      </main>

      {/* STYLE CUSTOMIZER DRAWER */}
      {isCustomizingStyle && (
        <CalendarCustomizer
          styleConfig={styleConfig}
          onChange={setStyleConfig}
          onClose={() => setIsCustomizingStyle(false)}
        />
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <ExportModal
          year={year}
          month={month}
          advertConfig={advertConfig}
          events={events}
          styleConfig={styleConfig}
          onStyleChange={setStyleConfig}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
