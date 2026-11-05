import React from 'react';
import { Button, Input, Label, Surface, TextField } from '@heroui/react';
import { Plus } from 'lucide-react';
import { UserEvent } from '../../types';

export interface EventFormProps {
  newEventDate: string;
  newEventTitle: string;
  onDateChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onAdd: (event: Omit<UserEvent, 'id'>) => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  newEventDate,
  newEventTitle,
  onDateChange,
  onTitleChange,
  onAdd,
}) => {
  return (
    <Surface variant="secondary" className="rounded-2xl p-3 space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-5">
          <TextField fullWidth value={newEventDate} onChange={onDateChange} aria-label="Custom Event Date">
            <Label className="text-xs">Date (YYYY-MM-DD)</Label>
            <Input type="date" />
          </TextField>
        </div>
        <div className="sm:col-span-7">
          <TextField fullWidth value={newEventTitle} onChange={onTitleChange} aria-label="Custom Event Title">
            <Label className="text-xs">Event / Birthday Label</Label>
            <Input placeholder="e.g. Company Anniversary" />
          </TextField>
        </div>
      </div>
      <Button
        size="sm"
        variant="primary"
        isDisabled={!newEventTitle.trim() || !newEventDate.trim()}
        onPress={() => {
          if (!newEventTitle.trim() || !newEventDate.trim()) return;
          onAdd({ title: newEventTitle.trim(), date: newEventDate.trim(), category: 'family' });
          onTitleChange('');
        }}
        className="w-full"
      >
        <Plus className="size-4 shrink-0" />
        <span>Add Custom Date to Calendar</span>
      </Button>
    </Surface>
  );
};
