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
import { Vet, VetCreate, VetUpdate } from '../types';

interface VetFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (vet: VetCreate | VetUpdate) => Promise<void>;
  vet?: Vet | null;
  mode: 'create' | 'edit';
}

const VetFormDialog: React.FC<VetFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  vet,
  mode,
}) => {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vet && mode === 'edit') {
      setName(vet.name);
      setContactInfo(vet.contact_info || '');
      setNotes(vet.notes || '');
    } else {
      setName('');
      setContactInfo('');
      setNotes('');
    }
    setError(null);
  }, [vet, mode, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const vetData = {
        name,
        contact_info: contactInfo || undefined,
        notes: notes || undefined,
      };

      await onSubmit(vetData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add New Vet' : 'Edit Vet'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Name Field */}
          <TextField
            label="Vet Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            error={!!error && !name.trim()}
            helperText={!!error && !name.trim() ? 'Name is required' : ''}
          />

          {/* Contact Info Field */}
          <TextField
            label="Contact Info"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            fullWidth
            placeholder="Phone, email, address..."
            multiline
            rows={2}
          />

          {/* Notes Field */}
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            placeholder="Specialties, hours, etc..."
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
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !name.trim()}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Vet' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VetFormDialog;
