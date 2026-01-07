import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { CustomEvent, CustomEventCreate, CustomEventUpdate } from '../types';

interface CustomEventFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customEvent: CustomEventCreate | CustomEventUpdate) => Promise<void>;
  customEvent?: CustomEvent | null;
  mode: 'create' | 'edit';
}

const CustomEventFormDialog: React.FC<CustomEventFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  customEvent,
  mode,
}) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customEvent && mode === 'edit') {
      setName(customEvent.name);
    } else {
      setName('');
    }
    setError(null);
  }, [customEvent, mode, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const customEventData: CustomEventCreate | CustomEventUpdate = {
        name: name.trim(),
      };

      await onSubmit(customEventData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save custom event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add Custom Event' : 'Edit Custom Event'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            placeholder="e.g., Limping, Scratching, Coughing..."
          />

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
          disabled={submitting || !name.trim()}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomEventFormDialog;
