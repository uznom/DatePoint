import React, { useState } from 'react';
import { HolidayItem, MoonPhaseInfo, UserEvent } from '../types';
import { MoonIcon } from './MoonIcon';
import { 
  Button, 
  ButtonGroup,
  Card, 
  Chip, 
  Input, 
  Label,
  ListBox,
  Modal,
  Select,
  Separator,
  TextArea, 
  TextField
} from '@heroui/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Anchor,
  Star,
  MapPin
} from 'lucide-react';

interface DayDetailModalProps {
  dateStr: string; // YYYY-MM-DD
  moon?: MoonPhaseInfo;
  moonInfo?: MoonPhaseInfo;
  holidays: HolidayItem[];
  events: UserEvent[];
  onClose: () => void;
  onAddEvent: (event: Omit<UserEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onNavigateDate?: (newDateStr: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dateStr,
  moon: propMoon,
  moonInfo,
  holidays,
  events,
  onClose,
  onAddEvent,
  onDeleteEvent,
  onNavigateDate,
}) => {
  const moon = (moonInfo || propMoon)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<UserEvent['category']>('fiesta');
  const [newEventNotes, setNewEventNotes] = useState('');

  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedLongDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      title: newEventTitle.trim(),
      date: dateStr,
      time: newEventTime || undefined,
      category: newEventCategory,
      notes: newEventNotes.trim() || undefined,
    });

    setNewEventTitle('');
    setNewEventTime('');
    setNewEventNotes('');
    setShowAddForm(false);
  };

  const shiftDay = (days: number) => {
    if (!onNavigateDate) return;
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, '0');
    const newD = String(d.getDate()).padStart(2, '0');
    onNavigateDate(`${newY}-${newM}-${newD}`);
  };

  return (
    <Modal.Backdrop
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      variant="transparent"
      isDismissable
    >
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog className="print:hidden">
          <Modal.CloseTrigger aria-label="Close dialog" onPress={onClose} />
          <Modal.Header className="flex flex-row items-center justify-between pr-8">
            <div>
              <Modal.Heading>{formattedLongDate}</Modal.Heading>
              <p className="text-xs text-muted mt-0.5">
                DatePoint Calendar System
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateDate && (
                <ButtonGroup size="sm" variant="secondary">
                  <Button
                    isIconOnly
                    onPress={() => shiftDay(-1)}
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    isIconOnly
                    onPress={() => shiftDay(1)}
                    aria-label="Next day"
                  >
                    <ButtonGroup.Separator />
                    <ChevronRight className="size-4" />
                  </Button>
                </ButtonGroup>
              )}
            </div>
          </Modal.Header>

            <Modal.Body className="space-y-4 pt-2">
              {/* Lunar Phase Card */}
              <Card variant="secondary">
                <Card.Content className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-2xl bg-surface shrink-0 shadow-field">
                      <MoonIcon
                        category={moon.category}
                        illuminationPct={moon.illuminationPct}
                        elongationDeg={moon.elongationDeg}
                        size={42}
                        showGlow={true}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Chip size="sm" variant="soft" color="warning">
                          {moon.majorPhaseLabel ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="size-3 fill-current shrink-0" />
                              <span>{moon.majorPhaseLabel}</span>
                            </span>
                          ) : (
                            moon.phaseName
                          )}
                        </Chip>
                        <Chip size="sm" variant="soft" color="accent" className="font-mono tabular-nums">
                          {moon.illuminationPct}% Illumination
                        </Chip>
                      </div>

                      <h3 className="text-base font-semibold text-foreground mt-1">
                        {moon.phaseName}
                      </h3>

                      <p className="text-xs text-muted mt-0.5 font-mono tabular-nums">
                        Lunar Age: {moon.ageInDays.toFixed(1)} days of synodic cycle
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-2 text-xs text-muted">
                    <Anchor className="size-4 text-accent shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-foreground">Maritime Tides & Agriculture:</strong> {moon.farmingFishingSignificance}
                    </p>
                  </div>
                </Card.Content>
              </Card>

              <Separator />

              {/* Philippine Holidays Section */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Flag className="size-3.5 text-danger" />
                  <span>Philippine Observances & Holidays ({holidays.length})</span>
                </div>

                {holidays.length === 0 ? (
                  <Card variant="secondary">
                    <Card.Content>
                      <p className="text-xs text-muted">
                        No official regular or special non-working public holiday on this date.
                      </p>
                    </Card.Content>
                  </Card>
                ) : (
                  <div className="space-y-2.5">
                    {holidays.map((h) => (
                      <Card key={h.id} variant="secondary">
                        <Card.Header className="flex-row items-center justify-between gap-2 flex-wrap">
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
                              ? 'Regular Public Holiday (200% Pay Rate)'
                              : h.type === 'special-non-working'
                              ? 'Special Non-Working Day (130% Pay Rate)'
                              : 'Cultural Festival & Observance'}
                          </Chip>
                          {h.region && (
                            <span className="text-xs text-muted flex items-center gap-1">
                              <MapPin className="size-3.5 shrink-0" />
                              <span>{h.region}</span>
                            </span>
                          )}
                        </Card.Header>
                        <Card.Content>
                          <Card.Title>{h.name}</Card.Title>
                          <Card.Description>{h.description}</Card.Description>
                        </Card.Content>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* User Planned Events & Activities */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-accent" />
                    <span>Personal & Community Schedule ({events.length})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => setShowAddForm(!showAddForm)}
                  >
                    <Plus className="size-4" />
                    <span>Add Event</span>
                  </Button>
                </div>

                {showAddForm && (
                  <Card variant="secondary">
                    <Card.Content>
                      <form onSubmit={handleCreateEvent} className="space-y-3">
                        <TextField
                          fullWidth
                          isRequired
                          value={newEventTitle}
                          onChange={setNewEventTitle}
                        >
                          <Label>Event Title</Label>
                          <Input placeholder="e.g. Executive Planning, Community Festival" />
                        </TextField>

                        <div className="grid grid-cols-2 gap-3">
                          <TextField
                            fullWidth
                            value={newEventTime}
                            onChange={setNewEventTime}
                          >
                            <Label>Time (Optional)</Label>
                            <Input type="time" />
                          </TextField>

                          <Select
                            fullWidth
                            selectedKey={newEventCategory}
                            onSelectionChange={(k) => {
                              if (k) setNewEventCategory(k as UserEvent['category']);
                            }}
                          >
                            <Label>Category</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                <ListBox.Item id="meeting" textValue="Business / Meeting">
                                  Business / Meeting
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="fiesta" textValue="Festival / Celebration">
                                  Festival / Celebration
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="family" textValue="Family Gathering">
                                  Family Gathering
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="lunar-ritual" textValue="Maritime / Lunar Activity">
                                  Maritime / Lunar Activity
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="travel" textValue="Travel & Tour">
                                  Travel & Tour
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="other" textValue="General">
                                  General
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        </div>

                        <TextField
                          fullWidth
                          value={newEventNotes}
                          onChange={setNewEventNotes}
                        >
                          <Label>Notes</Label>
                          <TextArea rows={2} placeholder="Additional notes or agenda items..." />
                        </TextField>

                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => setShowAddForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            variant="primary"
                          >
                            Save Event
                          </Button>
                        </div>
                      </form>
                    </Card.Content>
                  </Card>
                )}

                {events.length === 0 && !showAddForm ? (
                  <Card variant="secondary">
                    <Card.Content>
                      <p className="text-xs text-muted">
                        No personal events scheduled for this day. Click &ldquo;Add Event&rdquo; to schedule personal or business milestones.
                      </p>
                    </Card.Content>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {events.map((ev) => (
                      <Card key={ev.id} variant="secondary">
                        <Card.Content className="flex flex-row items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Chip size="sm" variant="soft" color="accent" className="uppercase">
                                {ev.category}
                              </Chip>
                              {ev.time && (
                                <span className="text-xs text-muted flex items-center gap-1 tabular-nums">
                                  <Clock className="size-3.5" />
                                  {ev.time}
                                </span>
                              )}
                            </div>
                            <Card.Title className="mt-1">{ev.title}</Card.Title>
                            {ev.notes && (
                              <Card.Description>{ev.notes}</Card.Description>
                            )}
                          </div>

                          <Button
                            size="sm"
                            isIconOnly
                            variant="danger-soft"
                            onPress={() => onDeleteEvent(ev.id)}
                            aria-label="Delete event"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </Card.Content>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Modal.Body>

            <Modal.Footer className="justify-between">
              <span className="text-xs text-muted">
                Printable PDF & Wall Calendar Format Available
              </span>
              <Button variant="primary" onPress={onClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
  );
};
