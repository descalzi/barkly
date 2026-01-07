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
} from '@mui/material';
import { VetVisit, VetVisitCreate, VetVisitUpdate, TimeOfDay, Dog, Vet } from '../types';
import morningIcon from '../assets/morning.png';
import afternoonIcon from '../assets/afternoon.png';
import eveningIcon from '../assets/evening.png';
import nightIcon from '../assets/night.png';

interface VetVisitFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (vetVisit: VetVisitCreate | VetVisitUpdate) => Promise<void>;
  vetVisit?: VetVisit | null;
  mode: 'create' | 'edit';
  dogs: Dog[];
  vets: Vet[];
  defaultDogId?: string;
}

const VetVisitFormDialog: React.FC<VetVisitFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  vetVisit,
  mode,
  dogs,
  vets,
  defaultDogId,
}) => {
  const [dogId, setDogId] = useState('');
  const [vetId, setVetId] = useState('');
  const [date, setDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vetVisit && mode === 'edit') {
      setDogId(vetVisit.dog_id);
      setVetId(vetVisit.vet_id);
      setDate(vetVisit.date.split('T')[0]);
      setTimeOfDay(vetVisit.time_of_day);
      setNotes(vetVisit.notes || '');
    } else {
      setDogId(defaultDogId || (dogs.length > 0 ? dogs[0].id : ''));
      setVetId(vets.length > 0 ? vets[0].id : '');
      setDate(new Date().toISOString().split('T')[0]);
      setTimeOfDay(TimeOfDay.MORNING);
      setNotes('');
    }
    setError(null);
  }, [vetVisit, mode, open, dogs, vets, defaultDogId]);

  const handleSubmit = async () => {
    if (!dogId) {
      setError('Please select a dog');
      return;
    }
    if (!vetId) {
      setError('Please select a vet');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const vetVisitData: VetVisitCreate | VetVisitUpdate = {
        dog_id: dogId,
        vet_id: vetId,
        date: new Date(date).toISOString(),
        time_of_day: timeOfDay,
        notes: notes || undefined,
      };

      await onSubmit(vetVisitData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vet visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add Vet Visit' : 'Edit Vet Visit'}</DialogTitle>
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

          {/* Vet Selection */}
          <FormControl fullWidth required>
            <InputLabel>Veterinarian</InputLabel>
            <Select
              value={vetId}
              onChange={(e) => setVetId(e.target.value)}
              label="Veterinarian"
            >
              {vets.map((vet) => (
                <MenuItem key={vet.id} value={vet.id}>
                  {vet.name}
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

          {/* Notes */}
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Add visit details, diagnosis, treatment, etc..."
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
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !dogId || !vetId || !date}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Visit' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VetVisitFormDialog;
