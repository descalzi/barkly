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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Dog, DogCreate, DogUpdate } from '../types';
import { apiClient } from '../api/client';
import dogProfilePlaceholder from '../assets/dog-profile.png';
import iconOk from '../assets/icon_ok.png';
import iconCancel from '../assets/icon_cancel.png';
import dogSpinner from '../assets/dog_spinner.gif';

interface DogFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dog: DogCreate | DogUpdate) => Promise<void>;
  dog?: Dog | null;
  mode: 'create' | 'edit';
}

const DogFormDialog: React.FC<DogFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  dog,
  mode,
}) => {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dog && mode === 'edit') {
      setName(dog.name);
      setProfilePicture(dog.profile_picture);
    } else {
      setName('');
      setProfilePicture(undefined);
    }
    setError(null);
  }, [dog, mode, open]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const response = await apiClient.upload.image(file);
      setProfilePicture(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const dogData = mode === 'create'
        ? { name, profile_picture: profilePicture } as DogCreate
        : { name, profile_picture: profilePicture } as DogUpdate;

      await onSubmit(dogData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add New Dog' : 'Edit Dog'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Profile Picture */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={profilePicture || dogProfilePlaceholder}
              sx={{
                width: 120,
                height: 120,
                border: '3px solid',
                borderColor: 'primary.main',
                boxShadow: 3,
              }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={uploading ? <img src={dogSpinner} alt="" style={{ width: 20, height: 20 }} /> : <PhotoCameraIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>

          {/* Name Field */}
          <TextField
            label="Dog Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            error={!!error && !name.trim()}
            helperText={!!error && !name.trim() ? 'Name is required' : ''}
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
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Dog' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DogFormDialog;
