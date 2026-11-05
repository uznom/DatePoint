# DatePoint

**DatePoint** is a Philippine holiday, astronomical moon phase, and customizable 1=1 print-ready calendar system.

## Purpose

DatePoint is built to provide households, businesses, agricultural/maritime communities, and organizations with an accurate Philippine calendar that can be customized on-screen and exported or printed as a 1=1 commercial or personal wall/desk calendar.

## What It Does

- **Streamlined 4-Step Calendar Setup Flow**:
  1. **Who Is It For?**: Choose between Business & Commercial, Personal & Household, Civic & Community, or Maritime & Agriculture, and customize the top header banner and logo/emblem image (`Left`, `Right`, `Center Watermark`, or `Full Banner BG`).
  2. **Colors, Font Weight & Border Geometry**: Customize font family (`Mi Sans`, `Mi Lanting`, `Plus Jakarta Sans`, `Space Grotesk`, `Cinzel`, `Playfair Display`, `Inter`, `Roboto Mono`), independent **Date Number Font Weight**, **Header & Title Font Weight**, **Date Number Scale** (`Small` to `Extra Large`), **Grid Border Weight** (`1px–4px`), **Header Border Weight** (`0px–4px`), **Corner Radius** (`0px–24px`), and every calendar color via HeroUI v3 `ColorPicker` controls.
  3. **Moon, Holidays, Week Numbers & Custom Dates**: Toggle astronomical moon phases & tide indicators, official Philippine holidays & badge styles, ISO week numbers (`W1–W52`), and add custom birthdays or milestones.
  4. **Paper Setup, Punch-Holes & Notes Box**: Select **A4** or **US Letter** paper, **Landscape** or **Portrait** orientation, optional wall-hanging punch-holes, a ruled **Monthly Notes & Reminders** box, and full-bleed paper margins (`2mm–20mm`).
- **1=1 Live Preview & 450-DPI Press-Quality PDF Export**: Uses a unified HTML5 2D Canvas rendering engine (`renderCalendarSheetToCanvas`) shared between the on-screen preview, native browser print (`Ctrl+P`), and lossless 450-DPI / 300-DPI PDF export (single month or 12-page full year).

## What It Uses

- **Frontend Framework**: React 19 + TypeScript + Vite
- **UI Component System**: HeroUI v3 (`@heroui/react` & `@heroui/styles` v3.2.7)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Lucide React (`lucide-react`) + custom SVG/Canvas astronomical lunar phase renderer
- **Print & PDF Engine**: HTML5 2D Canvas (`renderCalendarSheetToCanvas`) + `jsPDF` for 1=1 WYSIWYG print and PDF generation
- **Testing**: Node.js native test runner (`node:test`) with `tsx`

## Scripts

- `npm run dev` — Start the development server on port `3000`
- `npm run build` — Build the production bundle
- `npm run lint` — Run TypeScript type checking (`tsc --noEmit`)
