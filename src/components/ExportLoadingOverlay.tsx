import React from 'react';
import { Card } from '@heroui/react';
import { FileDown, Loader2 } from 'lucide-react';
import { PdfExportProgress } from '../utils/pdfExport';

interface ExportLoadingOverlayProps {
  progress: PdfExportProgress | null;
}

export const ExportLoadingOverlay: React.FC<ExportLoadingOverlayProps> = ({ progress }) => {
  if (!progress) return null;

  const percent = Math.min(100, Math.max(0, Math.round(progress.percent)));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Exporting PDF"
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden"
    >
      <Card variant="default" className="w-full max-w-sm shadow-overlay border border-border">
        <Card.Content className="items-center text-center space-y-4 py-6 px-5">
          <div className="relative size-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            <FileDown className="size-6" />
            <Loader2 className="size-14 absolute inset-0 animate-spin text-accent/40 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Generating Print-Ready PDF
            </h3>
            <p className="text-xs text-muted">
              {progress.label}
            </p>
          </div>

          <div className="w-full space-y-1.5">
            <div className="w-full h-2 rounded-full bg-default overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-200 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-muted">
              <span>
                {progress.totalPages > 0
                  ? `Page ${Math.min(progress.currentPage, progress.totalPages)} of ${progress.totalPages}`
                  : 'Preparing'}
              </span>
              <span>{percent}%</span>
            </div>
          </div>

          <p className="text-[11px] text-muted">
            Compressing pages for a smaller file size — please keep this tab open.
          </p>
        </Card.Content>
      </Card>
    </div>
  );
};
