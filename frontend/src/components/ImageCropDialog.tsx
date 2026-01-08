import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
} from '@mui/material';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import iconOk from '../assets/icon_ok.png';
import iconCancel from '../assets/icon_cancel.png';

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onComplete: (croppedImage: string) => void;
}

const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  imageSrc,
  onClose,
  onComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<string> => {
    if (!croppedAreaPixels) {
      throw new Error('No crop area selected');
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Target size (max dimension)
        const maxSize = 800;
        const { width, height } = croppedAreaPixels;
        const aspectRatio = width / height;

        // Calculate output dimensions
        let outputWidth = width;
        let outputHeight = height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            outputWidth = maxSize;
            outputHeight = maxSize / aspectRatio;
          } else {
            outputHeight = maxSize;
            outputWidth = maxSize * aspectRatio;
          }
        }

        // Set canvas size
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // Draw the cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          outputWidth,
          outputHeight
        );

        // Convert to data URL with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          0.9 // 90% quality
        );
      };
      image.onerror = reject;
    });
  };

  const handleConfirm = async () => {
    try {
      const croppedImage = await createCroppedImage();
      onComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crop & Adjust Photo</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: 'grey.900', borderRadius: 2 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="round"
            showGrid={false}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value as number)}
            sx={{ mt: 1 }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Drag to reposition • Pinch or use slider to zoom
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          startIcon={<img src={iconCancel} alt="" style={{ width: 20, height: 20 }} />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<img src={iconOk} alt="" style={{ width: 20, height: 20 }} />}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropDialog;
