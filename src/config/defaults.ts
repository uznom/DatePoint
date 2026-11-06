import { AdvertConfig, UserEvent } from '../types';
import { PRESET_SPONSORS } from '../components/AdvertHeader';

export const DEFAULT_ADVERT: AdvertConfig = {
  enabled: true,
  theme: 'classic-ph',
  businessName: '',
  tagline: '',
  hotline: '',
  address: '',
  website: '',
  promoBadge: '',
};

export const DEFAULT_EVENTS: UserEvent[] = [];

// Sample text that older builds used to pre-fill and persist to localStorage.
const LEGACY_SAMPLE_VALUES = new Set(
  PRESET_SPONSORS.flatMap((p) => [
    p.config.businessName,
    p.config.tagline,
    p.config.hotline,
    p.config.address,
    p.config.website,
    p.config.promoBadge,
  ]).filter((v): v is string => !!v),
);

const ADVERT_TEXT_FIELDS = ['businessName', 'tagline', 'hotline', 'address', 'website', 'promoBadge'] as const;

/** Strips legacy sample data from a persisted advert config so inputs show placeholders only. */
export function sanitizeAdvert(saved: AdvertConfig): AdvertConfig {
  const result: AdvertConfig = { ...DEFAULT_ADVERT, ...saved };
  for (const field of ADVERT_TEXT_FIELDS) {
    if (LEGACY_SAMPLE_VALUES.has(result[field])) result[field] = '';
  }
  return result;
}

/** Removes the legacy sample event that older builds persisted. */
export function sanitizeEvents(saved: UserEvent[]): UserEvent[] {
  return Array.isArray(saved) ? saved.filter((e) => e.id !== 'e1') : DEFAULT_EVENTS;
}
