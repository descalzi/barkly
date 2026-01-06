import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Fab,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PetsIcon from '@mui/icons-material/Pets';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import { useDogs } from '../hooks/useDogs';
import { useVets } from '../hooks/useVets';
import { useMedicines } from '../hooks/useMedicines';
import { Dog, Vet, Medicine, DogCreate, DogUpdate, VetCreate, VetUpdate, MedicineCreate, MedicineUpdate } from '../types';
import DogFormDialog from '../components/DogFormDialog';
import VetFormDialog from '../components/VetFormDialog';
import MedicineFormDialog from '../components/MedicineFormDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const SetupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Dogs state
  const { dogs, loading: dogsLoading, error: dogsError, createDog, updateDog, deleteDog } = useDogs();
  const [dogDialogOpen, setDogDialogOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [dogDialogMode, setDogDialogMode] = useState<'create' | 'edit'>('create');

  // Vets state
  const { vets, loading: vetsLoading, error: vetsError, createVet, updateVet, deleteVet } = useVets();
  const [vetDialogOpen, setVetDialogOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<Vet | null>(null);
  const [vetDialogMode, setVetDialogMode] = useState<'create' | 'edit'>('create');

  // Medicines state
  const { medicines, loading: medicinesLoading, error: medicinesError, createMedicine, updateMedicine, deleteMedicine } = useMedicines();
  const [medicineDialogOpen, setMedicineDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [medicineDialogMode, setMedicineDialogMode] = useState<'create' | 'edit'>('create');

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'dog' | 'vet' | 'medicine'; id: string; name: string } | null>(null);

  // Handlers for Dogs
  const handleAddDog = () => {
    setEditingDog(null);
    setDogDialogMode('create');
    setDogDialogOpen(true);
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setDogDialogMode('edit');
    setDogDialogOpen(true);
  };

  const handleDogSubmit = async (dogData: DogCreate | DogUpdate) => {
    if (dogDialogMode === 'create') {
      await createDog(dogData as DogCreate);
    } else if (editingDog) {
      await updateDog(editingDog.id, dogData as DogUpdate);
    }
  };

  // Handlers for Vets
  const handleAddVet = () => {
    setEditingVet(null);
    setVetDialogMode('create');
    setVetDialogOpen(true);
  };

  const handleEditVet = (vet: Vet) => {
    setEditingVet(vet);
    setVetDialogMode('edit');
    setVetDialogOpen(true);
  };

  const handleVetSubmit = async (vetData: VetCreate | VetUpdate) => {
    if (vetDialogMode === 'create') {
      await createVet(vetData as VetCreate);
    } else if (editingVet) {
      await updateVet(editingVet.id, vetData as VetUpdate);
    }
  };

  // Handlers for Medicines
  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setMedicineDialogMode('create');
    setMedicineDialogOpen(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setMedicineDialogMode('edit');
    setMedicineDialogOpen(true);
  };

  const handleMedicineSubmit = async (medicineData: MedicineCreate | MedicineUpdate) => {
    if (medicineDialogMode === 'create') {
      await createMedicine(medicineData as MedicineCreate);
    } else if (editingMedicine) {
      await updateMedicine(editingMedicine.id, medicineData as MedicineUpdate);
    }
  };

  // Delete handlers
  const handleDeleteClick = (type: 'dog' | 'vet' | 'medicine', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'dog') {
        await deleteDog(deleteTarget.id);
      } else if (deleteTarget.type === 'vet') {
        await deleteVet(deleteTarget.id);
      } else if (deleteTarget.type === 'medicine') {
        await deleteMedicine(deleteTarget.id);
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Setup
      </Typography>

      <Paper elevation={2} sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<PetsIcon />} label="Dogs" iconPosition="start" />
          <Tab icon={<LocalHospitalIcon />} label="Vets" iconPosition="start" />
          <Tab icon={<MedicationIcon />} label="Medicines" iconPosition="start" />
        </Tabs>

        {/* Dogs Tab */}
        <TabPanel value={activeTab} index={0}>
          {dogsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : dogsError ? (
            <Alert severity="error">{dogsError}</Alert>
          ) : dogs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PetsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No dogs yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add your first dog to get started
              </Typography>
            </Box>
          ) : (
            <List>
              {dogs.map((dog) => (
                <ListItem
                  key={dog.id}
                  secondaryAction={
                    <>
                      <IconButton edge="end" onClick={() => handleEditDog(dog)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteClick('dog', dog.id, dog.name)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={dog.profile_picture} alt={dog.name}>
                      <PetsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={dog.name} />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Vets Tab */}
        <TabPanel value={activeTab} index={1}>
          {vetsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : vetsError ? (
            <Alert severity="error">{vetsError}</Alert>
          ) : vets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <LocalHospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No vets yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add your veterinarians to track visits
              </Typography>
            </Box>
          ) : (
            <List>
              {vets.map((vet) => (
                <ListItem
                  key={vet.id}
                  secondaryAction={
                    <>
                      <IconButton edge="end" onClick={() => handleEditVet(vet)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteClick('vet', vet.id, vet.name)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <LocalHospitalIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={vet.name}
                    secondary={vet.contact_info || 'No contact info'}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Medicines Tab */}
        <TabPanel value={activeTab} index={2}>
          {medicinesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : medicinesError ? (
            <Alert severity="error">{medicinesError}</Alert>
          ) : medicines.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <MedicationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No medicines yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add medicines to track administration
              </Typography>
            </Box>
          ) : (
            <List>
              {medicines.map((medicine) => (
                <ListItem
                  key={medicine.id}
                  secondaryAction={
                    <>
                      <IconButton edge="end" onClick={() => handleEditMedicine(medicine)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteClick('medicine', medicine.id, medicine.name)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <MedicationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={medicine.name}
                    secondary={`${medicine.type.charAt(0).toUpperCase() + medicine.type.slice(1)}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          boxShadow: '0px 8px 24px rgba(255,138,91,0.4)',
        }}
        onClick={() => {
          if (activeTab === 0) handleAddDog();
          else if (activeTab === 1) handleAddVet();
          else if (activeTab === 2) handleAddMedicine();
        }}
      >
        <AddIcon />
      </Fab>

      {/* Form Dialogs */}
      <DogFormDialog
        open={dogDialogOpen}
        onClose={() => setDogDialogOpen(false)}
        onSubmit={handleDogSubmit}
        dog={editingDog}
        mode={dogDialogMode}
      />

      <VetFormDialog
        open={vetDialogOpen}
        onClose={() => setVetDialogOpen(false)}
        onSubmit={handleVetSubmit}
        vet={editingVet}
        mode={vetDialogMode}
      />

      <MedicineFormDialog
        open={medicineDialogOpen}
        onClose={() => setMedicineDialogOpen(false)}
        onSubmit={handleMedicineSubmit}
        medicine={editingMedicine}
        mode={medicineDialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteTarget?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SetupPage;
