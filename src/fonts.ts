/**
 * Self-hosted web fonts. Everything is bundled by Vite from node_modules / src/assets,
 * so the calendar (DOM, canvas preview and PDF export) never depends on a font CDN.
 * Only fonts that can be bundled this way are offered (see FONT_FAMILY_IDS in utils/stylePresets.ts).
 */

// Roboto Flex with every variable axis:
// wght, wdth, opsz, slnt, GRAD, XOPQ, XTRA, YOPQ, YTAS, YTDE, YTFI, YTLC, YTUC
import '@fontsource-variable/roboto-flex/full.css';

import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/cinzel';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/roboto-mono';

// MiSans variable (Latin subset only - the full CJK build is ~50 MB)
import 'misans/lib/Latin/MiSansLatinVF.min.css';
