import { AdvertConfig, UserEvent } from '../types';

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

export const DEFAULT_EVENTS: UserEvent[] = [
  {
    id: 'e1',
    title: 'Memorial Cemetery Family Remembrance',
    date: '2026-11-01',
    time: '08:00',
    category: 'family',
    notes: 'Annual floral offering and family reunion at memorial park.',
  },
];
