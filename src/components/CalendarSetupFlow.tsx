import React, { useEffect, useRef, useState } from 'react';
import {
  AdvertConfig,
  CalendarStyleConfig,
  FontFamilyOption,
  FontWeightOption,
  HeaderImagePlacement,
  HolidayItem,
  TitleAlignment,
  UserEvent,
} from '../types';
import { EventForm } from './wizard/EventForm';
import { PRESET_SPONSORS } from './AdvertHeader';
import { EMBLEM_PRESETS } from '../utils/stylePresets';
import {
  getPaperDimensions,
  loadHeaderImage,
  renderCalendarSheetToCanvas,
} from '../utils/pdfExport';
import {
  Button,
  Card,
  Chip,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
  Slider,
  Surface,
  Switch,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  parseColor,
} from '@heroui/react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CircleDot,
  Compass,
  Eye,
  EyeOff,
  FileText,
  Home,
  Landmark,
  Moon,
  Palette,
  Printer,
  RectangleHorizontal,
  RectangleVertical,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns2,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Hash,
  NotebookPen,
} from 'lucide-react';

export type WizardStep = 'recipient' | 'colors' | 'content' | 'paper';

interface CalendarSetupFlowProps {
  mode: 'landing' | 'wizard';
  initialStep?: WizardStep;
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  styleConfig: CalendarStyleConfig;
  onStyleChange: (newConfig: CalendarStyleConfig) => void;
  advertConfig: AdvertConfig;
  onAdvertChange: (newAdvert: AdvertConfig) => void;
  holidays: HolidayItem[];
  events: UserEvent[];
  onAddEvent?: (event: Omit<UserEvent, 'id'>) => void;
  onDeleteEvent?: (id: string) => void;
  onStartWizard: (step?: WizardStep) => void;
  onFinishToPreview: () => void;
  onBackToLanding: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WIZARD_STEPS: Array<{
  id: WizardStep;
  number: number;
  label: string;
  shortLabel: string;
}> = [
  { id: 'recipient', number: 1, label: '1. Who Is It For?', shortLabel: '1. Purpose' },
  { id: 'colors', number: 2, label: '2. Colors & Style', shortLabel: '2. Style' },
  { id: 'content', number: 3, label: '3. Moon & Holidays', shortLabel: '3. Content' },
  { id: 'paper', number: 4, label: '4. Paper & Punch-Holes', shortLabel: '4. Paper' },
];

const FONT_OPTIONS: Array<{ id: FontFamilyOption; name: string }> = [
  { id: 'mi-sans', name: 'Mi Sans' },
  { id: 'mi-lanting', name: 'Mi Lanting' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans' },
  { id: 'space-grotesk', name: 'Space Grotesk' },
  { id: 'cinzel', name: 'Cinzel Serif' },
  { id: 'playfair', name: 'Playfair Display' },
  { id: 'inter', name: 'Inter Clean' },
  { id: 'roboto-mono', name: 'Roboto Mono' },
];

const DEFAULT_SWATCHES = [
  '#09090b',
  '#1e293b',
  '#334155',
  '#94a3b8',
  '#cbd5e1',
  '#e2e8f0',
  '#f8fafc',
  '#ffffff',
  '#991b1b',
  '#dc2626',
  '#ea580c',
  '#78350f',
  '#fde047',
  '#065f46',
  '#0369a1',
  '#0284c7',
  '#4f46e5',
  '#7c3aed',
];

function safeParseColor(value: string | undefined, fallback = '#000000') {
  try {
    return parseColor(value || fallback);
  } catch {
    return parseColor(fallback);
  }
}

interface WizardColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const WizardColorPicker: React.FC<WizardColorPickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const parsed = safeParseColor(value);
  const hexDisplay = parsed.toString('hex');

  return (
    <Surface variant="secondary" className="rounded-2xl px-3 py-2 flex items-center justify-between gap-2 min-w-0">
      <div className="min-w-0 flex-1">
        <ColorPicker
          value={parsed}
          onChange={(color) => onChange(color.toString('hex'))}
        >
          <ColorPicker.Trigger aria-label={label} className="max-w-full">
            <ColorSwatch size="sm" shape="circle" className="shrink-0" />
            <Label className="truncate text-xs sm:text-sm cursor-pointer">{label}</Label>
          </ColorPicker.Trigger>
          <ColorPicker.Popover placement="bottom start" className="max-w-62">
            <ColorArea
              aria-label={`${label} saturation and brightness`}
              colorSpace="hsb"
              xChannel="saturation"
              yChannel="brightness"
              className="max-w-full"
            >
              <ColorArea.Thumb />
            </ColorArea>
            <ColorSlider
              aria-label={`${label} hue`}
              channel="hue"
              colorSpace="hsb"
            >
              <Label>Hue</Label>
              <ColorSlider.Output />
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider>
            <ColorField aria-label={`${label} hex value`} fullWidth>
              <Label>Hex Color</Label>
              <Input variant="secondary" />
            </ColorField>
            <ColorSwatchPicker
              aria-label={`${label} presets`}
              size="xs"
              className="justify-center flex-wrap"
            >
              {DEFAULT_SWATCHES.map((hex) => (
                <ColorSwatchPicker.Item key={hex} color={hex}>
                  <ColorSwatchPicker.Swatch />
                  <ColorSwatchPicker.Indicator />
                </ColorSwatchPicker.Item>
              ))}
            </ColorSwatchPicker>
          </ColorPicker.Popover>
        </ColorPicker>
      </div>
      <span className="font-mono text-xs text-muted uppercase shrink-0">{hexDisplay}</span>
    </Surface>
  );
};

export const CalendarSetupFlow: React.FC<CalendarSetupFlowProps> = ({
  mode,
  initialStep = 'recipient',
  year,
  month,
  onYearChange,
  onMonthChange,
  styleConfig,
  onStyleChange,
  advertConfig,
  onAdvertChange,
  holidays,
  events,
  onAddEvent,
  onDeleteEvent,
  onStartWizard,
  onFinishToPreview,
  onBackToLanding,
}) => {
  const [step, setStep] = useState<WizardStep>(initialStep);
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventDate, setNewEventDate] = useState<string>('');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mobilePreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loadedHeaderImg, setLoadedHeaderImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const updateStyle = (patch: Partial<CalendarStyleConfig>) => {
    onStyleChange({ ...styleConfig, ...patch });
  };

  const updateImage = (patch: Partial<CalendarStyleConfig['headerImage']>) => {
    onStyleChange({
      ...styleConfig,
      headerImage: {
        ...styleConfig.headerImage,
        ...patch,
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateImage({
          enabled: true,
          url: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const dims = getPaperDimensions(
    styleConfig.paperSize || 'a4',
    styleConfig.printOrientation || 'landscape'
  );

  // Load header emblem for live preview canvas
  useEffect(() => {
    let active = true;
    const url = styleConfig.headerImage?.enabled ? styleConfig.headerImage?.url : undefined;
    if (!url) {
      setLoadedHeaderImg(null);
      return;
    }
    loadHeaderImage(url).then((img) => {
      if (active) setLoadedHeaderImg(img);
    });
    return () => {
      active = false;
    };
  }, [styleConfig.headerImage?.enabled, styleConfig.headerImage?.url]);

  // Render live 1=1 preview sheet in both landing, desktop wizard, and mobile toggle preview
  useEffect(() => {
    const renderOptions = {
      year,
      month,
      advertConfig,
      styleConfig,
      holidays,
      events,
      headerImg: loadedHeaderImg,
      scale: 2,
    };

    if (previewCanvasRef.current) {
      renderCalendarSheetToCanvas(previewCanvasRef.current, renderOptions);
    }
    if (mobilePreviewCanvasRef.current && showMobilePreview) {
      renderCalendarSheetToCanvas(mobilePreviewCanvasRef.current, renderOptions);
    }
  }, [
    mode,
    step,
    showMobilePreview,
    year,
    month,
    advertConfig,
    styleConfig,
    holidays,
    events,
    loadedHeaderImg,
  ]);

  const handleSelectRecipient = (type: 'business' | 'personal' | 'civic' | 'maritime') => {
    updateStyle({ recipientType: type });
    // Only toggle the banner / apply the visual theme. Never pre-fill the text
    // inputs with sample data - users should only see placeholders.
    const presetIndex = { business: 0, civic: 1, maritime: 2 } as const;
    if (type === 'personal') {
      onAdvertChange({ ...advertConfig, enabled: false });
    } else {
      const presetTheme = PRESET_SPONSORS[presetIndex[type]]?.config.theme;
      onAdvertChange({
        ...advertConfig,
        enabled: true,
        ...(presetTheme ? { theme: presetTheme } : {}),
      });
    }
  };

  if (mode === 'landing') {
    return (
      <div className="space-y-6 sm:space-y-10 py-2 sm:py-6">
        {/* HeroUI v3 Landing Hero Section - Responsive across Mobile, Tablet, Laptop & Ultra-Wide */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          <div className="lg:col-span-6 xl:col-span-5 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <Chip size="sm" variant="soft" color="accent">
                DatePoint Calendar Studio
              </Chip>
              <Chip size="sm" variant="soft" color="default">
                1=1 Print & PDF Precision
              </Chip>
            </div>

            <h1 className="text-2xl sm:text-4xl xl:text-5xl font-black tracking-tight text-foreground leading-[1.1] font-['Space_Grotesk']">
              Build & Print Your Custom 1=1 Calendar in 4 Simple Steps.
            </h1>

            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Start by choosing who your calendar is for, pick your custom colors and typography, decide whether to include moon phases, tides, and holidays, and select your paper size and wall punch-holes before exporting.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
              <Button
                size="lg"
                variant="primary"
                onPress={() => onStartWizard('recipient')}
                className="w-full sm:w-auto justify-center"
              >
                <Sliders className="size-4 shrink-0" />
                <span>Customize My Calendar</span>
                <ArrowRight className="size-4 shrink-0" />
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onPress={onFinishToPreview}
                className="w-full sm:w-auto justify-center"
              >
                <Printer className="size-4 shrink-0" />
                <span>Open 1=1 Preview Directly</span>
              </Button>
            </div>

            {/* Interactive 4-Step Flow Overview Cards - Click any step to jump straight in */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4 gap-2.5">
              {WIZARD_STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onStartWizard(s.id)}
                  className="text-left group cursor-pointer"
                >
                  <Surface
                    variant="secondary"
                    className="rounded-2xl p-3 h-full border border-transparent group-hover:border-accent/40 transition-all"
                  >
                    <div className="text-[11px] font-semibold text-accent flex items-center justify-between">
                      <span>Step {s.number}</span>
                      <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs font-semibold text-foreground mt-0.5">
                      {s.label.replace(/^\d+\.\s*/, '')}
                    </div>
                  </Surface>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Live 1=1 Sheet Preview Card */}
          <div className="lg:col-span-6 xl:col-span-7">
            <Card variant="secondary">
              <Card.Header className="flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                  <Card.Title className="text-sm sm:text-base">
                    Live 1=1 Sheet Preview ({MONTH_NAMES[month - 1]} {year})
                  </Card.Title>
                  <Card.Description className="text-xs">
                    Exact WYSIWYG output for screen, browser print, and 300-DPI PDF export.
                  </Card.Description>
                </div>
                <Chip size="sm" variant="soft" color="accent" className="uppercase font-mono">
                  {styleConfig.paperSize} • {styleConfig.printOrientation}
                </Chip>
              </Card.Header>
              <Card.Content className="items-center">
                <div
                  className="bg-white shadow-surface overflow-hidden border border-border w-full mx-auto"
                  style={{
                    maxWidth: styleConfig.printOrientation === 'landscape' ? '100%' : '420px',
                    aspectRatio: `${dims.widthMm} / ${dims.heightMm}`,
                  }}
                >
                  <canvas
                    ref={previewCanvasRef}
                    data-testid="landing-preview-canvas"
                    className="w-full h-full block"
                  />
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Feature Cards using 1:1 HeroUI v3 Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default">
            <Card.Header>
              <Surface variant="secondary" className="size-9 rounded-2xl flex items-center justify-center text-accent mb-1">
                <Building2 className="size-4" />
              </Surface>
              <Card.Title>1. Who Is It For?</Card.Title>
              <Card.Description>
                Configure for a commercial sponsor, household wall calendar, civic organization, or maritime schedule.
              </Card.Description>
            </Card.Header>
          </Card>

          <Card variant="default">
            <Card.Header>
              <Surface variant="secondary" className="size-9 rounded-2xl flex items-center justify-center text-accent mb-1">
                <Palette className="size-4" />
              </Surface>
              <Card.Title>2. Select Colors</Card.Title>
              <Card.Description>
                Customize every header, border, title, weekday, and cell color with full HSB & Hex ColorPickers.
              </Card.Description>
            </Card.Header>
          </Card>

          <Card variant="default">
            <Card.Header>
              <Surface variant="secondary" className="size-9 rounded-2xl flex items-center justify-center text-accent mb-1">
                <Moon className="size-4" />
              </Surface>
              <Card.Title>3. Moon, Tides & Holidays</Card.Title>
              <Card.Description>
                Choose whether to include astronomical lunar phases, tidal guidance, and official holidays.
              </Card.Description>
            </Card.Header>
          </Card>

          <Card variant="default">
            <Card.Header>
              <Surface variant="secondary" className="size-9 rounded-2xl flex items-center justify-center text-accent mb-1">
                <FileText className="size-4" />
              </Surface>
              <Card.Title>4. Paper & Punch-Holes</Card.Title>
              <Card.Description>
                Select A4 or US Letter paper, Portrait or Landscape layout, and optional wall hanging punch-holes.
              </Card.Description>
            </Card.Header>
          </Card>
        </div>
      </div>
    );
  }

  // WIZARD MODE
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === step);
  const goPrevStep = () => {
    if (currentStepIndex > 0) {
      setStep(WIZARD_STEPS[currentStepIndex - 1].id);
    } else {
      onBackToLanding();
    }
  };
  const goNextStep = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setStep(WIZARD_STEPS[currentStepIndex + 1].id);
    } else {
      onFinishToPreview();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Wizard Stepper Bar using 1:1 HeroUI v3 Tabs - Responsive for Mobile, Tablet & Desktop */}
      <Card variant="default">
        <Card.Content className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Button
                size="sm"
                variant="secondary"
                onPress={onBackToLanding}
                className="shrink-0"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Landing</span>
              </Button>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                  Customize My Calendar
                </h2>
                <p className="text-[11px] sm:text-xs text-muted truncate">
                  Step {currentStepIndex + 1} of {WIZARD_STEPS.length} • {WIZARD_STEPS[currentStepIndex].label.replace(/^\d+\.\s*/, '')}
                </p>
              </div>
            </div>

            {/* Mobile/Tablet Quick Toggle for Live Preview (< lg screens) */}
            <div className="lg:hidden shrink-0">
              <Button
                size="sm"
                variant={showMobilePreview ? 'primary' : 'secondary'}
                onPress={() => setShowMobilePreview(!showMobilePreview)}
              >
                {showMobilePreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                <span className="text-xs">{showMobilePreview ? 'Hide Preview' : 'Live Preview'}</span>
              </Button>
            </div>
          </div>

          <div className="w-full xl:w-auto overflow-x-auto">
            <Tabs
              selectedKey={step}
              onSelectionChange={(k) => setStep(k as WizardStep)}
              className="w-full"
            >
              <Tabs.ListContainer className="w-full">
                <Tabs.List aria-label="Calendar Setup Steps" className="w-full">
                  {WIZARD_STEPS.map((s, idx) => (
                    <Tabs.Tab
                      key={s.id}
                      id={s.id}
                      className="flex-1 xl:flex-initial justify-center text-xs sm:text-sm px-2 sm:px-3.5 whitespace-nowrap"
                    >
                      {idx > 0 && <Tabs.Separator />}
                      <span className="hidden sm:inline">{s.label}</span>
                      <span className="sm:hidden">{s.shortLabel}</span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        </Card.Content>
      </Card>

      {/* Collapsible Mobile/Tablet Live 1=1 Preview Drawer Card (< lg screens) */}
      {showMobilePreview && (
        <div className="lg:hidden">
          <Card variant="secondary">
            <Card.Header className="flex-row items-center justify-between gap-2 py-2.5">
              <Card.Title className="text-xs sm:text-sm">
                Live 1=1 Preview ({MONTH_NAMES[month - 1]} {year})
              </Card.Title>
              <Chip size="sm" variant="soft" color="accent" className="uppercase font-mono">
                {styleConfig.paperSize} • {styleConfig.printOrientation}
              </Chip>
            </Card.Header>
            <Card.Content className="items-center pt-0">
              <div
                className="bg-white shadow-surface overflow-hidden border border-border w-full mx-auto"
                style={{
                  maxWidth: styleConfig.printOrientation === 'landscape' ? '100%' : '300px',
                  aspectRatio: `${dims.widthMm} / ${dims.heightMm}`,
                }}
              >
                <canvas
                  ref={mobilePreviewCanvasRef}
                  data-testid="mobile-wizard-preview-canvas"
                  className="w-full h-full block"
                />
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Main 2-Column Wizard Layout: Left Step Controls + Right Sticky Live 1=1 Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left Column: Active Step Form */}
        <div className="lg:col-span-6 xl:col-span-5">
          <Card variant="default">
            {/* STEP 1: WHO IS THIS CALENDAR FOR? */}
            {step === 'recipient' && (
              <>
                <Card.Header>
                  <Card.Title>Step 1: Who is this calendar for?</Card.Title>
                  <Card.Description>
                    Select your target month/year, choose who this calendar is for, and configure your top header banner.
                  </Card.Description>
                </Card.Header>

                <Separator />

                <Card.Content className="space-y-4">
                  {/* Target Month & Year Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      fullWidth
                      selectedKey={String(month)}
                      onSelectionChange={(k) => {
                        if (k) onMonthChange(Number(k));
                      }}
                    >
                      <Label>Starting Month</Label>
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

                    <Select
                      fullWidth
                      selectedKey={String(year)}
                      onSelectionChange={(k) => {
                        if (k) onYearChange(Number(k));
                      }}
                    >
                      <Label>Calendar Year</Label>
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
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Select Calendar Purpose / Recipient</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        {
                          id: 'business' as const,
                          title: 'Business & Commercial',
                          desc: 'Branded company giveaway with hotline & address',
                          icon: Building2,
                        },
                        {
                          id: 'personal' as const,
                          title: 'Personal & Household',
                          desc: 'Clean family or home desk/wall calendar',
                          icon: Home,
                        },
                        {
                          id: 'civic' as const,
                          title: 'Civic & Community',
                          desc: 'Public service, barangay, or school schedule',
                          icon: Landmark,
                        },
                        {
                          id: 'maritime' as const,
                          title: 'Maritime & Agriculture',
                          desc: 'Coastal fishing, port, or farming almanac',
                          icon: Compass,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = (styleConfig.recipientType || 'business') === item.id;
                        return (
                          <Button
                            key={item.id}
                            variant={isSelected ? 'primary' : 'secondary'}
                            onPress={() => handleSelectRecipient(item.id)}
                            className="h-auto py-3 px-3.5 justify-start text-left flex-col items-start gap-1"
                          >
                            <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
                              <Icon className="size-4 shrink-0" />
                              <span>{item.title}</span>
                            </div>
                            <span className="text-[11px] sm:text-xs opacity-80 font-normal whitespace-normal leading-snug">
                              {item.desc}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Surface variant="secondary" className="rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-foreground">
                        Include Top Header Banner
                      </div>
                      <div className="text-[11px] sm:text-xs text-muted">
                        Display a custom organization, family, or sponsor header at the top of the sheet.
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={advertConfig.enabled}
                      onChange={(checked) =>
                        onAdvertChange({ ...advertConfig, enabled: checked })
                      }
                      aria-label="Toggle top header banner"
                      className="shrink-0"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <Label className="text-xs">{advertConfig.enabled ? 'On' : 'Off'}</Label>
                      </Switch.Content>
                    </Switch>
                  </Surface>

                  {advertConfig.enabled && (
                    <div className="space-y-3 pt-1">
                      <TextField
                        fullWidth
                        value={advertConfig.businessName}
                        onChange={(v) => onAdvertChange({ ...advertConfig, businessName: v })}
                      >
                        <Label>Header Title / Business or Family Name</Label>
                        <Input placeholder="e.g. Mabuhay Trading / The Santos Family" />
                      </TextField>

                      <TextField
                        fullWidth
                        value={advertConfig.tagline}
                        onChange={(v) => onAdvertChange({ ...advertConfig, tagline: v })}
                      >
                        <Label>Subtitle / Tagline / Greeting</Label>
                        <Input placeholder="e.g. Trusted by Communities Nationwide" />
                      </TextField>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TextField
                          fullWidth
                          value={advertConfig.hotline}
                          onChange={(v) => onAdvertChange({ ...advertConfig, hotline: v })}
                        >
                          <Label>Phone / Contact Line</Label>
                          <Input placeholder="e.g. +63 917 555 1234" />
                        </TextField>

                        <TextField
                          fullWidth
                          value={advertConfig.website}
                          onChange={(v) => onAdvertChange({ ...advertConfig, website: v })}
                        >
                          <Label>Website / Social Handle</Label>
                          <Input placeholder="e.g. www.example.com" />
                        </TextField>
                      </div>

                      <TextField
                        fullWidth
                        value={advertConfig.address}
                        onChange={(v) => onAdvertChange({ ...advertConfig, address: v })}
                      >
                        <Label>Location / Address</Label>
                        <Input placeholder="e.g. Manila, Philippines" />
                      </TextField>

                      <Separator />

                      {/* HEADER IMAGE / LOGO / BANNER UPLOAD */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <ImageIcon className="size-4 text-accent shrink-0" />
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-foreground">
                                Header Logo / Emblem / Banner Image
                              </div>
                              <div className="text-[11px] sm:text-xs text-muted">
                                Upload your own image (PNG, JPG, SVG, WebP) or choose a preset emblem.
                              </div>
                            </div>
                          </div>

                          <Switch
                            size="sm"
                            isSelected={styleConfig.headerImage.enabled}
                            onChange={(checked) => updateImage({ enabled: checked })}
                            aria-label="Enable Header Image"
                            className="shrink-0"
                          >
                            <Switch.Content>
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                              <Label className="text-xs">
                                {styleConfig.headerImage.enabled ? 'On' : 'Off'}
                              </Label>
                            </Switch.Content>
                          </Switch>
                        </div>

                        {styleConfig.headerImage.enabled && (
                          <Surface variant="secondary" className="rounded-2xl p-3.5 space-y-3.5">
                            <div className="flex items-center gap-3">
                              <Surface
                                variant="default"
                                className="size-14 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-field border border-border"
                              >
                                {styleConfig.headerImage.url ? (
                                  <img
                                    src={styleConfig.headerImage.url}
                                    alt="Header Logo Preview"
                                    className="size-full object-contain"
                                  />
                                ) : (
                                  <ImageIcon className="size-6 text-muted" />
                                )}
                              </Surface>

                              <div className="flex-1 space-y-1 min-w-0">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onPress={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="size-4 shrink-0" />
                                  <span>Upload Custom Image / Logo</span>
                                </Button>
                                <p className="text-[11px] text-muted">
                                  Supports transparent PNG, SVG, JPG, or WebP.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label>Or Select an Emblem Preset</Label>
                              <div className="grid grid-cols-5 gap-1.5">
                                {EMBLEM_PRESETS.map((emb) => (
                                  <Button
                                    key={emb.id}
                                    size="sm"
                                    isIconOnly
                                    variant="secondary"
                                    onPress={() => updateImage({ url: emb.dataUrl, enabled: true })}
                                    aria-label={emb.name}
                                    className="w-full"
                                  >
                                    <img
                                      src={emb.dataUrl}
                                      alt={emb.name}
                                      className="size-5 object-contain"
                                    />
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label>Where Should the Image Appear?</Label>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: 'left', label: 'Left of Title' },
                                  { id: 'right', label: 'Right Side' },
                                  { id: 'center-watermark', label: 'Center Watermark' },
                                  { id: 'banner-bg', label: 'Full Header Banner BG' },
                                ].map((pl) => (
                                  <Button
                                    key={pl.id}
                                    size="sm"
                                    variant={
                                      styleConfig.headerImage.placement === pl.id
                                        ? 'primary'
                                        : 'secondary'
                                    }
                                    onPress={() =>
                                      updateImage({ placement: pl.id as HeaderImagePlacement })
                                    }
                                    className="w-full text-xs"
                                  >
                                    {pl.label}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <Label>Logo Frame Shape</Label>
                                <ToggleButtonGroup
                                  aria-label="Logo Frame Shape"
                                  selectionMode="single"
                                  disallowEmptySelection
                                  fullWidth
                                  size="sm"
                                  selectedKeys={new Set([styleConfig.headerImage.shape])}
                                  onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as
                                      | 'circle'
                                      | 'rounded'
                                      | 'square'
                                      | undefined;
                                    if (selected) updateImage({ shape: selected });
                                  }}
                                >
                                  {(['circle', 'rounded', 'square'] as const).map((sh, idx) => (
                                    <ToggleButton
                                      key={sh}
                                      id={sh}
                                      className="capitalize text-xs px-1.5"
                                    >
                                      {idx > 0 && <ToggleButtonGroup.Separator />}
                                      {sh}
                                    </ToggleButton>
                                  ))}
                                </ToggleButtonGroup>
                              </div>

                              <div className="space-y-1">
                                <Label>Logo Size</Label>
                                <ToggleButtonGroup
                                  aria-label="Logo Size"
                                  selectionMode="single"
                                  disallowEmptySelection
                                  fullWidth
                                  size="sm"
                                  selectedKeys={new Set([styleConfig.headerImage.size])}
                                  onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as
                                      | 'small'
                                      | 'medium'
                                      | 'large'
                                      | undefined;
                                    if (selected) updateImage({ size: selected });
                                  }}
                                >
                                  {(['small', 'medium', 'large'] as const).map((sz, idx) => (
                                    <ToggleButton
                                      key={sz}
                                      id={sz}
                                      className="capitalize text-xs px-1.5"
                                    >
                                      {idx > 0 && <ToggleButtonGroup.Separator />}
                                      {sz}
                                    </ToggleButton>
                                  ))}
                                </ToggleButtonGroup>
                              </div>
                            </div>

                            <Slider
                              value={styleConfig.headerImage.opacity ?? 100}
                              onChange={(v) =>
                                updateImage({ opacity: typeof v === 'number' ? v : v[0] })
                              }
                              minValue={10}
                              maxValue={100}
                              step={5}
                            >
                              <Label>Image Opacity</Label>
                              <Slider.Output>{({ state }) => `${state.values[0]}%`}</Slider.Output>
                              <Slider.Track>
                                <Slider.Fill />
                                <Slider.Thumb />
                              </Slider.Track>
                            </Slider>
                          </Surface>
                        )}
                      </div>
                    </div>
                  )}
                </Card.Content>
              </>
            )}

            {/* STEP 2: SELECT COLORS, TYPOGRAPHY & BORDERS */}
            {step === 'colors' && (
              <>
                <Card.Header>
                  <Card.Title>Step 2: Colors, Font Weight & Border Geometry</Card.Title>
                  <Card.Description>
                    Customize your font family, date font weight, border weight, corner radius, and every calendar color.
                  </Card.Description>
                </Card.Header>

                <Separator />

                <Card.Content className="space-y-4">
                  {/* Font Family & Title Alignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      fullWidth
                      selectedKey={styleConfig.fontFamily}
                      onSelectionChange={(k) => {
                        if (k) updateStyle({ fontFamily: k as FontFamilyOption });
                      }}
                    >
                      <Label>Font Family</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {FONT_OPTIONS.map((f) => (
                            <ListBox.Item key={f.id} id={f.id} textValue={f.name}>
                              {f.name}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    <div className="space-y-1">
                      <Label>Title Alignment</Label>
                      <ToggleButtonGroup
                        aria-label="Title Alignment"
                        selectionMode="single"
                        disallowEmptySelection
                        fullWidth
                        size="sm"
                        selectedKeys={new Set([styleConfig.monthYearAlignment])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as TitleAlignment | undefined;
                          if (selected) updateStyle({ monthYearAlignment: selected });
                        }}
                      >
                        {[
                          { id: 'left', label: 'Left', icon: AlignLeft },
                          { id: 'center', label: 'Center', icon: AlignCenter },
                          { id: 'right', label: 'Right', icon: AlignRight },
                          { id: 'split', label: 'Split', icon: Columns2 },
                        ].map((al, idx) => {
                          const Icon = al.icon;
                          return (
                            <ToggleButton key={al.id} id={al.id} className="text-xs px-1.5">
                              {idx > 0 && <ToggleButtonGroup.Separator />}
                              <Icon className="size-3.5 shrink-0" />
                              <span className="hidden xs:inline">{al.label}</span>
                            </ToggleButton>
                          );
                        })}
                      </ToggleButtonGroup>
                    </div>
                  </div>

                  {/* Date Font Weight, Header Font Weight & Date Number Size */}
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <Label>Date Number Font Weight</Label>
                      <ToggleButtonGroup
                        aria-label="Date Number Font Weight"
                        selectionMode="single"
                        disallowEmptySelection
                        fullWidth
                        size="sm"
                        selectedKeys={new Set([styleConfig.dateFontWeight || styleConfig.fontWeight])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as FontWeightOption | undefined;
                          if (selected) updateStyle({ dateFontWeight: selected });
                        }}
                      >
                        {(['normal', 'medium', 'semibold', 'bold', 'black'] as FontWeightOption[]).map(
                          (w, idx) => (
                            <ToggleButton key={w} id={w} className="capitalize text-xs px-1.5">
                              {idx > 0 && <ToggleButtonGroup.Separator />}
                              {w}
                            </ToggleButton>
                          )
                        )}
                      </ToggleButtonGroup>
                    </div>

                    <div className="space-y-1">
                      <Label>Header & Month Title Font Weight</Label>
                      <ToggleButtonGroup
                        aria-label="Header and Month Title Font Weight"
                        selectionMode="single"
                        disallowEmptySelection
                        fullWidth
                        size="sm"
                        selectedKeys={new Set([styleConfig.fontWeight])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as FontWeightOption | undefined;
                          if (selected) updateStyle({ fontWeight: selected });
                        }}
                      >
                        {(['normal', 'medium', 'semibold', 'bold', 'black'] as FontWeightOption[]).map(
                          (w, idx) => (
                            <ToggleButton key={w} id={w} className="capitalize text-xs px-1.5">
                              {idx > 0 && <ToggleButtonGroup.Separator />}
                              {w}
                            </ToggleButton>
                          )
                        )}
                      </ToggleButtonGroup>
                    </div>

                    <div className="space-y-1">
                      <Label>Date Number Scale (Wall Distance Readability)</Label>
                      <ToggleButtonGroup
                        aria-label="Date Number Scale"
                        selectionMode="single"
                        disallowEmptySelection
                        fullWidth
                        size="sm"
                        selectedKeys={new Set([styleConfig.dateNumberSize || 'md'])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as 'sm' | 'md' | 'lg' | 'xl' | undefined;
                          if (selected) updateStyle({ dateNumberSize: selected });
                        }}
                      >
                        {[
                          { id: 'sm', label: 'Small' },
                          { id: 'md', label: 'Medium' },
                          { id: 'lg', label: 'Large' },
                          { id: 'xl', label: 'Extra Large' },
                        ].map((sz, idx) => (
                          <ToggleButton key={sz.id} id={sz.id} className="text-xs px-1.5">
                            {idx > 0 && <ToggleButtonGroup.Separator />}
                            {sz.label}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </div>
                  </div>

                  <Separator />

                  {/* Border Weight & Border Radius Controls */}
                  <div className="space-y-3.5">
                    <Label>Border Weight & Corner Radius</Label>

                    {/* Grid Border Weight Slider + Quick Presets */}
                    <div className="space-y-1.5">
                      <Slider
                        value={styleConfig.borderWidth}
                        onChange={(v) =>
                          updateStyle({ borderWidth: typeof v === 'number' ? v : v[0] })
                        }
                        minValue={1}
                        maxValue={4}
                        step={1}
                      >
                        <Label>Grid Border Weight (Thickness)</Label>
                        <Slider.Output>{({ state }) => `${state.values[0]}px`}</Slider.Output>
                        <Slider.Track>
                          <Slider.Fill />
                          <Slider.Thumb />
                        </Slider.Track>
                      </Slider>

                      <ToggleButtonGroup
                        aria-label="Quick Grid Border Weight"
                        selectionMode="single"
                        fullWidth
                        size="sm"
                        selectedKeys={new Set([String(styleConfig.borderWidth)])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          if (selected !== undefined) updateStyle({ borderWidth: Number(selected) });
                        }}
                      >
                        {[1, 2, 3, 4].map((bw, idx) => (
                          <ToggleButton key={bw} id={String(bw)} className="text-xs font-mono px-2">
                            {idx > 0 && <ToggleButtonGroup.Separator />}
                            {bw}px
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </div>

                    {/* Corner Radius Slider + Quick Presets */}
                    <div className="space-y-1.5">
                      <Slider
                        value={styleConfig.borderRadius}
                        onChange={(v) =>
                          updateStyle({ borderRadius: typeof v === 'number' ? v : v[0] })
                        }
                        minValue={0}
                        maxValue={24}
                        step={1}
                      >
                        <Label>Corner Radius (Border Radius)</Label>
                        <Slider.Output>{({ state }) => `${state.values[0]}px`}</Slider.Output>
                        <Slider.Track>
                          <Slider.Fill />
                          <Slider.Thumb />
                        </Slider.Track>
                      </Slider>

                      <ToggleButtonGroup
                        aria-label="Quick Corner Radius"
                        selectionMode="single"
                        fullWidth
                        size="sm"
                        selectedKeys={new Set([String(styleConfig.borderRadius)])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          if (selected !== undefined) updateStyle({ borderRadius: Number(selected) });
                        }}
                      >
                        {[0, 4, 8, 12, 16, 24].map((r, idx) => (
                          <ToggleButton key={r} id={String(r)} className="text-xs font-mono px-1.5">
                            {idx > 0 && <ToggleButtonGroup.Separator />}
                            {r}px
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Header & Title Colors</Label>
                    <WizardColorPicker
                      label="Month & Year Title Color"
                      value={styleConfig.titleTextColor || '#09090b'}
                      onChange={(hex) => updateStyle({ titleTextColor: hex })}
                    />
                    <WizardColorPicker
                      label="Header Start Color"
                      value={styleConfig.headerBgColor}
                      onChange={(hex) => updateStyle({ headerBgColor: hex })}
                    />
                    <WizardColorPicker
                      label="Header End Color"
                      value={styleConfig.headerGradientEnd}
                      onChange={(hex) => updateStyle({ headerGradientEnd: hex })}
                    />
                    <WizardColorPicker
                      label="Header Text Color"
                      value={styleConfig.headerTextColor}
                      onChange={(hex) => updateStyle({ headerTextColor: hex })}
                    />

                    {/* Header Accent & Border Color with On/Off Switch + Header Border Weight */}
                    <Surface variant="secondary" className="rounded-2xl px-3 py-2.5 space-y-2.5 min-w-0">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {styleConfig.showHeaderAccent !== false ? (
                            <ColorPicker
                              value={safeParseColor(styleConfig.headerAccentColor)}
                              onChange={(color) =>
                                updateStyle({ headerAccentColor: color.toString('hex') })
                              }
                            >
                              <ColorPicker.Trigger aria-label="Header Accent & Border Color" className="max-w-full">
                                <ColorSwatch size="sm" shape="circle" className="shrink-0" />
                                <Label className="truncate text-xs sm:text-sm cursor-pointer">
                                  Header Accent & Border Color
                                </Label>
                              </ColorPicker.Trigger>
                              <ColorPicker.Popover placement="bottom start" className="max-w-62">
                                <ColorArea
                                  aria-label="Header Accent & Border Color saturation and brightness"
                                  colorSpace="hsb"
                                  xChannel="saturation"
                                  yChannel="brightness"
                                  className="max-w-full"
                                >
                                  <ColorArea.Thumb />
                                </ColorArea>
                                <ColorSlider
                                  aria-label="Header Accent & Border Color hue"
                                  channel="hue"
                                  colorSpace="hsb"
                                >
                                  <Label>Hue</Label>
                                  <ColorSlider.Output />
                                  <ColorSlider.Track>
                                    <ColorSlider.Thumb />
                                  </ColorSlider.Track>
                                </ColorSlider>
                                <ColorField aria-label="Header Accent & Border Color hex value" fullWidth>
                                  <Label>Hex Color</Label>
                                  <Input variant="secondary" />
                                </ColorField>
                              </ColorPicker.Popover>
                            </ColorPicker>
                          ) : (
                            <span className="text-xs sm:text-sm font-medium text-muted truncate">
                              Header Accent & Border Color (Off)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {styleConfig.showHeaderAccent !== false && (
                            <span className="font-mono text-xs text-muted uppercase hidden sm:inline">
                              {safeParseColor(styleConfig.headerAccentColor).toString('hex')}
                            </span>
                          )}
                          <Switch
                            size="sm"
                            isSelected={styleConfig.showHeaderAccent !== false}
                            onChange={(checked) => updateStyle({ showHeaderAccent: checked })}
                            aria-label="Toggle Header Accent & Border Color"
                          >
                            <Switch.Content>
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                              <Label className="text-xs">
                                {styleConfig.showHeaderAccent !== false ? 'On' : 'Off'}
                              </Label>
                            </Switch.Content>
                          </Switch>
                        </div>
                      </div>

                      {styleConfig.showHeaderAccent !== false && (
                        <Slider
                          value={styleConfig.headerBorderWidth ?? 2}
                          onChange={(v) =>
                            updateStyle({ headerBorderWidth: typeof v === 'number' ? v : v[0] })
                          }
                          minValue={0}
                          maxValue={4}
                          step={1}
                        >
                          <Label className="text-xs">Header Banner Border Weight</Label>
                          <Slider.Output className="text-xs">
                            {({ state }) => `${state.values[0]}px`}
                          </Slider.Output>
                          <Slider.Track>
                            <Slider.Fill />
                            <Slider.Thumb />
                          </Slider.Track>
                        </Slider>
                      )}
                    </Surface>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Grid, Sundays & Cell Colors</Label>
                    <WizardColorPicker
                      label="Border Frame Color"
                      value={styleConfig.borderColor}
                      onChange={(hex) => updateStyle({ borderColor: hex })}
                    />
                    <WizardColorPicker
                      label="Sunday / Holiday Highlight Color"
                      value={styleConfig.sundayColor}
                      onChange={(hex) => updateStyle({ sundayColor: hex })}
                    />
                    <WizardColorPicker
                      label="Weekday Header Background"
                      value={styleConfig.weekdayBgColor || '#f8fafc'}
                      onChange={(hex) => updateStyle({ weekdayBgColor: hex })}
                    />
                    <WizardColorPicker
                      label="Weekday Header Text Color"
                      value={styleConfig.weekdayTextColor || '#334155'}
                      onChange={(hex) => updateStyle({ weekdayTextColor: hex })}
                    />
                    <WizardColorPicker
                      label="Calendar Cell Background"
                      value={styleConfig.cellBgColor || '#ffffff'}
                      onChange={(hex) => updateStyle({ cellBgColor: hex })}
                    />
                    <WizardColorPicker
                      label="Day Number Text Color"
                      value={styleConfig.dayNumberColor || '#1e293b'}
                      onChange={(hex) => updateStyle({ dayNumberColor: hex })}
                    />
                  </div>
                </Card.Content>
              </>
            )}

            {/* STEP 3: ADD MOON & TIDE, HOLIDAYS, WEEK NUMBERS & CUSTOM DATES */}
            {step === 'content' && (
              <>
                <Card.Header>
                  <Card.Title>Step 3: Moon, Holidays, Week Numbers & Custom Dates</Card.Title>
                  <Card.Description>
                    Choose whether to include moon phases, official holidays, ISO week numbers, and personal/company events.
                  </Card.Description>
                </Card.Header>

                <Separator />

                <Card.Content className="space-y-5">
                  {/* Question 1: Add Moon & Tide or not? */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Label>Add Moon & Tide Phases?</Label>
                        <p className="text-xs text-muted mt-0.5">
                          Displays daily lunar illumination %, New/Full Moon markers, and the Lunar Key legend.
                        </p>
                      </div>
                      <Switch
                        size="sm"
                        isSelected={styleConfig.showMoonPhases !== false}
                        onChange={(checked) => updateStyle({ showMoonPhases: checked })}
                        aria-label="Add Moon and Tide Phases"
                        className="shrink-0"
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Label className="text-xs">
                            {styleConfig.showMoonPhases !== false ? 'Yes' : 'No'}
                          </Label>
                        </Switch.Content>
                      </Switch>
                    </div>

                    <ToggleButtonGroup
                      aria-label="Moon and Tide Option"
                      selectionMode="single"
                      disallowEmptySelection
                      fullWidth
                      size="sm"
                      selectedKeys={new Set([styleConfig.showMoonPhases !== false ? 'yes' : 'no'])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        if (selected) updateStyle({ showMoonPhases: selected === 'yes' });
                      }}
                    >
                      <ToggleButton id="yes" className="text-xs sm:text-sm">
                        <Moon className="size-4 shrink-0" />
                        <span className="hidden sm:inline">Yes, Include Moon & Tides</span>
                        <span className="sm:hidden">Include Moon & Tides</span>
                      </ToggleButton>
                      <ToggleButton id="no" className="text-xs sm:text-sm">
                        <ToggleButtonGroup.Separator />
                        <span className="hidden sm:inline">No, Hide Moon & Tides</span>
                        <span className="sm:hidden">Hide Moon & Tides</span>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>

                  <Separator />

                  {/* Question 2: Add Holidays or not? */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Label>Add Official Holidays?</Label>
                        <p className="text-xs text-muted mt-0.5">
                          Displays Regular Public Holidays, Special Non-Working Days, and cultural observances.
                        </p>
                      </div>
                      <Switch
                        size="sm"
                        isSelected={styleConfig.showHolidays !== false}
                        onChange={(checked) =>
                          updateStyle({ showHolidays: checked, showCultural: checked })
                        }
                        aria-label="Add Official Holidays"
                        className="shrink-0"
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Label className="text-xs">
                            {styleConfig.showHolidays !== false ? 'Yes' : 'No'}
                          </Label>
                        </Switch.Content>
                      </Switch>
                    </div>

                    <ToggleButtonGroup
                      aria-label="Holidays Option"
                      selectionMode="single"
                      disallowEmptySelection
                      fullWidth
                      size="sm"
                      selectedKeys={new Set([styleConfig.showHolidays !== false ? 'yes' : 'no'])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        if (selected) {
                          const enabled = selected === 'yes';
                          updateStyle({ showHolidays: enabled, showCultural: enabled });
                        }
                      }}
                    >
                      <ToggleButton id="yes" className="text-xs sm:text-sm">
                        <CalendarDays className="size-4 shrink-0" />
                        <span className="hidden sm:inline">Yes, Include Holidays</span>
                        <span className="sm:hidden">Include Holidays</span>
                      </ToggleButton>
                      <ToggleButton id="no" className="text-xs sm:text-sm">
                        <ToggleButtonGroup.Separator />
                        <span className="hidden sm:inline">No, Hide Holidays</span>
                        <span className="sm:hidden">Hide Holidays</span>
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {styleConfig.showHolidays !== false && (
                      <div className="space-y-1 pt-1">
                        <Label className="text-xs">Holiday Badge Style</Label>
                        <ToggleButtonGroup
                          aria-label="Holiday Badge Style"
                          selectionMode="single"
                          disallowEmptySelection
                          fullWidth
                          size="sm"
                          selectedKeys={new Set([styleConfig.holidayBadgeStyle])}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as
                              | CalendarStyleConfig['holidayBadgeStyle']
                              | undefined;
                            if (selected) updateStyle({ holidayBadgeStyle: selected });
                          }}
                        >
                          {[
                            { id: 'stripe', label: 'Stripe Bar' },
                            { id: 'pill', label: 'Rounded Pill' },
                            { id: 'minimal', label: 'Minimal Dot' },
                          ].map((st, idx) => (
                            <ToggleButton key={st.id} id={st.id} className="text-xs px-2">
                              {idx > 0 && <ToggleButtonGroup.Separator />}
                              {st.label}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Question 3: Show Week Numbers (W1-W52)? */}
                  <Surface variant="secondary" className="rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Hash className="size-4 text-accent shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-foreground">
                          Show Week Numbers (W1–W52)
                        </div>
                        <div className="text-[11px] sm:text-xs text-muted">
                          Prints the week number badge on each row for business & project planning.
                        </div>
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={Boolean(styleConfig.showWeekNumbers)}
                      onChange={(checked) => updateStyle({ showWeekNumbers: checked })}
                      aria-label="Show Week Numbers"
                      className="shrink-0"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <Label className="text-xs">
                          {styleConfig.showWeekNumbers ? 'On' : 'Off'}
                        </Label>
                      </Switch.Content>
                    </Switch>
                  </Surface>

                  <Separator />

                  {/* Custom Dates, Birthdays & Milestones */}
                  <div className="space-y-3">
                    <div>
                      <Label>Custom Dates, Birthdays & Anniversaries</Label>
                      <p className="text-xs text-muted mt-0.5">
                        Add custom events (birthdays, company milestones, fiestas) to print directly on the calendar cells.
                      </p>
                    </div>

                    {onAddEvent && (
                      <EventForm
                        newEventDate={newEventDate}
                        newEventTitle={newEventTitle}
                        onDateChange={setNewEventDate}
                        onTitleChange={setNewEventTitle}
                        onAdd={onAddEvent}
                      />
                    )}

                    {events.length > 0 && (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {events.map((ev) => (
                          <Surface
                            key={ev.id}
                            variant="secondary"
                            className="rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-foreground truncate">
                                {ev.title}
                              </div>
                              <div className="text-[11px] font-mono text-muted">{ev.date}</div>
                            </div>
                            {onDeleteEvent && (
                              <Button
                                size="sm"
                                isIconOnly
                                variant="tertiary"
                                onPress={() => onDeleteEvent(ev.id)}
                                aria-label={`Delete ${ev.title}`}
                              >
                                <Trash2 className="size-3.5 text-danger" />
                              </Button>
                            )}
                          </Surface>
                        ))}
                      </div>
                    )}
                  </div>
                </Card.Content>
              </>
            )}

            {/* STEP 4: WHAT PAPER WILL BE USED, PUNCH-HOLES & MONTHLY MEMO LINES */}
            {step === 'paper' && (
              <>
                <Card.Header>
                  <Card.Title>Step 4: Paper Setup, Punch-Holes & Notes Box</Card.Title>
                  <Card.Description>
                    Select the physical paper sheet size, orientation, margins, punch-holes, and optional ruled memo lines.
                  </Card.Description>
                </Card.Header>

                <Separator />

                <Card.Content className="space-y-5">
                  {/* Paper Size */}
                  <div className="space-y-2">
                    <Label>What Paper Size Will Be Used?</Label>
                    <ToggleButtonGroup
                      aria-label="Paper Size"
                      selectionMode="single"
                      disallowEmptySelection
                      fullWidth
                      size="sm"
                      selectedKeys={new Set([styleConfig.paperSize])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as 'a4' | 'letter' | undefined;
                        if (selected) updateStyle({ paperSize: selected });
                      }}
                    >
                      <ToggleButton id="a4" className="text-xs sm:text-sm">
                        <FileText className="size-4 shrink-0" />
                        <span className="hidden sm:inline">A4 Sheet (210 × 297 mm)</span>
                        <span className="sm:hidden">A4 (210×297mm)</span>
                      </ToggleButton>
                      <ToggleButton id="letter" className="text-xs sm:text-sm">
                        <ToggleButtonGroup.Separator />
                        <FileText className="size-4 shrink-0" />
                        <span className="hidden sm:inline">US Letter (8.5 × 11 in)</span>
                        <span className="sm:hidden">Letter (8.5×11&quot;)</span>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>

                  {/* Orientation */}
                  <div className="space-y-2">
                    <Label>Page Orientation</Label>
                    <ToggleButtonGroup
                      aria-label="Page Orientation"
                      selectionMode="single"
                      disallowEmptySelection
                      fullWidth
                      size="sm"
                      selectedKeys={new Set([styleConfig.printOrientation])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as 'landscape' | 'portrait' | undefined;
                        if (selected) updateStyle({ printOrientation: selected });
                      }}
                    >
                      <ToggleButton id="landscape" className="text-xs sm:text-sm">
                        <RectangleHorizontal className="size-4 shrink-0" />
                        <span className="hidden sm:inline">Landscape (Desk / Wall)</span>
                        <span className="sm:hidden">Landscape</span>
                      </ToggleButton>
                      <ToggleButton id="portrait" className="text-xs sm:text-sm">
                        <ToggleButtonGroup.Separator />
                        <RectangleVertical className="size-4 shrink-0" />
                        <span className="hidden sm:inline">Portrait (Hanging Wall)</span>
                        <span className="sm:hidden">Portrait</span>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>

                  {/* Punch-Holes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Label>Add Wall Calendar Punch-Holes?</Label>
                        <p className="text-xs text-muted mt-0.5">
                          Adds top spiral binding / hole-punch guides on the printed sheet.
                        </p>
                      </div>
                      <Switch
                        size="sm"
                        isSelected={styleConfig.showHolePunchGuide}
                        onChange={(checked) => updateStyle({ showHolePunchGuide: checked })}
                        aria-label="Add Punch-Holes"
                        className="shrink-0"
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Label className="text-xs">
                            {styleConfig.showHolePunchGuide ? 'Yes' : 'No'}
                          </Label>
                        </Switch.Content>
                      </Switch>
                    </div>

                    <ToggleButtonGroup
                      aria-label="Punch-Holes Option"
                      selectionMode="single"
                      disallowEmptySelection
                      fullWidth
                      size="sm"
                      selectedKeys={new Set([styleConfig.showHolePunchGuide ? 'yes' : 'no'])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        if (selected) updateStyle({ showHolePunchGuide: selected === 'yes' });
                      }}
                    >
                      <ToggleButton id="yes" className="text-xs sm:text-sm">
                        <CircleDot className="size-4 shrink-0" />
                        <span>Yes, Add Punch-Holes</span>
                      </ToggleButton>
                      <ToggleButton id="no" className="text-xs sm:text-sm">
                        <ToggleButtonGroup.Separator />
                        <span>No Punch-Holes</span>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>

                  {/* Monthly Notes & Reminders Ruled Box */}
                  <Surface variant="secondary" className="rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <NotebookPen className="size-4 text-accent shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-foreground">
                          Include Monthly Notes & Reminders Box?
                        </div>
                        <div className="text-[11px] sm:text-xs text-muted">
                          Prints ruled handwriting lines below the calendar grid for notes and to-dos.
                        </div>
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={Boolean(styleConfig.showMemoLines)}
                      onChange={(checked) => updateStyle({ showMemoLines: checked })}
                      aria-label="Include Monthly Notes Box"
                      className="shrink-0"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <Label className="text-xs">
                          {styleConfig.showMemoLines ? 'Yes' : 'No'}
                        </Label>
                      </Switch.Content>
                    </Switch>
                  </Surface>

                  {/* Print Margin Slider */}
                  <Slider
                    value={styleConfig.printMargin}
                    onChange={(v) =>
                      updateStyle({ printMargin: typeof v === 'number' ? v : v[0] })
                    }
                    minValue={2}
                    maxValue={20}
                    step={1}
                  >
                    <Label>Paper Margin (Full Bleed Control)</Label>
                    <Slider.Output>{({ state }) => `${state.values[0]}mm`}</Slider.Output>
                    <Slider.Track>
                      <Slider.Fill />
                      <Slider.Thumb />
                    </Slider.Track>
                  </Slider>
                </Card.Content>
              </>
            )}

            <Separator />

            <Card.Footer className="justify-between gap-2 flex-wrap">
              <Button variant="secondary" onPress={goPrevStep}>
                <ArrowLeft className="size-4 shrink-0" />
                <span>{currentStepIndex === 0 ? 'Back to Landing' : 'Previous'}</span>
              </Button>

              {currentStepIndex < WIZARD_STEPS.length - 1 ? (
                <Button variant="primary" onPress={goNextStep}>
                  <span>Next Step</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Button>
              ) : (
                <Button variant="primary" onPress={onFinishToPreview}>
                  <Check className="size-4 shrink-0" />
                  <span>Show 1=1 Preview & Export</span>
                </Button>
              )}
            </Card.Footer>
          </Card>
        </div>

        {/* Right Column: Sticky Live 1=1 Sheet Preview (Always visible on Desktop lg+, and below form on Mobile) */}
        <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-20">
          <Card variant="secondary">
            <Card.Header className="flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <Card.Title className="text-sm sm:text-base">
                  Live 1=1 Calendar Sheet Preview ({MONTH_NAMES[month - 1]} {year})
                </Card.Title>
                <Card.Description className="text-xs">
                  Updates in real time as you configure each step.
                </Card.Description>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Chip size="sm" variant="soft" color="accent" className="uppercase font-mono">
                  {styleConfig.paperSize} • {styleConfig.printOrientation}
                </Chip>
                <Button size="sm" variant="primary" onPress={onFinishToPreview}>
                  <span>Preview & Export</span>
                </Button>
              </div>
            </Card.Header>
            <Card.Content className="items-center">
              <div
                className="bg-white shadow-surface overflow-hidden border border-border w-full mx-auto"
                style={{
                  maxWidth: styleConfig.printOrientation === 'landscape' ? '100%' : '420px',
                  aspectRatio: `${dims.widthMm} / ${dims.heightMm}`,
                }}
              >
                <canvas
                  ref={previewCanvasRef}
                  data-testid="wizard-preview-canvas"
                  className="w-full h-full block"
                />
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};
