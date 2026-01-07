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
import { MedicineEvent, MedicineEventCreate, MedicineEventUpdate, TimeOfDay, Dog, Medicine } from '../types';
import morningIcon from '../assets/morning.png';
import afternoonIcon from '../assets/afternoon.png';
import eveningIcon from '../assets/evening.png';
import nightIcon from '../assets/night.png';

interface MedicineEventFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (medicineEvent: MedicineEventCreate | MedicineEventUpdate) => Promise<void>;
  medicineEvent?: MedicineEvent | null;
  mode: 'create' | 'edit';
  dogs: Dog[];
  medicines: Medicine[];
  defaultDogId?: string;
}

const MedicineEventFormDialog: React.FC<MedicineEventFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  medicineEvent,
  mode,
  dogs,
  medicines,
  defaultDogId,
}) => {
  const [dogId, setDogId] = useState('');
  const [medicineId, setMedicineId] = useState('');
  const [date, setDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.MORNING);
  const [dosage, setDosage] = useState('1');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (medicineEvent && mode === 'edit') {
      setDogId(medicineEvent.dog_id);
      setMedicineId(medicineEvent.medicine_id);
      setDate(medicineEvent.date.split('T')[0]);
      setTimeOfDay(medicineEvent.time_of_day);
      setDosage(medicineEvent.dosage.toString());
      setNotes(medicineEvent.notes || '');
    } else {
      setDogId(defaultDogId || (dogs.length > 0 ? dogs[0].id : ''));
      setMedicineId(medicines.length > 0 ? medicines[0].id : '');
      setDate(new Date().toISOString().split('T')[0]);
      setTimeOfDay(TimeOfDay.MORNING);
      setDosage('1');
      setNotes('');
    }
    setError(null);
  }, [medicineEvent, mode, open, dogs, medicines, defaultDogId]);

  const handleSubmit = async () => {
    if (!dogId) {
      setError('Please select a dog');
      return;
    }
    if (!medicineId) {
      setError('Please select a medicine');
      return;
    }

    const dosageNum = parseFloat(dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      setError('Please enter a valid dosage');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const medicineEventData: MedicineEventCreate | MedicineEventUpdate = {
        dog_id: dogId,
        medicine_id: medicineId,
        date: new Date(date).toISOString(),
        time_of_day: timeOfDay,
        dosage: dosageNum,
        notes: notes || undefined,
      };

      await onSubmit(medicineEventData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medicine event');
    } finally {
      setSubmitting(false);
    }
  };

  // Dosage options in 0.25 increments from 0.25 to 5
  const dosageOptions = [];
  for (let i = 0.25; i <= 5; i += 0.25) {
    dosageOptions.push(i);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add Medicine Administration' : 'Edit Medicine Administration'}</DialogTitle>
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

          {/* Medicine Selection */}
          <FormControl fullWidth required>
            <InputLabel>Medicine</InputLabel>
            <Select
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              label="Medicine"
            >
              {medicines.map((medicine) => (
                <MenuItem key={medicine.id} value={medicine.id}>
                  {medicine.name} ({medicine.type})
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

          {/* Dosage */}
          <FormControl fullWidth required>
            <InputLabel>Dosage</InputLabel>
            <Select
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              label="Dosage"
            >
              {dosageOptions.map((opt) => (
                <MenuItem key={opt} value={opt.toString()}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !dogId || !medicineId || !date || !dosage}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Add' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicineEventFormDialog;
