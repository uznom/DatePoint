import React, { useEffect, useRef, useState } from 'react';
import { 
  AdvertConfig, 
  CalendarStyleConfig, 
  HolidayItem, 
  UserEvent 
} from '../types';
import { WizardStep } from './CalendarSetupFlow';
import { 
  buildCalendarMonthCells,
  exportCalendarToPdf, 
  getPaperDimensions, 
  loadHeaderImage, 
  renderCalendarSheetToCanvas 
} from '../utils/pdfExport';
import { 
  Button, 
  Card, 
  Chip,
  ListBox, 
  Select, 
  Surface, 
  ToggleButton, 
  ToggleButtonGroup 
} from '@heroui/react';
import { 
  Printer, 
  FileDown, 
  Sliders, 
  CircleDot,
  Check,
  RectangleHorizontal,
  RectangleVertical,
  Maximize2,
  Minimize2,
  Palette,
  ArrowLeft
} from 'lucide-react';

interface PrintPreviewSheetProps {
  year: number;
  month: number;
  advertConfig: AdvertConfig;
  styleConfig: CalendarStyleConfig;
  holidays: HolidayItem[];
  events: UserEvent[];
  onOpenCustomizer: () => void;
  onStyleChange: (newStyle: CalendarStyleConfig) => void;
  onEditWizardSteps?: (step?: WizardStep) => void;
  onOpenExportModal?: () => void;
  printOnly?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type PreviewZoomMode = 'fit-screen' | 'fit-width';

export const PrintPreviewSheet: React.FC<PrintPreviewSheetProps> = ({
  year,
  month,
  advertConfig,
  styleConfig,
  holidays,
  events,
  onOpenCustomizer,
  onStyleChange,
  onEditWizardSteps,
  onOpenExportModal,
  printOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedHeaderImg, setLoadedHeaderImg] = useState<HTMLImageElement | null>(null);
  const [fontsLoadedTick, setFontsLoadedTick] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportDone, setExportDone] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<PreviewZoomMode>('fit-screen');

  const isLandscape = styleConfig.printOrientation === 'landscape';
  const monthName = MONTH_NAMES[month - 1];
  const dims = getPaperDimensions(styleConfig.paperSize || 'a4', styleConfig.printOrientation || 'landscape');
  const cells = buildCalendarMonthCells(year, month);

  // Load header emblem/logo image whenever URL changes
  useEffect(() => {
    let active = true;
    const url = styleConfig.headerImage?.enabled ? styleConfig.headerImage?.url : undefined;
    if (!url) {
      setLoadedHeaderImg(null);
      return;
    }
    loadHeaderImage(url).then((img) => {
      if (active) {
        setLoadedHeaderImg(img);
      }
    });
    return () => {
      active = false;
    };
  }, [styleConfig.headerImage?.enabled, styleConfig.headerImage?.url]);

  // Re-trigger canvas render once web fonts finish loading
  useEffect(() => {
    let active = true;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) {
          setFontsLoadedTick((t) => t + 1);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [styleConfig.fontFamily, styleConfig.fontWeight]);

  // Render the exact 1=1 sheet onto the preview canvas whenever any config or data updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderCalendarSheetToCanvas(canvas, {
      year,
      month,
      advertConfig,
      styleConfig,
      holidays,
      events,
      headerImg: loadedHeaderImg,
      scale: 2.5,
    });
  }, [
    year,
    month,
    advertConfig,
    styleConfig,
    holidays,
    events,
    loadedHeaderImg,
    fontsLoadedTick,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    setExportDone(false);
    try {
      await exportCalendarToPdf({
        year,
        month,
        advertConfig,
        events,
        styleConfig,
        orientation: styleConfig.printOrientation,
        fullYear: false,
      });
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const recipientLabel =
    styleConfig.recipientType === 'personal'
      ? 'Personal & Household'
      : styleConfig.recipientType === 'civic'
      ? 'Civic & Community'
      : styleConfig.recipientType === 'maritime'
      ? 'Maritime & Agriculture'
      : 'Business & Commercial';

  return (
    <div className={printOnly ? 'hidden print:block' : 'space-y-3 sm:space-y-4'}>
      {/* 1=1 Print Control & Edit/Export Bar using 1:1 HeroUI v3 Components */}
      {!printOnly && (
        <Card variant="default" className="print:hidden">
          <Card.Content className="space-y-3">
            {/* Top Row: Quick Step Jump Pills (Click any chip to edit that step) + Primary Export/Edit Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Clickable Setup Summary Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {onEditWizardSteps && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => onEditWizardSteps('recipient')}
                  >
                    <ArrowLeft className="size-3.5 shrink-0" />
                    <span>Edit Setup Steps</span>
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => onEditWizardSteps?.('recipient')}
                  className="cursor-pointer"
                  title="Edit Step 1: Who Is It For?"
                >
                  <Chip size="sm" variant="soft" color="default">
                    1. {recipientLabel}
                  </Chip>
                </button>

                <button
                  type="button"
                  onClick={() => onEditWizardSteps?.('typography')}
                  className="cursor-pointer"
                  title="Edit Step 2: Fonts & Typography"
                >
                  <Chip size="sm" variant="soft" color="default">
                    2. Font: {styleConfig.fontFamily}
                  </Chip>
                </button>

                <button
                  type="button"
                  onClick={() => onEditWizardSteps?.('colors')}
                  className="cursor-pointer"
                  title="Edit Step 3: Colors & Style"
                >
                  <Chip size="sm" variant="soft" color="default">
                    3. Colors &amp; Borders
                  </Chip>
                </button>

                <button
                  type="button"
                  onClick={() => onEditWizardSteps?.('content')}
                  className="cursor-pointer"
                  title="Edit Step 4: Moon & Holidays"
                >
                  <Chip
                    size="sm"
                    variant="soft"
                    color={styleConfig.showMoonPhases !== false ? 'accent' : 'default'}
                  >
                    4. Moon: {styleConfig.showMoonPhases !== false ? 'On' : 'Off'} • Holidays:{' '}
                    {styleConfig.showHolidays !== false ? 'On' : 'Off'}
                  </Chip>
                </button>

                <button
                  type="button"
                  onClick={() => onEditWizardSteps?.('paper')}
                  className="cursor-pointer"
                  title="Edit Step 5: Paper & Punch-Holes"
                >
                  <Chip size="sm" variant="soft" color="accent" className="uppercase font-mono">
                    5. {styleConfig.paperSize} • {styleConfig.printOrientation} • Holes:{' '}
                    {styleConfig.showHolePunchGuide ? 'Yes' : 'No'}
                  </Chip>
                </button>
              </div>

              {/* Primary Export or Edit Buttons */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={onOpenCustomizer}
                  className="w-full sm:w-auto"
                >
                  <Palette className="size-4 shrink-0" />
                  <span>Fine-Tune Styles</span>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onPress={handlePrint}
                  className="w-full sm:w-auto"
                >
                  <Printer className="size-4 shrink-0" />
                  <span>Print 1=1</span>
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onPress={onOpenExportModal || handlePdfExport}
                  isDisabled={isExporting}
                  aria-label="Export 1=1 PDF"
                  className="col-span-2 sm:col-span-1 w-full sm:w-auto"
                >
                  {exportDone ? (
                    <Check className="size-4 text-success shrink-0" />
                  ) : (
                    <FileDown className="size-4 shrink-0" />
                  )}
                  <span>{isExporting ? 'Exporting...' : exportDone ? 'Saved PDF' : 'Export 1=1 PDF'}</span>
                </Button>
              </div>
            </div>

            {/* Second Row: Quick Paper, Orientation, Hole-Punch & Screen Fit Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {/* Orientation switch */}
                <ToggleButtonGroup
                  aria-label="Print Orientation"
                  selectionMode="single"
                  disallowEmptySelection
                  size="sm"
                  selectedKeys={new Set([styleConfig.printOrientation])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'landscape' | 'portrait' | undefined;
                    if (selected) onStyleChange({ ...styleConfig, printOrientation: selected });
                  }}
                >
                  <ToggleButton id="landscape" className="text-xs">
                    <RectangleHorizontal className="size-3.5 shrink-0" />
                    <span>Landscape</span>
                  </ToggleButton>
                  <ToggleButton id="portrait" className="text-xs">
                    <ToggleButtonGroup.Separator />
                    <RectangleVertical className="size-3.5 shrink-0" />
                    <span>Portrait</span>
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Paper Size */}
                <Select
                  aria-label="Paper Size"
                  selectedKey={styleConfig.paperSize}
                  onSelectionChange={(k) => {
                    if (k) onStyleChange({ ...styleConfig, paperSize: k as 'a4' | 'letter' });
                  }}
                  className="w-48 sm:w-52"
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="a4" textValue="A4 (210 × 297mm)">
                        A4 (210 × 297mm)
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="letter" textValue="US Letter (8.5 × 11 in)">
                        US Letter (8.5 × 11 in)
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>

                {/* Hole Punch Wall Guide Toggle */}
                <ToggleButton
                  size="sm"
                  isSelected={styleConfig.showHolePunchGuide}
                  onChange={(selected) => onStyleChange({ ...styleConfig, showHolePunchGuide: selected })}
                  aria-label="Toggle wall calendar hanging punch hole guides"
                  className="text-xs"
                >
                  <CircleDot className="size-3.5 shrink-0" />
                  <span>Punch-Holes</span>
                </ToggleButton>
              </div>

              {/* Screen Fit / Zoom Toggle for Laptop, Tablet & Desktop Viewports */}
              <div className="hidden sm:flex items-center gap-2">
                <ToggleButtonGroup
                  aria-label="Screen Fit Mode"
                  selectionMode="single"
                  disallowEmptySelection
                  size="sm"
                  selectedKeys={new Set([zoomMode])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as PreviewZoomMode | undefined;
                    if (selected) setZoomMode(selected);
                  }}
                >
                  <ToggleButton id="fit-screen" className="text-xs">
                    <Minimize2 className="size-3.5 shrink-0" />
                    <span>Fit Screen</span>
                  </ToggleButton>
                  <ToggleButton id="fit-width" className="text-xs">
                    <ToggleButtonGroup.Separator />
                    <Maximize2 className="size-3.5 shrink-0" />
                    <span>Full Width</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* 1=1 WYSIWYG Print Sheet Simulator - Responsive to screen height/width */}
      <Surface
        variant="secondary"
        className={
          printOnly
            ? 'w-full'
            : 'flex items-center justify-center overflow-x-auto p-2 sm:p-5 lg:p-6 rounded-3xl border border-border print:p-0 print:bg-transparent print:border-0'
        }
      >
        <div
          className={`bg-white text-zinc-900 shadow-2xl print:shadow-none relative transition-all mx-auto overflow-hidden ${
            zoomMode === 'fit-screen'
              ? isLandscape
                ? 'w-full max-w-[980px] lg:max-h-[calc(100vh-250px)] lg:w-auto print:max-w-none print:max-h-none'
                : 'w-full max-w-[560px] lg:max-h-[calc(100vh-230px)] lg:w-auto print:max-w-none print:max-h-none'
              : isLandscape
              ? 'w-full max-w-[1280px] print:max-w-none'
              : 'w-full max-w-[820px] print:max-w-none'
          }`}
          style={{
            aspectRatio: `${dims.widthMm} / ${dims.heightMm}`,
          }}
        >
          <canvas
            ref={canvasRef}
            data-testid="print-preview-canvas"
            data-orientation={styleConfig.printOrientation}
            data-paper-size={styleConfig.paperSize}
            data-font-family={styleConfig.fontFamily}
            data-border-radius={styleConfig.borderRadius}
            data-alignment={styleConfig.monthYearAlignment}
            className="w-full h-full block"
          />

          {/* Accessible DOM Summary for Screen Readers & Automated Snapshot Verification */}
          <div className="sr-only">
            {advertConfig.enabled && (
              <div>
                <h2>{advertConfig.businessName}</h2>
                <p>{advertConfig.tagline}</p>
                <span>{advertConfig.hotline}</span>
                <span>{advertConfig.address}</span>
                <span>{advertConfig.website}</span>
              </div>
            )}
            <h1>{monthName} {year}</h1>
            <p>
              Layout: {styleConfig.printOrientation} {styleConfig.paperSize.toUpperCase()} • Font: {styleConfig.fontFamily} ({styleConfig.fontWeight}) • Alignment: {styleConfig.monthYearAlignment} • Cells: {cells.length}
            </p>
            <ul>
              {holidays.map((h) => (
                <li key={h.id}>{h.date}: {h.name}</li>
              ))}
              {events.map((e) => (
                <li key={e.id}>{e.date}: {e.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </Surface>
    </div>
  );
};
