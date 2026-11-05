import React from 'react';
import { getMoonPhaseForDate } from '../utils/moon';
import { MoonPhaseInfo } from '../types';
import { MoonIcon } from './MoonIcon';
import { Button, Card, Chip, Separator, Table } from '@heroui/react';
import { Moon, Waves, ArrowRight, Star } from 'lucide-react';

interface LunarCalendarViewProps {
  year: number;
  month: number;
  onSelectDate: (dateStr: string) => void;
}

export const LunarCalendarView: React.FC<LunarCalendarViewProps> = ({
  year,
  month,
  onSelectDate,
}) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthMoonPhases: MoonPhaseInfo[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    monthMoonPhases.push(getMoonPhaseForDate(dateStr));
  }

  const majorPhases = monthMoonPhases.filter((m) => m.isMajorPhase && m.majorPhaseLabel);

  return (
    <div className="space-y-5">
      {/* Major Phases Highlight Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Moon className="size-4 text-warning" />
          <span>Primary Lunar Phases This Month</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {majorPhases.map((m) => {
            const dateObj = new Date(m.date + 'T00:00:00');
            const dayFormatted = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card
                key={m.date}
                variant="default"
                onClick={() => onSelectDate(m.date)}
                className="cursor-pointer transition-all hover:shadow-overlay group"
              >
                <Card.Header className="flex-row items-center justify-between">
                  <Chip size="sm" variant="soft" color="warning">
                    <Star className="size-3 fill-current shrink-0" />
                    <span>{m.majorPhaseLabel}</span>
                  </Chip>
                  <MoonIcon
                    category={m.category}
                    illuminationPct={m.illuminationPct}
                    elongationDeg={m.elongationDeg}
                    size={24}
                    showGlow={m.majorPhaseLabel === 'Full Moon'}
                  />
                </Card.Header>

                <Card.Content>
                  <Card.Title className="group-hover:text-accent transition-colors">
                    {dayFormatted}
                  </Card.Title>
                  <Card.Description>
                    {m.phaseName}
                  </Card.Description>
                </Card.Content>

                <Separator />

                <Card.Footer className="justify-between text-xs text-muted">
                  <span className="tabular-nums font-mono">{m.illuminationPct}% Illumination</span>
                  <span className="flex items-center gap-1 text-accent font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Details</span>
                    <ArrowRight className="size-3.5" />
                  </span>
                </Card.Footer>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Complete Daily Lunar Progression Table using 1:1 HeroUI v3 Table */}
      <Card variant="default">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Waves className="size-4 text-accent" />
            <span>Complete Daily Astronomical Lunar Schedule & Maritime Tides</span>
          </Card.Title>
        </Card.Header>

        <Card.Content>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Complete Daily Astronomical Lunar Schedule">
                <Table.Header>
                  <Table.Column isRowHeader>Date</Table.Column>
                  <Table.Column>Phase Icon</Table.Column>
                  <Table.Column>Lunar Phase</Table.Column>
                  <Table.Column>Illumination</Table.Column>
                  <Table.Column>Lunar Age</Table.Column>
                  <Table.Column>Maritime & Agricultural Guidance</Table.Column>
                  <Table.Column className="text-end">Action</Table.Column>
                </Table.Header>
                <Table.Body>
                  {monthMoonPhases.map((m) => {
                    const dateObj = new Date(m.date + 'T00:00:00');
                    const dayFormatted = dateObj.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <Table.Row key={m.date} id={m.date}>
                        <Table.Cell className="whitespace-nowrap tabular-nums font-medium">
                          {dayFormatted}
                        </Table.Cell>
                        <Table.Cell>
                          <MoonIcon
                            category={m.category}
                            illuminationPct={m.illuminationPct}
                            elongationDeg={m.elongationDeg}
                            size={20}
                            showGlow={m.majorPhaseLabel === 'Full Moon'}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{m.phaseName}</span>
                            {m.isMajorPhase && m.majorPhaseLabel && (
                              <Chip size="sm" variant="soft" color="warning">
                                {m.majorPhaseLabel}
                              </Chip>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="font-mono tabular-nums">
                          {m.illuminationPct}%
                        </Table.Cell>
                        <Table.Cell className="font-mono tabular-nums text-muted">
                          {m.ageInDays.toFixed(1)}d
                        </Table.Cell>
                        <Table.Cell className="text-muted max-w-sm truncate">
                          {m.farmingFishingSignificance}
                        </Table.Cell>
                        <Table.Cell className="text-end">
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => onSelectDate(m.date)}
                          >
                            Inspect
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
};
