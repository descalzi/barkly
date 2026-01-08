import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
} from '@mui/material';
import { Vet, VetCreate, VetUpdate } from '../types';
import veterinarianIcon from '../assets/veterinarian.png';
import iconOk from '../assets/icon_ok.png';
import iconCancel from '../assets/icon_cancel.png';
import dogSpinner from '../assets/dog_spinner.gif';

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
          {/* Veterinarian Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Avatar
              src={veterinarianIcon}
              sx={{
                width: 120,
                height: 120,
                border: '3px solid',
                borderColor: 'primary.main',
                boxShadow: 3,
              }}
            />
          </Box>

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
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Vet' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VetFormDialog;
