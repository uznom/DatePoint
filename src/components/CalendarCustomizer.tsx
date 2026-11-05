import React, { useRef } from 'react';
import { 
  CalendarStyleConfig, 
  FontFamilyOption, 
  FontWeightOption, 
  HeaderImagePlacement, 
  TitleAlignment 
} from '../types';
import { 
  EMBLEM_PRESETS, 
  DEFAULT_STYLE_CONFIG 
} from '../utils/stylePresets';
import { 
  Button, 
  Card, 
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Drawer,
  Input,
  Label,
  ListBox,
  Separator, 
  Slider, 
  Surface, 
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  parseColor
} from '@heroui/react';
import { 
  Palette, 
  Type, 
  Square, 
  Sliders, 
  Upload, 
  RotateCcw, 
  Check, 
  Image as ImageIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Columns2
} from 'lucide-react';

interface CalendarCustomizerProps {
  styleConfig: CalendarStyleConfig;
  onChange: (newConfig: CalendarStyleConfig) => void;
  onClose: () => void;
}

const FONT_OPTIONS: Array<{ id: FontFamilyOption; name: string; preview: string }> = [
  { id: 'mi-sans', name: 'Mi Sans', preview: "'MiSans VF', 'MiSans', sans-serif" },
  { id: 'mi-lanting', name: 'Mi Lanting', preview: "'MI LANTING', 'Mi Lanting', sans-serif" },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', preview: "'Plus Jakarta Sans', sans-serif" },
  { id: 'space-grotesk', name: 'Space Grotesk', preview: "'Space Grotesk', sans-serif" },
  { id: 'cinzel', name: 'Cinzel Serif', preview: "'Cinzel', serif" },
  { id: 'playfair', name: 'Playfair Display', preview: "'Playfair Display', serif" },
  { id: 'inter', name: 'Inter Clean', preview: "'Inter', sans-serif" },
  { id: 'roboto-mono', name: 'Roboto Mono', preview: "'Roboto Mono', monospace" },
];

const DEFAULT_COLOR_SWATCHES = [
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

interface HeroColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  swatches?: string[];
}

const HeroColorPickerField: React.FC<HeroColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  swatches = DEFAULT_COLOR_SWATCHES,
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
              aria-label={`${label} color presets`}
              size="xs"
              className="justify-center flex-wrap"
            >
              {swatches.map((hex) => (
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

export const CalendarCustomizer: React.FC<CalendarCustomizerProps> = ({
  styleConfig,
  onChange,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<CalendarStyleConfig>) => {
    onChange({ ...styleConfig, ...patch });
  };

  const updateImage = (patch: Partial<CalendarStyleConfig['headerImage']>) => {
    onChange({
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

  return (
    <Drawer.Backdrop
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      variant="transparent"
      isDismissable
    >
      <Drawer.Content placement="right">
        <Drawer.Dialog className="w-full max-w-md print:hidden">
          <Drawer.CloseTrigger aria-label="Close customizer" onPress={onClose} />
          <Drawer.Header className="flex flex-row items-start justify-between pr-8">
            <div>
              <Drawer.Heading className="flex items-center gap-2">
                <Sliders className="size-4 text-accent" />
                <span>Calendar Style Customizer</span>
              </Drawer.Heading>
              <p className="text-xs text-muted mt-0.5">
                Real-time live preview for screen and 1=1 print layout.
              </p>
            </div>
            <Button
              size="sm"
              isIconOnly
              variant="tertiary"
              onPress={() => onChange(DEFAULT_STYLE_CONFIG)}
              aria-label="Reset to default styles"
            >
              <RotateCcw className="size-4" />
            </Button>
          </Drawer.Header>

          <Drawer.Body className="space-y-5 pt-2">
            {/* 1. Typography & Font Style */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                <Type className="size-3.5 text-accent" />
                <span>Typography & Font Style</span>
              </div>

              <div className="space-y-1.5">
                <Label>Font Family</Label>
                <Surface variant="secondary" className="rounded-2xl p-1">
                  <ListBox
                    aria-label="Font Family"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={new Set([styleConfig.fontFamily])}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as FontFamilyOption | undefined;
                      if (selected) update({ fontFamily: selected });
                    }}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <ListBox.Item
                        key={f.id}
                        id={f.id}
                        textValue={f.name}
                        style={{ fontFamily: f.preview }}
                      >
                        <span className="text-sm font-medium text-foreground">{f.name}</span>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Surface>
              </div>

              <div className="space-y-1.5">
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
                    if (selected) update({ dateFontWeight: selected });
                  }}
                >
                  {(['normal', 'medium', 'semibold', 'bold', 'black'] as FontWeightOption[]).map((w, idx) => (
                    <ToggleButton key={w} id={w} className="capitalize text-xs px-2">
                      {idx > 0 && <ToggleButtonGroup.Separator />}
                      {w}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>

              <div className="space-y-1.5">
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
                    if (selected) update({ fontWeight: selected });
                  }}
                >
                  {(['normal', 'medium', 'semibold', 'bold', 'black'] as FontWeightOption[]).map((w, idx) => (
                    <ToggleButton key={w} id={w} className="capitalize text-xs px-2">
                      {idx > 0 && <ToggleButtonGroup.Separator />}
                      {w}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>

              <div className="space-y-1.5">
                <Label>Date Number Scale</Label>
                <ToggleButtonGroup
                  aria-label="Date Number Scale"
                  selectionMode="single"
                  disallowEmptySelection
                  fullWidth
                  size="sm"
                  selectedKeys={new Set([styleConfig.dateNumberSize || 'md'])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as 'sm' | 'md' | 'lg' | 'xl' | undefined;
                    if (selected) update({ dateNumberSize: selected });
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

            {/* 2. Month & Year Title Alignment & Color */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                <AlignCenter className="size-3.5 text-accent" />
                <span>Month & Year Title</span>
              </div>

              <ToggleButtonGroup
                aria-label="Month & Year Title Alignment"
                selectionMode="single"
                disallowEmptySelection
                fullWidth
                size="sm"
                selectedKeys={new Set([styleConfig.monthYearAlignment])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as TitleAlignment | undefined;
                  if (selected) update({ monthYearAlignment: selected });
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
                    <ToggleButton key={al.id} id={al.id} className="text-xs px-2">
                      {idx > 0 && <ToggleButtonGroup.Separator />}
                      <Icon className="size-3.5" />
                      <span>{al.label}</span>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>

              <HeroColorPickerField
                label="Month & Year Title Color"
                value={styleConfig.titleTextColor || '#09090b'}
                onChange={(hex) => update({ titleTextColor: hex })}
              />
            </div>

            <Separator />

            {/* 3. Borders & Corner Geometry */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                <Square className="size-3.5 text-accent" />
                <span>Borders & Corner Geometry</span>
              </div>

              {/* Corner Radius with 1:1 HeroUI Slider */}
              <div className="space-y-2">
                <Slider
                  value={styleConfig.borderRadius}
                  onChange={(v) => update({ borderRadius: typeof v === 'number' ? v : v[0] })}
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
                    if (selected !== undefined) update({ borderRadius: Number(selected) });
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

              {/* Grid Border Width with 1:1 HeroUI Slider */}
              <div className="space-y-2">
                <Slider
                  value={styleConfig.borderWidth}
                  onChange={(v) => update({ borderWidth: typeof v === 'number' ? v : v[0] })}
                  minValue={1}
                  maxValue={4}
                  step={1}
                >
                  <Label>Grid Border Width</Label>
                  <Slider.Output>{({ state }) => `${state.values[0]}px`}</Slider.Output>
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>

                <ToggleButtonGroup
                  aria-label="Quick Grid Border Width"
                  selectionMode="single"
                  fullWidth
                  size="sm"
                  selectedKeys={new Set([String(styleConfig.borderWidth)])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    if (selected !== undefined) update({ borderWidth: Number(selected) });
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

              {/* Border Frame Color via 1:1 HeroUI ColorPicker */}
              <HeroColorPickerField
                label="Border Frame Color"
                value={styleConfig.borderColor}
                onChange={(hex) => update({ borderColor: hex })}
              />
            </div>

            <Separator />

            {/* 4. Header Colors & Banner Style */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                <Palette className="size-3.5 text-accent" />
                <span>Header Colors & Banner Style</span>
              </div>

              <div className="space-y-2">
                <HeroColorPickerField
                  label="Header Start Color"
                  value={styleConfig.headerBgColor}
                  onChange={(hex) => update({ headerBgColor: hex })}
                />
                <HeroColorPickerField
                  label="Header End Color"
                  value={styleConfig.headerGradientEnd}
                  onChange={(hex) => update({ headerGradientEnd: hex })}
                />
                <HeroColorPickerField
                  label="Header Text Color"
                  value={styleConfig.headerTextColor}
                  onChange={(hex) => update({ headerTextColor: hex })}
                />

                <Surface variant="secondary" className="rounded-2xl px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {styleConfig.showHeaderAccent !== false ? (
                        <ColorPicker
                          value={safeParseColor(styleConfig.headerAccentColor)}
                          onChange={(color) => update({ headerAccentColor: color.toString('hex') })}
                        >
                          <ColorPicker.Trigger aria-label="Header Accent & Border Color">
                            <ColorSwatch size="sm" shape="circle" />
                            <Label>Header Accent & Border Color</Label>
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
                            <ColorSwatchPicker
                              aria-label="Header Accent & Border Color presets"
                              size="xs"
                              className="justify-center flex-wrap"
                            >
                              {DEFAULT_COLOR_SWATCHES.map((hex) => (
                                <ColorSwatchPicker.Item key={hex} color={hex}>
                                  <ColorSwatchPicker.Swatch />
                                  <ColorSwatchPicker.Indicator />
                                </ColorSwatchPicker.Item>
                              ))}
                            </ColorSwatchPicker>
                          </ColorPicker.Popover>
                        </ColorPicker>
                      ) : (
                        <span className="text-sm font-medium text-muted">
                          Header Accent & Border Color (Off)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {styleConfig.showHeaderAccent !== false && (
                        <span className="font-mono text-xs text-muted uppercase">
                          {safeParseColor(styleConfig.headerAccentColor).toString('hex')}
                        </span>
                      )}
                      <Switch
                        size="sm"
                        isSelected={styleConfig.showHeaderAccent !== false}
                        onChange={(checked) => update({ showHeaderAccent: checked })}
                        aria-label="Toggle Header Accent & Border Color"
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Label className="text-xs">{styleConfig.showHeaderAccent !== false ? 'On' : 'Off'}</Label>
                        </Switch.Content>
                      </Switch>
                    </div>
                  </div>
                </Surface>
              </div>
            </div>

            <Separator />

            {/* 5. Header Image & Sponsor Logo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                  <ImageIcon className="size-3.5 text-accent" />
                  <span>Header Image & Logo</span>
                </div>
                <Switch
                  size="sm"
                  isSelected={styleConfig.headerImage.enabled}
                  onChange={(checked) => updateImage({ enabled: checked })}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label>Enable Image</Label>
                  </Switch.Content>
                </Switch>
              </div>

              {styleConfig.headerImage.enabled && (
                <Card variant="secondary">
                  <Card.Content className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Surface
                        variant="default"
                        className="size-14 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-field"
                      >
                        {styleConfig.headerImage.url ? (
                          <img
                            src={styleConfig.headerImage.url}
                            alt="Logo Preview"
                            className="size-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="size-6 text-muted" />
                        )}
                      </Surface>

                      <div className="flex-1 space-y-1">
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
                          <Upload className="size-4" />
                          <span>Upload Logo / Image</span>
                        </Button>
                        <p className="text-xs text-muted">
                          PNG, SVG, JPG, WebP supported.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Commercial Emblem Presets</Label>
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
                            <img src={emb.dataUrl} alt={emb.name} className="size-5 object-contain" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Image Placement on Header</Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'left', label: 'Left of Name' },
                          { id: 'right', label: 'Right (Hotline)' },
                          { id: 'center-watermark', label: 'Center Watermark' },
                          { id: 'banner-bg', label: 'Full Banner BG' },
                        ].map((pl) => (
                          <Button
                            key={pl.id}
                            size="sm"
                            variant={styleConfig.headerImage.placement === pl.id ? 'primary' : 'secondary'}
                            onPress={() => updateImage({ placement: pl.id as HeaderImagePlacement })}
                            className="w-full text-xs"
                          >
                            {pl.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Logo Shape</Label>
                        <ToggleButtonGroup
                          aria-label="Logo Shape"
                          selectionMode="single"
                          disallowEmptySelection
                          fullWidth
                          size="sm"
                          selectedKeys={new Set([styleConfig.headerImage.shape])}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as 'circle' | 'rounded' | 'square' | undefined;
                            if (selected) updateImage({ shape: selected });
                          }}
                        >
                          {(['circle', 'rounded', 'square'] as const).map((sh, idx) => (
                            <ToggleButton key={sh} id={sh} className="capitalize text-xs px-1.5">
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
                            const selected = Array.from(keys)[0] as 'small' | 'medium' | 'large' | undefined;
                            if (selected) updateImage({ size: selected });
                          }}
                        >
                          {(['small', 'medium', 'large'] as const).map((sz, idx) => (
                            <ToggleButton key={sz} id={sz} className="capitalize text-xs px-1.5">
                              {idx > 0 && <ToggleButtonGroup.Separator />}
                              {sz}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </div>
                    </div>

                    <Slider
                      value={styleConfig.headerImage.opacity ?? 100}
                      onChange={(v) => updateImage({ opacity: typeof v === 'number' ? v : v[0] })}
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
                  </Card.Content>
                </Card>
              )}
            </div>

            <Separator />

            {/* 6. Grid, Sundays & Cell Colors (1:1 HeroUI ColorPicker) */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                <Palette className="size-3.5 text-accent" />
                <span>Grid, Sundays & Cell Colors</span>
              </div>

              <div className="space-y-1.5">
                <Label>Holiday Tag Style</Label>
                <ToggleButtonGroup
                  aria-label="Holiday Tag Style"
                  selectionMode="single"
                  disallowEmptySelection
                  fullWidth
                  size="sm"
                  selectedKeys={new Set([styleConfig.holidayBadgeStyle])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as CalendarStyleConfig['holidayBadgeStyle'] | undefined;
                    if (selected) update({ holidayBadgeStyle: selected });
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

              <div className="space-y-2">
                <HeroColorPickerField
                  label="Sunday / Holiday Highlight Color"
                  value={styleConfig.sundayColor}
                  onChange={(hex) => update({ sundayColor: hex })}
                />
                <HeroColorPickerField
                  label="Weekday Header Background"
                  value={styleConfig.weekdayBgColor || '#f8fafc'}
                  onChange={(hex) => update({ weekdayBgColor: hex })}
                />
                <HeroColorPickerField
                  label="Weekday Header Text Color"
                  value={styleConfig.weekdayTextColor || '#334155'}
                  onChange={(hex) => update({ weekdayTextColor: hex })}
                />
                <HeroColorPickerField
                  label="Calendar Cell Background"
                  value={styleConfig.cellBgColor || '#ffffff'}
                  onChange={(hex) => update({ cellBgColor: hex })}
                />
                <HeroColorPickerField
                  label="Day Number Text Color"
                  value={styleConfig.dayNumberColor || '#1e293b'}
                  onChange={(hex) => update({ dayNumberColor: hex })}
                />
              </div>

              <Slider
                value={styleConfig.printMargin}
                onChange={(v) => update({ printMargin: typeof v === 'number' ? v : v[0] })}
                minValue={2}
                maxValue={20}
                step={1}
              >
                <Label>Print Paper Margin (Full Bleed)</Label>
                <Slider.Output>{({ state }) => `${state.values[0]}mm`}</Slider.Output>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>

              <Card variant="secondary">
                <Card.Content className="space-y-3">
                  <div className="flex flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Moon Phases & Tides
                      </div>
                      <div className="text-xs text-muted">
                        Show daily lunar illumination and lunar key on calendar & print.
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={styleConfig.showMoonPhases !== false}
                      onChange={(checked) => update({ showMoonPhases: checked })}
                      aria-label="Toggle Moon Phases & Tides"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>

                  <Separator />

                  <div className="flex flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Official Public Holidays
                      </div>
                      <div className="text-xs text-muted">
                        Display regular and special non-working holidays on calendar.
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={styleConfig.showHolidays !== false}
                      onChange={(checked) => update({ showHolidays: checked, showCultural: checked })}
                      aria-label="Toggle Official Public Holidays"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>

                  <Separator />

                  <div className="flex flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Show Week Numbers (W1–W52)
                      </div>
                      <div className="text-xs text-muted">
                        Display ISO week numbers on each Sunday cell row.
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={Boolean(styleConfig.showWeekNumbers)}
                      onChange={(checked) => update({ showWeekNumbers: checked })}
                      aria-label="Toggle Week Numbers"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>

                  <Separator />

                  <div className="flex flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Monthly Notes & Reminders Box
                      </div>
                      <div className="text-xs text-muted">
                        Print ruled writing lines below the calendar grid.
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={Boolean(styleConfig.showMemoLines)}
                      onChange={(checked) => update({ showMemoLines: checked })}
                      aria-label="Toggle Monthly Notes Box"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>

                  <Separator />

                  <div className="flex flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Wall Calendar Hole-Punch Guide
                      </div>
                      <div className="text-xs text-muted">
                        Displays spiral binding & hole marks in 1=1 print view.
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={styleConfig.showHolePunchGuide}
                      onChange={(checked) => update({ showHolePunchGuide: checked })}
                      aria-label="Toggle wall calendar hole-punch guide"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </Drawer.Body>

          <Drawer.Footer className="justify-between">
            <span className="text-xs text-muted flex items-center gap-1.5">
              <Check className="size-4 text-success" />
              Live styles applied
            </span>
            <Button variant="primary" onPress={onClose}>
              Done Customizing
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
};
