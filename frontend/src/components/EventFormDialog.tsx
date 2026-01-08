import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Rating,
  Typography,
  Divider,
} from '@mui/material';
import { Event, EventCreate, EventUpdate, EventType, TimeOfDay, VomitQuality, Dog, CustomEvent } from '../types';
import eventPooIcon from '../assets/event_poo.png';
import eventPooEmptyIcon from '../assets/event_poo_empty.png';
import typeVomitIcon from '../assets/type_vomit.png';
import typeScratchyIcon from '../assets/type_scratchy.png';
import typeInjuryIcon from '../assets/type_injury.png';
import typeOtherIcon from '../assets/type_other.png';
import morningIcon from '../assets/morning.png';
import afternoonIcon from '../assets/afternoon.png';
import eveningIcon from '../assets/evening.png';
import nightIcon from '../assets/night.png';
import iconOk from '../assets/icon_ok.png';
import iconCancel from '../assets/icon_cancel.png';
import dogSpinner from '../assets/dog_spinner.gif';

interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: EventCreate | EventUpdate) => Promise<void>;
  event?: Event | null;
  mode: 'create' | 'edit';
  dogs: Dog[];
  customEvents: CustomEvent[];
  defaultDogId?: string;
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  event,
  mode,
  dogs,
  customEvents,
  defaultDogId,
}) => {
  const [dogId, setDogId] = useState('');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [customEventId, setCustomEventId] = useState<string>('');
  const [selectedEventOption, setSelectedEventOption] = useState<string>(''); // Combined selector
  const [date, setDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [pooQuality, setPooQuality] = useState<number>(4);
  const [vomitQuality, setVomitQuality] = useState<VomitQuality>(VomitQuality.FOOD);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event && mode === 'edit') {
      setDogId(event.dog_id);
      if (event.event_type) {
        setEventType(event.event_type);
        setCustomEventId('');
        setSelectedEventOption(event.event_type);
      } else if (event.custom_event_id) {
        setEventType('');
        setCustomEventId(event.custom_event_id);
        setSelectedEventOption(`custom_${event.custom_event_id}`);
      }
      setDate(event.date.split('T')[0]);
      setTimeOfDay(event.time_of_day);
      setPooQuality(event.poo_quality || 4);
      setVomitQuality(event.vomit_quality || VomitQuality.FOOD);
      setNotes(event.notes || '');
    } else {
      setDogId(defaultDogId || (dogs.length > 0 ? dogs[0].id : ''));
      setEventType(EventType.POO);
      setCustomEventId('');
      setSelectedEventOption(EventType.POO);
      setDate(new Date().toISOString().split('T')[0]);
      setTimeOfDay(TimeOfDay.MORNING);
      setPooQuality(4);
      setVomitQuality(VomitQuality.FOOD);
      setNotes('');
    }
    setError(null);
  }, [event, mode, open, dogs, defaultDogId]);

  const handleEventTypeChange = (value: string) => {
    setSelectedEventOption(value);
    if (value.startsWith('custom_')) {
      setEventType('');
      setCustomEventId(value.replace('custom_', ''));
    } else {
      setEventType(value as EventType);
      setCustomEventId('');
    }
  };

  const handleSubmit = async () => {
    if (!dogId) {
      setError('Please select a dog');
      return;
    }

    if (!eventType && !customEventId) {
      setError('Please select an event type');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const eventData: EventCreate | EventUpdate = {
        dog_id: dogId,
        event_type: eventType || undefined,
        custom_event_id: customEventId || undefined,
        date: new Date(date).toISOString(),
        time_of_day: timeOfDay,
        poo_quality: eventType === EventType.POO ? pooQuality : undefined,
        vomit_quality: eventType === EventType.VOMIT ? vomitQuality : undefined,
        notes: notes || undefined,
      };

      await onSubmit(eventData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add Health Event' : 'Edit Health Event'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Dog Selection */}
          <FormControl fullWidth required>
            <InputLabel>Dog</InputLabel>
            <Select
              value={dogId}
              onChange={(e) => setDogId(e.target.value)}
              label="Dog"
            >
              {dogs.map((dog) => (
                <MenuItem key={dog.id} value={dog.id}>
                  {dog.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Event Type */}
          <FormControl fullWidth required>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={selectedEventOption}
              onChange={(e) => handleEventTypeChange(e.target.value)}
              label="Event Type"
            >
              <MenuItem value={EventType.POO}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={eventPooIcon} alt="" style={{ width: 20, height: 20 }} />
                  Poo
                </Box>
              </MenuItem>
              <MenuItem value={EventType.VOMIT}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={typeVomitIcon} alt="" style={{ width: 20, height: 20 }} />
                  Vomit
                </Box>
              </MenuItem>
              <MenuItem value={EventType.ITCHY}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={typeScratchyIcon} alt="" style={{ width: 20, height: 20 }} />
                  Itchy
                </Box>
              </MenuItem>
              <MenuItem value={EventType.INJURY}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={typeInjuryIcon} alt="" style={{ width: 20, height: 20 }} />
                  Injury
                </Box>
              </MenuItem>
              <MenuItem value={EventType.OTHER}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={typeOtherIcon} alt="" style={{ width: 20, height: 20 }} />
                  Other
                </Box>
              </MenuItem>
              {customEvents.length > 0 && <Divider sx={{ my: 1 }} />}
              {customEvents.map((customEvent) => (
                <MenuItem key={customEvent.id} value={`custom_${customEvent.id}`}>
                  📌 {customEvent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date */}
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          {/* Time of Day */}
          <FormControl fullWidth required>
            <InputLabel>Time of Day</InputLabel>
            <Select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
              label="Time of Day"
            >
              <MenuItem value={TimeOfDay.MORNING}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={morningIcon} alt="Morning" style={{ width: 20, height: 20 }} />
                  Morning
                </Box>
              </MenuItem>
              <MenuItem value={TimeOfDay.AFTERNOON}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={afternoonIcon} alt="Afternoon" style={{ width: 20, height: 20 }} />
                  Afternoon
                </Box>
              </MenuItem>
              <MenuItem value={TimeOfDay.EVENING}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={eveningIcon} alt="Evening" style={{ width: 20, height: 20 }} />
                  Evening
                </Box>
              </MenuItem>
              <MenuItem value={TimeOfDay.OVERNIGHT}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img src={nightIcon} alt="Overnight" style={{ width: 20, height: 20 }} />
                  Overnight
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Conditional: Poo Quality */}
          {eventType === EventType.POO && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Poo Quality (1 = liquid, 7 = hard)
              </Typography>
              <Rating
                value={pooQuality}
                onChange={(_, value) => setPooQuality(value || 1)}
                max={7}
                size="large"
                icon={<img src={eventPooIcon} alt="" style={{ width: 28, height: 28, marginRight: 4 }} />}
                emptyIcon={<img src={eventPooEmptyIcon} alt="" style={{ width: 28, height: 28, marginRight: 4 }} />}
              />
            </Box>
          )}

          {/* Conditional: Vomit Quality */}
          {eventType === EventType.VOMIT && (
            <FormControl fullWidth>
              <InputLabel>Vomit Quality</InputLabel>
              <Select
                value={vomitQuality}
                onChange={(e) => setVomitQuality(e.target.value as VomitQuality)}
                label="Vomit Quality"
              >
                <MenuItem value={VomitQuality.FOOD}>Food</MenuItem>
                <MenuItem value={VomitQuality.BILE}>Bile</MenuItem>
                <MenuItem value={VomitQuality.FOOD_BILE}>Food + Bile</MenuItem>
                <MenuItem value={VomitQuality.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Notes */}
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Add any additional notes..."
          />

          {/* Error Message */}
          {error && (
            <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
              {error}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={submitting}
          startIcon={<img src={iconCancel} alt="" style={{ width: 20, height: 20 }} />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !dogId || !date}
          startIcon={submitting ? <img src={dogSpinner} alt="" style={{ width: 20, height: 20 }} /> : <img src={iconOk} alt="" style={{ width: 20, height: 20 }} />}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Event' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventFormDialog;
