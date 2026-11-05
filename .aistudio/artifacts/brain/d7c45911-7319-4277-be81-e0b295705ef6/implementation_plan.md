# DatePoint UI/UX Overhaul & Print Maximization Implementation Plan

## Executive Summary
This plan details the full UI/UX overhaul of **DatePoint** to achieve a modern, cohesive **Clean Corporate Slate** aesthetic powered strictly by **HeroUI v3** components, alongside edge-to-edge full-bleed print paper maximization and clean Month/Year title headers.

---

## 1. Confirmed User Requirements & Design Decisions
1. **Paper Maximization (1=1 Print)**:
   - Full-bleed edge-to-edge layout with dynamic flex cell stretching.
   - Elimination of fixed vertical limits and trailing whitespace so calendar cells expand to fill 100% of printable A4 / Letter paper.
   - Print margin optimized to 5mm.
2. **Title Header Cleanliness**:
   - Strictly remove `"Republic of the Philippines • Official Calendar & Moon Phases (PHT / UTC+8)"` from both the DOM print preview and PDF canvas exporter (`pdfExport.ts`).
   - Clean, high-impact Month & Year title only for maximum calendar grid visibility.
3. **HeroUI v3 Component Overhaul**:
   - Migrate system components strictly to HeroUI v3 (`@heroui/react`):
     - **Navigation & Views**: HeroUI `Tabs` and `Tab` with slate corporate pill/indicator styling.
     - **Customizer Experience**: HeroUI `Sheet` / `Drawer` slide-over with fluid transitions, replacing old floating panels.
     - **Fine-Grain Controls**: HeroUI `Slider` components for border radius, border width, image opacity, and font weights.
     - **Quick Jump Selectors**: HeroUI `Select` & `SelectItem` for month, year, font family, alignment, and orientation.
     - **Dialogs & Overlays**: HeroUI `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter` for Day Details, PDF Export, and Moon Guide.
     - **Buttons & Badges**: HeroUI `Button` with modern slate variants (`solid`, `flat`, `bordered`), and HeroUI `Badge`/`Chip` for holiday tags and moon phases.
4. **Theme Direction**:
   - Clean Corporate Slate: Deep slate (`#0f172a`, `#1e293b`), crisp crisp border dividers (`#e2e8f0` / `#334155`), high-legibility typographic hierarchy, supporting `Mi Sans` and `Mi Lanting` alongside modern system fonts.

---

## 2. Architecture & Component Hierarchy

```
+---------------------------------------------------------------------------------------+
|                                    DatePoint App                                      |
|  [Navbar: Brand Logo | Quick Selectors (Month/Year) | HeroUI Tabs | Actions (Print/Export)] |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  +-- HeroUI Tabs Content Area -----------------------------------------------------+  |
|  |                                                                                 |  |
|  |  [Calendar Tab]            [1=1 Print Preview Tab]        [Year / Lunar Tabs]   |  |
|  |  +----------------------+  +----------------------------+                       |  |
|  |  | Main Interactive     |  | Full-Bleed Print Sheet     |                       |  |
|  |  | Calendar Grid        |  | - Dynamic Cell Stretch     |                       |  |
|  |  | - Day Cells          |  | - Clean Month/Year Header  |                       |  |
|  |  | - Moon Phases        |  | - Zero Subtitle            |                       |  |
|  |  | - Holiday Badges     |  | - 1=1 Physical Paper Ratio |                       |  |
|  |  +----------------------+  +----------------------------+                       |  |
|  +---------------------------------------------------------------------------------+  |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|  HeroUI Overlays & Drawers:                                                           |
|  - HeroUI Sheet: Calendar Style Customizer (Sliders for Border/Radius/Opacity)        |
|  - HeroUI Modal: Day Detail & Event Management                                        |
|  - HeroUI Modal: High-Res Vector PDF Exporter                                         |
|  - HeroUI Modal: Moon Phase Astronomy Guide                                           |
+---------------------------------------------------------------------------------------+
```

---

## 3. Step-by-Step Implementation Roadmap

### Phase 1: Print Maximization & Subtitle Removal
1. **DOM Print Preview Sheet (`src/components/PrintPreviewSheet.tsx`)**:
   - Remove `<p>Republic of the Philippines • Official Calendar & Moon Phases (PHT / UTC+8)</p>`.
   - Update wrapper to full flex column (`h-full flex flex-col justify-between`).
   - Remove hardcoded minimum heights so day rows distribute evenly to 100% sheet height (`flex-1 grid grid-cols-7`).
2. **PDF Vector Generator (`src/utils/pdfExport.ts`)**:
   - Remove the subtitle text call at line 279.
   - Adjust `headerHeight` to recoup vertical space.
   - Remove the artificial ceiling `Math.min(22, availableGridHeight / totalWeeks)` and calculate `rowHeight = availableGridHeight / totalWeeks` directly so day cells expand edge-to-edge.
   - Reduce default margins to 6mm for maximized printable surface.
3. **CSS Print Rules (`src/index.css`)**:
   - Update `@page { margin: 5mm; size: auto; }` for edge-to-edge printing.

### Phase 2: HeroUI v3 Navigation & Layout Overhaul
1. **App Shell & Top Bar (`src/App.tsx`)**:
   - Replace custom tab buttons with HeroUI `Tabs` and `Tab` with custom variant styling.
   - Replace year/month quick controls with HeroUI `Select` or HeroUI button groups.
   - Implement HeroUI `Button` with clean slate styling (`variant="flat"`, `color="default"`).
2. **HeroUI Sheet Customizer (`src/components/CalendarCustomizer.tsx`)**:
   - Refactor the customizer into a HeroUI `Drawer` / `Sheet` component anchored to the side with backdrop blur.
   - Replace HTML range sliders with HeroUI `Slider` components with numerical value tooltips, step increments, and marks for:
     - Border Radius (`0px` to `24px`)
     - Border Width (`1px` to `4px`)
     - Font Weight (`300` to `900`)
     - Header Image Opacity (`10%` to `100%`)
   - Replace native selects with HeroUI `Select` for font family (including `Mi Sans` and `Mi Lanting`), month/year alignment, and paper orientation.

### Phase 3: HeroUI v3 Modals & Overlays
1. **Day Detail & Event Editor (`src/components/DayDetailModal.tsx`)**:
   - Migrate to HeroUI `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`.
   - Incorporate HeroUI `Input`, `Textarea`, `Chip` for categories.
2. **PDF Export Dialog (`src/components/ExportModal.tsx`)**:
   - Migrate to HeroUI `Modal` with quick paper size selector and high-DPI options.
3. **Astronomy Guide Modal (`src/components/LunarGuideModal.tsx`)**:
   - Migrate to HeroUI `Modal` with clean card grid.

### Phase 4: Verification & Visual Testing
1. **Unit Tests**:
   - Run `npx --yes tsx --test src/utils/calendar.test.ts` to ensure calendar date mathematics and lunar phases remain 100% intact.
2. **Codebase Quality**:
   - Run `lint_applet` and `compile_applet` for TypeScript type-checking and bundling.
3. **Visual Verification (Playwright CLI)**:
   - Launch browser, inspect the calendar view and 1=1 print preview sheet.
   - Confirm subtitle is gone, cells stretch to 100% height, and HeroUI v3 controls operate smoothly.

---

## 4. Acceptance Criteria
- [x] Subtitle `"Republic of the Philippines • Official Calendar & Moon Phases (PHT / UTC+8)"` completely removed.
- [x] Print preview and PDF export maximize paper with edge-to-edge dynamic cell stretching.
- [x] All primary UI controls (Tabs, Drawer/Sheet, Sliders, Modals, Buttons) strictly use HeroUI v3.
- [x] `Mi Sans` and `Mi Lanting` fonts remain fully selectable and interactive with live preview.
- [x] Zero compilation errors, zero lint warnings, and 100% test pass rate.
