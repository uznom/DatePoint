import React, { useEffect, useRef, useState } from 'react';
import { AdvertConfig, UserEvent, CalendarStyleConfig } from '../types';
import { 
  exportCalendarToPdf, 
  getPaperDimensions, 
  loadHeaderImage, 
  renderCalendarSheetToCanvas 
} from '../utils/pdfExport';
import { getHolidaysForMonth } from '../utils/phHolidays';
import { DEFAULT_STYLE_CONFIG } from '../utils/stylePresets';
import { 
  Button, 
  Card, 
  Chip,
  Label,
  Modal, 
  ToggleButton,
  ToggleButtonGroup
} from '@heroui/react';
import { 
  FileDown, 
  Printer, 
  Check, 
  Calendar, 
  BookOpen,
  RectangleHorizontal,
  RectangleVertical
} from 'lucide-react';

interface ExportModalProps {
  year: number;
  month: number;
  advertConfig: AdvertConfig;
  events: UserEvent[];
  styleConfig?: CalendarStyleConfig;
  onStyleChange?: (newStyle: CalendarStyleConfig) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ExportModal: React.FC<ExportModalProps> = ({
  year,
  month,
  advertConfig,
  events,
  styleConfig = DEFAULT_STYLE_CONFIG,
  onStyleChange,
  onClose,
}) => {
  const [exportScope, setExportScope] = useState<'month' | 'year'>('month');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    styleConfig?.printOrientation || 'landscape'
  );
  const [dpiQuality, setDpiQuality] = useState<'standard-300' | 'ultra-450'>('ultra-450');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const effectiveStyle: CalendarStyleConfig = {
    ...styleConfig,
    printOrientation: orientation,
  };
  const dims = getPaperDimensions(effectiveStyle.paperSize || 'a4', orientation);

  useEffect(() => {
    let active = true;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const renderPreview = async () => {
      const url = effectiveStyle.headerImage?.enabled ? effectiveStyle.headerImage?.url : undefined;
      const headerImg = url ? await loadHeaderImage(url) : null;
      if (!active || !previewCanvasRef.current) return;

      renderCalendarSheetToCanvas(previewCanvasRef.current, {
        year,
        month,
        advertConfig,
        styleConfig: effectiveStyle,
        holidays: getHolidaysForMonth(year, month),
        events,
        headerImg,
        scale: 1.5,
      });
    };

    renderPreview();
    return () => {
      active = false;
    };
  }, [year, month, advertConfig, events, styleConfig, orientation]);

  const handleOrientationSelect = (nextOrientation: 'landscape' | 'portrait') => {
    setOrientation(nextOrientation);
    if (onStyleChange) {
      onStyleChange({
        ...styleConfig,
        printOrientation: nextOrientation,
      });
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      await exportCalendarToPdf({
        year,
        month,
        advertConfig,
        events,
        styleConfig: effectiveStyle,
        orientation,
        fullYear: exportScope === 'year',
        dpiQuality,
      });
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <Modal.Backdrop
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      variant="transparent"
      isDismissable
    >
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog className="print:hidden">
          <Modal.CloseTrigger aria-label="Close export dialog" onPress={onClose} />
            <Modal.Header>
              <Modal.Heading className="flex items-center gap-2">
                <FileDown className="size-4 text-accent" />
                <span>Export 1=1 Print-Ready Calendar</span>
              </Modal.Heading>
              <p className="text-xs text-muted">
                Lossless 1=1 PDF & Print output with preloaded web fonts, crisp vectors, and exact layout parity.
              </p>
            </Modal.Header>

            <Modal.Body className="space-y-4 pt-2">
              {/* Live 1=1 Output Preview */}
              <Card variant="secondary">
                <Card.Header className="flex-row items-center justify-between">
                  <Card.Title>Live 1=1 Export Sheet Preview ({MONTH_NAMES[month - 1]} {year})</Card.Title>
                  <Chip size="sm" variant="soft" color="accent" className="uppercase font-mono">
                    {effectiveStyle.paperSize} • {orientation} • {dpiQuality === 'ultra-450' ? '450 DPI' : '300 DPI'}
                  </Chip>
                </Card.Header>
                <Card.Content className="items-center">
                  <div
                    className="bg-white shadow-surface overflow-hidden border border-border"
                    style={{
                      width: orientation === 'landscape' ? '100%' : '62%',
                      maxWidth: orientation === 'landscape' ? '380px' : '230px',
                      aspectRatio: `${dims.widthMm} / ${dims.heightMm}`,
                    }}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      data-testid="export-modal-preview-canvas"
                      className="w-full h-full block"
                    />
                  </div>
                </Card.Content>
              </Card>

              {/* Scope selection with 1:1 HeroUI ToggleButtonGroup */}
              <div className="space-y-1.5">
                <Label>Select Calendar Scope</Label>
                <ToggleButtonGroup
                  aria-label="Select Calendar Scope"
                  selectionMode="single"
                  disallowEmptySelection
                  fullWidth
                  selectedKeys={new Set([exportScope])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'month' | 'year' | undefined;
                    if (selected) setExportScope(selected);
                  }}
                >
                  <ToggleButton id="month">
                    <Calendar className="size-4" />
                    <span>Current Month ({MONTH_NAMES[month - 1]} {year})</span>
                  </ToggleButton>
                  <ToggleButton id="year">
                    <ToggleButtonGroup.Separator />
                    <BookOpen className="size-4" />
                    <span>Full Year {year} (12 Pages)</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>

              {/* Orientation selection with 1:1 HeroUI ToggleButtonGroup */}
              <div className="space-y-1.5">
                <Label>Page Orientation ({effectiveStyle.paperSize.toUpperCase()} size)</Label>
                <ToggleButtonGroup
                  aria-label="Page Orientation"
                  selectionMode="single"
                  disallowEmptySelection
                  fullWidth
                  selectedKeys={new Set([orientation])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'landscape' | 'portrait' | undefined;
                    if (selected) handleOrientationSelect(selected);
                  }}
                >
                  <ToggleButton id="landscape">
                    <RectangleHorizontal className="size-4" />
                    <span>Landscape (Desk / Wall)</span>
                  </ToggleButton>
                  <ToggleButton id="portrait">
                    <ToggleButtonGroup.Separator />
                    <RectangleVertical className="size-4" />
                    <span>Portrait (Tall Wall Hanging)</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>

              {/* Print Resolution (DPI Quality) */}
              <div className="space-y-1.5">
                <Label>PDF Print Resolution (Press Quality)</Label>
                <ToggleButtonGroup
                  aria-label="PDF Print Resolution"
                  selectionMode="single"
                  disallowEmptySelection
                  fullWidth
                  selectedKeys={new Set([dpiQuality])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'standard-300' | 'ultra-450' | undefined;
                    if (selected) setDpiQuality(selected);
                  }}
                >
                  <ToggleButton id="ultra-450">
                    <span>450 DPI Ultra-HD Press Quality</span>
                  </ToggleButton>
                  <ToggleButton id="standard-300">
                    <ToggleButtonGroup.Separator />
                    <span>300 DPI Standard Print</span>
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>

              {downloadSuccess && (
                <Card variant="secondary">
                  <Card.Content className="flex-row items-center gap-2 text-success">
                    <Check className="size-4 shrink-0" />
                    <span className="text-xs font-medium">
                      1=1 PDF exported successfully! Check your downloads folder.
                    </span>
                  </Card.Content>
                </Card>
              )}
            </Modal.Body>

            <Modal.Footer className="justify-between flex-wrap gap-2">
              <Button variant="secondary" onPress={handleNativePrint}>
                <Printer className="size-4" />
                <span>Print Directly (Browser)</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="tertiary" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleDownloadPdf}
                  isDisabled={isExporting}
                >
                  <FileDown className="size-4" />
                  <span>{isExporting ? 'Generating 1=1 PDF...' : 'Download PDF Calendar'}</span>
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
  );
};
