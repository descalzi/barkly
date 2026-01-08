import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Medicine, MedicineCreate, MedicineUpdate, MedicineType } from '../types';
import iconOk from '../assets/icon_ok.png';
import iconCancel from '../assets/icon_cancel.png';
import dogSpinner from '../assets/dog_spinner.gif';

interface MedicineFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (medicine: MedicineCreate | MedicineUpdate) => Promise<void>;
  medicine?: Medicine | null;
  mode: 'create' | 'edit';
}

const MedicineFormDialog: React.FC<MedicineFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  medicine,
  mode,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<MedicineType>(MedicineType.TABLET);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (medicine && mode === 'edit') {
      setName(medicine.name);
      setType(medicine.type);
      setDescription(medicine.description || '');
    } else {
      setName('');
      setType(MedicineType.TABLET);
      setDescription('');
    }
    setError(null);
  }, [medicine, mode, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const medicineData = {
        name,
        type,
        description: description || undefined,
      };

      await onSubmit(medicineData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save medicine');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add New Medicine' : 'Edit Medicine'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Name Field */}
          <TextField
            label="Medicine Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            error={!!error && !name.trim()}
            helperText={!!error && !name.trim() ? 'Name is required' : ''}
          />

          {/* Type Field */}
          <FormControl fullWidth required>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as MedicineType)}
            >
              <MenuItem value={MedicineType.TABLET}>Tablet</MenuItem>
              <MenuItem value={MedicineType.DROP}>Drop</MenuItem>
              <MenuItem value={MedicineType.LIQUID}>Liquid</MenuItem>
              <MenuItem value={MedicineType.OTHER}>Other</MenuItem>
            </Select>
          </FormControl>

          {/* Description Field */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Dosage instructions, purpose, etc..."
            multiline
            rows={3}
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
          disabled={submitting || !name.trim()}
          startIcon={submitting ? <img src={dogSpinner} alt="" style={{ width: 20, height: 20 }} /> : <img src={iconOk} alt="" style={{ width: 20, height: 20 }} />}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Medicine' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicineFormDialog;
