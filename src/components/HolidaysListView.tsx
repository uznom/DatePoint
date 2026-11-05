import React, { useState } from 'react';
import { HolidayItem } from '../types';
import { 
  Card, 
  Chip, 
  SearchField, 
  Separator, 
  Tabs 
} from '@heroui/react';
import { Calendar, ChevronRight, MapPin, Globe } from 'lucide-react';

interface HolidaysListViewProps {
  holidays: HolidayItem[];
  year: number;
  onSelectDate: (dateStr: string) => void;
}

type FilterType = 'all' | 'regular' | 'special-non-working' | 'cultural';

export const HolidaysListView: React.FC<HolidaysListViewProps> = ({
  holidays,
  onSelectDate,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = holidays.filter((h) => {
    if (filterType !== 'all' && h.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1:1 HeroUI v3 Card + SearchField + Tabs Header */}
      <Card variant="default">
        <Card.Content className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* 1:1 HeroUI v3 SearchField */}
          <SearchField
            aria-label="Search Philippine Holidays"
            value={searchQuery}
            onChange={setSearchQuery}
            fullWidth
            className="flex-1"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search holiday, festival or civic observance (e.g. Rizal, Independence, Sinulog)..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          {/* 1:1 HeroUI v3 Tabs Filter */}
          <Tabs
            selectedKey={filterType}
            onSelectionChange={(k) => setFilterType(k as FilterType)}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Holiday Category Filter">
                <Tabs.Tab id="all">
                  <span>All ({holidays.length})</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="regular">
                  <Tabs.Separator />
                  <span>Regular (200%)</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="special-non-working">
                  <Tabs.Separator />
                  <span>Special (130%)</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="cultural">
                  <Tabs.Separator />
                  <span>Festivals</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </Card.Content>
      </Card>

      {/* Grid of Holidays using 1:1 HeroUI v3 Card & Chip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((h) => {
          const dateObj = new Date(h.date + 'T00:00:00');
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <Card
              key={h.id}
              variant="default"
              onClick={() => onSelectDate(h.date)}
              className="cursor-pointer transition-all hover:shadow-overlay group"
            >
              <Card.Header className="flex-row items-center justify-between gap-2">
                <Chip
                  size="sm"
                  variant="soft"
                  color={
                    h.type === 'regular'
                      ? 'danger'
                      : h.type === 'special-non-working'
                      ? 'accent'
                      : 'warning'
                  }
                >
                  {h.type === 'regular'
                    ? 'Regular Public Holiday (200% Pay)'
                    : h.type === 'special-non-working'
                    ? 'Special Non-Working Day'
                    : 'Festival & Cultural Observance'}
                </Chip>

                <span className="text-xs font-medium text-muted flex items-center gap-1 tabular-nums">
                  <Calendar className="size-3.5" />
                  {formattedDate}
                </span>
              </Card.Header>

              <Card.Content>
                <Card.Title className="group-hover:text-accent transition-colors">
                  {h.name}
                </Card.Title>
                <Card.Description>
                  {h.description}
                </Card.Description>
              </Card.Content>

              <Separator />

              <Card.Footer className="justify-between text-xs">
                <span className="text-muted flex items-center gap-1.5">
                  {h.region ? (
                    <>
                      <MapPin className="size-3.5 text-accent shrink-0" />
                      <span>{h.region}</span>
                    </>
                  ) : (
                    <>
                      <Globe className="size-3.5 text-accent shrink-0" />
                      <span>Nationwide Public Observance</span>
                    </>
                  )}
                </span>
                <span className="text-accent font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View on Calendar</span>
                  <ChevronRight className="size-3.5" />
                </span>
              </Card.Footer>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
