import React, { useState } from 'react';
import { AdvertConfig, CalendarStyleConfig } from '../types';
import { getFontFamilyCss, getFontWeightCss } from '../utils/stylePresets';
import { Button, Card, Input, Label, Separator, TextField } from '@heroui/react';
import { 
  Phone, 
  MapPin, 
  Globe, 
  Sliders, 
  Check
} from 'lucide-react';

interface AdvertHeaderProps {
  config: AdvertConfig;
  onChange: (newConfig: AdvertConfig) => void;
  styleConfig?: CalendarStyleConfig;
  onStyleChange?: (newStyle: CalendarStyleConfig) => void;
  isCustomizing?: boolean;
  onCloseCustomize?: () => void;
}

export const PRESET_SPONSORS: Array<{ name: string; config: Partial<AdvertConfig> }> = [
  {
    name: 'General Merchandise & Trading',
    config: {
      theme: 'classic-ph',
      businessName: 'MABUHAY TRADING & GENERAL MERCHANDISE',
      tagline: 'Premium Goods & Quality Supplies • Trusted by Communities Nationwide Since 1988',
      hotline: '+63 (2) 8876-5432 / +63 917 555 1234',
      address: '143 Rizal Avenue, Sta. Cruz, Manila, Philippines',
      website: 'www.mabuhaymerchandise.com.ph',
      promoBadge: 'OFFICIAL SPONSOR 2026',
    },
  },
  {
    name: 'Barangay & Civic Government',
    config: {
      theme: 'classic-ph',
      businessName: 'BARANGAY SAN ISIDRO CIVIC GOVERNMENT',
      tagline: 'Committed to Dedicated Public Service, Integrity & Sustainable Community Progress',
      hotline: 'Hotline: (049) 501-2026 • Emergency: 911',
      address: 'Barangay Hall Complex, San Isidro, Laguna, Philippines',
      website: 'www.sanisidro-civic.gov.ph',
      promoBadge: 'CIVIC PARTNER',
    },
  },
  {
    name: 'Marine, Aquaculture & Agriculture Supply',
    config: {
      theme: 'modern-gradient',
      businessName: 'ISLA AGRI-AQUA & MARINE ENTERPRISES',
      tagline: 'Supporting Coastal Fisherfolk & Farmers with High-Grade Equipment Across Every Tide',
      hotline: '+63 928 888 7766 • (032) 412-9870',
      address: 'Port Area Boulevard, Cebu City & Iloilo Port Branches',
      website: 'www.isla-agriaqua.ph',
      promoBadge: 'MARITIME PARTNER',
    },
  },
  {
    name: 'Travel, Logistics & Cultural Expeditions',
    config: {
      theme: 'dark-luxury',
      businessName: 'PHILIPPINES VOYAGES & LOGISTICS CORP.',
      tagline: 'Discover the Archipelago • Eco-Tourism, Cultural Heritage & Island Logistics',
      hotline: '+63 918 900 8822 • info@philippinesvoyages.com',
      address: 'Bonifacio Global City, Taguig City, Metro Manila',
      website: 'www.philippinesvoyages.com',
      promoBadge: 'HERITAGE PARTNER',
    },
  },
];

export const AdvertHeader: React.FC<AdvertHeaderProps> = ({ 
  config, 
  onChange,
  styleConfig,
  isCustomizing = false,
  onCloseCustomize,
}) => {
  const [tempConfig, setTempConfig] = useState<AdvertConfig>(config);

  const handleSave = () => {
    onChange(tempConfig);
    if (onCloseCustomize) onCloseCustomize();
  };

  const applyPreset = (presetConfig: Partial<AdvertConfig>) => {
    const updated = { ...tempConfig, ...presetConfig };
    setTempConfig(updated);
    onChange(updated);
  };

  if (!config.enabled && !isCustomizing) {
    return null;
  }

  // Determine dynamic styles
  const showHeaderAccent = styleConfig?.showHeaderAccent !== false;
  const headerBg = styleConfig 
    ? `linear-gradient(135deg, ${styleConfig.headerBgColor} 0%, ${styleConfig.headerGradientEnd} 100%)`
    : undefined;
  const headerTextColor = styleConfig?.headerTextColor || '#ffffff';
  const headerAccentColor = showHeaderAccent
    ? (styleConfig?.headerAccentColor || '#fde047')
    : headerTextColor;
  const borderRadius = styleConfig ? `${styleConfig.borderRadius}px` : '16px';
  const borderWidth = showHeaderAccent
    ? (styleConfig ? `${styleConfig.headerBorderWidth}px` : '1px')
    : '0px';
  const borderColor = showHeaderAccent
    ? (styleConfig?.headerAccentColor || '#eab308')
    : 'transparent';
  const fontFamily = styleConfig ? getFontFamilyCss(styleConfig.fontFamily) : getFontFamilyCss('space-grotesk');
  const fontWeight = styleConfig ? getFontWeightCss(styleConfig.fontWeight) : 800;

  const headerImage = styleConfig?.headerImage;
  const hasImage = headerImage?.enabled && headerImage?.url;

  return (
    <div className="mb-6">
      {/* Sponsor Banner with Live Customizable Styles */}
      <div
        className="transition-all overflow-hidden shadow-surface relative"
        style={{
          background: headerBg,
          color: headerTextColor,
          borderRadius,
          borderWidth,
          borderStyle: 'solid',
          borderColor,
          fontFamily,
        }}
      >
        {/* Background Watermark or Banner BG if enabled */}
        {hasImage && headerImage.placement === 'center-watermark' && (
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
            style={{ opacity: (headerImage.opacity || 20) / 100 }}
          >
            <img 
              src={headerImage.url} 
              alt="Watermark" 
              className="max-h-full max-w-[50%] object-contain filter grayscale brightness-125"
            />
          </div>
        )}

        {hasImage && headerImage.placement === 'banner-bg' && (
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ opacity: (headerImage.opacity || 30) / 100 }}
          >
            <img 
              src={headerImage.url} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Container */}
        <div className="p-4 sm:p-5 md:px-7 md:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          {/* Left: Sponsor Branding & Optional Left Logo */}
          <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
            {hasImage && headerImage.placement === 'left' && (
              <div 
                className={`shrink-0 overflow-hidden bg-white/10 backdrop-blur-xs flex items-center justify-center p-1 border border-white/20 shadow-xs ${
                  headerImage.shape === 'circle' ? 'rounded-full' :
                  headerImage.shape === 'rounded' ? 'rounded-xl' : 'rounded-xs'
                }`}
                style={{
                  width: headerImage.size === 'small' ? '42px' : headerImage.size === 'large' ? '68px' : '54px',
                  height: headerImage.size === 'small' ? '42px' : headerImage.size === 'large' ? '68px' : '54px',
                  opacity: (headerImage.opacity ?? 100) / 100,
                }}
              >
                <img 
                  src={headerImage.url} 
                  alt="Sponsor Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 
                className="text-lg sm:text-xl md:text-2xl tracking-tight uppercase leading-snug drop-shadow-xs text-balance"
                style={{ fontWeight }}
              >
                {config.businessName}
              </h2>

              <p 
                className="text-xs sm:text-sm font-medium mt-1 max-w-2xl leading-relaxed text-balance"
                style={{ color: headerAccentColor, opacity: 0.95 }}
              >
                {config.tagline}
              </p>
            </div>
          </div>

          {/* Right: Contact details & Optional Right Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <div 
              className="flex flex-col sm:flex-row md:flex-col gap-1.5 text-xs pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-white/20 md:pl-6 opacity-95"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: headerAccentColor }} />
                <span className="font-semibold tabular-nums">{config.hotline}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: headerAccentColor }} />
                <span className="truncate max-w-[260px]">{config.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: headerAccentColor }} />
                <span className="font-mono text-[11px]">{config.website}</span>
              </div>
            </div>

            {hasImage && headerImage.placement === 'right' && (
              <div 
                className={`flex shrink-0 overflow-hidden bg-white/10 backdrop-blur-xs items-center justify-center p-1 border border-white/20 shadow-xs ${
                  headerImage.shape === 'circle' ? 'rounded-full' :
                  headerImage.shape === 'rounded' ? 'rounded-xl' : 'rounded-xs'
                }`}
                style={{
                  width: headerImage.size === 'small' ? '42px' : headerImage.size === 'large' ? '68px' : '54px',
                  height: headerImage.size === 'small' ? '42px' : headerImage.size === 'large' ? '68px' : '54px',
                  opacity: (headerImage.opacity ?? 100) / 100,
                }}
              >
                <img 
                  src={headerImage.url} 
                  alt="Sponsor Logo Right" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1:1 HeroUI v3 Card & TextField Customization Panel */}
      {isCustomizing && (
        <Card variant="default" className="mt-3 print:hidden">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Sliders className="size-4 text-accent shrink-0" />
              <span>Customize Sponsor Content & Details</span>
            </Card.Title>
            <Card.Description>
              Update business name, contact info, and hotline for online view and 1=1 printable wall calendar.
            </Card.Description>
          </Card.Header>

          <Separator />

          <Card.Content className="space-y-4">
            <div className="space-y-2">
              <Label>Quick Sponsor Presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_SPONSORS.map((p, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="secondary"
                    onPress={() => applyPreset(p.config)}
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <TextField
                fullWidth
                value={tempConfig.businessName}
                onChange={(v) => setTempConfig({ ...tempConfig, businessName: v })}
              >
                <Label>Business / Organization Name</Label>
                <Input placeholder="e.g. Mabuhay Store" />
              </TextField>

              <TextField
                fullWidth
                value={tempConfig.hotline}
                onChange={(v) => setTempConfig({ ...tempConfig, hotline: v })}
              >
                <Label>Contact Hotline / Mobile</Label>
                <Input placeholder="e.g. +63 917 123 4567" />
              </TextField>

              <TextField
                fullWidth
                value={tempConfig.website}
                onChange={(v) => setTempConfig({ ...tempConfig, website: v })}
              >
                <Label>Website or Social Page</Label>
                <Input placeholder="e.g. www.mabuhaymerchandise.com.ph" />
              </TextField>

              <TextField
                fullWidth
                className="sm:col-span-2"
                value={tempConfig.tagline}
                onChange={(v) => setTempConfig({ ...tempConfig, tagline: v })}
              >
                <Label>Tagline / Slogan / Greetings</Label>
                <Input placeholder="e.g. Trusted by Communities Nationwide" />
              </TextField>

              <TextField
                fullWidth
                className="sm:col-span-2 lg:col-span-1"
                value={tempConfig.address}
                onChange={(v) => setTempConfig({ ...tempConfig, address: v })}
              >
                <Label>Complete Business Address</Label>
                <Input placeholder="e.g. 143 Rizal Avenue, Sta. Cruz, Manila" />
              </TextField>
            </div>
          </Card.Content>

          <Separator />

          <Card.Footer className="justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onPress={() => {
                setTempConfig(config);
                if (onCloseCustomize) onCloseCustomize();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onPress={handleSave}
            >
              <Check className="size-4" />
              <span>Save & Apply</span>
            </Button>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
};
