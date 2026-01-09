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
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import { useDogs } from '../hooks/useDogs';
import { useVets } from '../hooks/useVets';
import { useMedicines } from '../hooks/useMedicines';
import { useCustomEvents } from '../hooks/useCustomEvents';
import { Dog, Vet, Medicine, CustomEvent, DogCreate, DogUpdate, VetCreate, VetUpdate, MedicineCreate, MedicineUpdate, CustomEventCreate, CustomEventUpdate } from '../types';
import DogFormDialog from '../components/DogFormDialog';
import VetFormDialog from '../components/VetFormDialog';
import MedicineFormDialog from '../components/MedicineFormDialog';
import CustomEventFormDialog from '../components/CustomEventFormDialog';
import pawIcon from '../assets/paw.png';
import vetIcon from '../assets/vet.png';
import medicineIcon from '../assets/medicine.png';
import eventHealthIcon from '../assets/event_health.png';
import pawIcon64 from '../assets/paw-64.png';
import vetIcon64 from '../assets/vet-64.png';
import medicineIcon64 from '../assets/medicine-64.png';
import veterinarianIcon from '../assets/veterinarian.png';
import dogProfilePlaceholder from '../assets/dog-profile.png';
import editIcon from '../assets/edit.png';
import deleteIcon from '../assets/delete.png';
import iconOk from '../assets/icon_ok.png';
import iconCancel from '../assets/icon_cancel.png';
import dogSpinner from '../assets/dog_spinner.gif';
import eventPooIcon from '../assets/event_poo.png';
import typeVomitIcon from '../assets/type_vomit.png';
import typeScratchyIcon from '../assets/type_scratchy.png';
import typeInjuryIcon from '../assets/type_injury.png';
import typeOtherIcon from '../assets/type_other.png';

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

  // Custom Events state
  const { customEvents, loading: customEventsLoading, error: customEventsError, createCustomEvent, updateCustomEvent, deleteCustomEvent } = useCustomEvents();
  const [customEventDialogOpen, setCustomEventDialogOpen] = useState(false);
  const [editingCustomEvent, setEditingCustomEvent] = useState<CustomEvent | null>(null);
  const [customEventDialogMode, setCustomEventDialogMode] = useState<'create' | 'edit'>('create');

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'dog' | 'vet' | 'medicine' | 'customEvent'; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Handlers for Custom Events
  const handleAddCustomEvent = () => {
    setEditingCustomEvent(null);
    setCustomEventDialogMode('create');
    setCustomEventDialogOpen(true);
  };

  const handleEditCustomEvent = (customEvent: CustomEvent) => {
    setEditingCustomEvent(customEvent);
    setCustomEventDialogMode('edit');
    setCustomEventDialogOpen(true);
  };

  const handleCustomEventSubmit = async (customEventData: CustomEventCreate | CustomEventUpdate) => {
    if (customEventDialogMode === 'create') {
      await createCustomEvent(customEventData as CustomEventCreate);
    } else if (editingCustomEvent) {
      await updateCustomEvent(editingCustomEvent.id, customEventData as CustomEventUpdate);
    }
  };

  // Delete handlers
  const handleDeleteClick = (type: 'dog' | 'vet' | 'medicine' | 'customEvent', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      if (deleteTarget.type === 'dog') {
        await deleteDog(deleteTarget.id);
      } else if (deleteTarget.type === 'vet') {
        await deleteVet(deleteTarget.id);
      } else if (deleteTarget.type === 'medicine') {
        await deleteMedicine(deleteTarget.id);
      } else if (deleteTarget.type === 'customEvent') {
        await deleteCustomEvent(deleteTarget.id);
      }

      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Delete failed:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
      <Typography variant="h3" sx={{ fontWeight: 600, fontFamily: '"Baloo 2", Roboto' }}>
        Setup
      </Typography>

      <Paper elevation={2} sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab
            icon={<img src={pawIcon} alt="Dogs" style={{ width: 24, height: 24 }} />}
          />
          <Tab
            icon={<img src={vetIcon} alt="Vets" style={{ width: 24, height: 24 }} />}
          />
          <Tab
            icon={<img src={medicineIcon} alt="Medicines" style={{ width: 24, height: 24 }} />}
          />
          <Tab
            icon={<img src={eventHealthIcon} alt="Events" style={{ width: 24, height: 24 }} />}
          />
        </Tabs>

        {/* Dogs Tab */}
        <TabPanel value={activeTab} index={0}>
          {dogsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <img src={dogSpinner} alt="Loading..." style={{ width: 48, height: 48 }} />
            </Box>
          ) : dogsError ? (
            <Alert severity="error">{dogsError}</Alert>
          ) : dogs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <img src={pawIcon64} alt="No dogs" style={{ width: 64, height: 64, opacity: 0.54, marginBottom: 16 }} />
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
                        <img src={editIcon} alt="Edit" style={{ width: 24, height: 24 }} />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteClick('dog', dog.id, dog.name)}>
                        <img src={deleteIcon} alt="Delete" style={{ width: 24, height: 24 }} />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={dog.profile_picture || dogProfilePlaceholder} alt={dog.name} />
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
              <img src={dogSpinner} alt="Loading..." style={{ width: 48, height: 48 }} />
            </Box>
          ) : vetsError ? (
            <Alert severity="error">{vetsError}</Alert>
          ) : vets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <img src={vetIcon64} alt="No vets" style={{ width: 64, height: 64, opacity: 0.54, marginBottom: 16 }} />
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
                        <img src={editIcon} alt="Edit" style={{ width: 24, height: 24 }} />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteClick('vet', vet.id, vet.name)}>
                        <img src={deleteIcon} alt="Delete" style={{ width: 24, height: 24 }} />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={veterinarianIcon} alt={vet.name} />
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
              <img src={dogSpinner} alt="Loading..." style={{ width: 48, height: 48 }} />
            </Box>
          ) : medicinesError ? (
            <Alert severity="error">{medicinesError}</Alert>
          ) : medicines.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <img src={medicineIcon64} alt="No medicines" style={{ width: 64, height: 64, opacity: 0.54, marginBottom: 16 }} />
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
                        <img src={editIcon} alt="Edit" style={{ width: 24, height: 24 }} />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteClick('medicine', medicine.id, medicine.name)}>
                        <img src={deleteIcon} alt="Delete" style={{ width: 24, height: 24 }} />
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

        {/* Custom Events Tab */}
        <TabPanel value={activeTab} index={3}>
          {customEventsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <img src={dogSpinner} alt="Loading..." style={{ width: 48, height: 48 }} />
            </Box>
          ) : customEventsError ? (
            <Alert severity="error">{customEventsError}</Alert>
          ) : customEvents.length === 0 ? (
            <Box sx={{ py: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <img src={eventHealthIcon} alt="No custom events" style={{ width: 64, height: 64, opacity: 0.54, marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary">
                  No custom events yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Create custom event types to track additional health events
                </Typography>
              </Box>

              <Box sx={{ px: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Pre-defined Event Types:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent', width: 32, height: 32 }}>
                        <img src={eventPooIcon} alt="Poo" style={{ width: 24, height: 24 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Poo"
                      secondary="Track bowel movements and quality (based on Purina Faecal Scoring chart)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent', width: 32, height: 32 }}>
                        <img src={typeVomitIcon} alt="Vomit" style={{ width: 24, height: 24 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Vomit" secondary="Record vomiting incidents" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent', width: 32, height: 32 }}>
                        <img src={typeScratchyIcon} alt="Itchy" style={{ width: 24, height: 24 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Itchy" secondary="Track scratching and skin issues" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent', width: 32, height: 32 }}>
                        <img src={typeInjuryIcon} alt="Injury" style={{ width: 24, height: 24 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Injury" secondary="Document injuries and wounds" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent', width: 32, height: 32 }}>
                        <img src={typeOtherIcon} alt="Other" style={{ width: 24, height: 24 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Other" secondary="General health observations" />
                  </ListItem>
                </List>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                  These built-in event types are always available in your timeline
                </Typography>
              </Box>
            </Box>
          ) : (
            <List>
              {customEvents.map((customEvent) => (
                <ListItem
                  key={customEvent.id}
                  secondaryAction={
                    <>
                      <IconButton edge="end" onClick={() => handleEditCustomEvent(customEvent)} sx={{ mr: 1 }}>
                        <img src={editIcon} alt="Edit" style={{ width: 24, height: 24 }} />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteClick('customEvent', customEvent.id, customEvent.name)}>
                        <img src={deleteIcon} alt="Delete" style={{ width: 24, height: 24 }} />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <img src={eventHealthIcon} alt="" style={{ width: 24, height: 24 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={customEvent.name} />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>

      {/* Add Button */}
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<img src={iconOk} alt="" style={{ width: 24, height: 24 }} />}
        onClick={() => {
          if (activeTab === 0) handleAddDog();
          else if (activeTab === 3) handleAddCustomEvent();
          else if (activeTab === 1) handleAddVet();
          else if (activeTab === 2) handleAddMedicine();
        }}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          boxShadow: '0px 8px 24px rgba(255,138,91,0.4)',
          px: 3,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {activeTab === 0 && 'Add Dog'}
        {activeTab === 1 && 'Add Vet'}
        {activeTab === 2 && 'Add Medicine'}
        {activeTab === 3 && 'Add Event'}
      </Button>

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

      <CustomEventFormDialog
        open={customEventDialogOpen}
        onClose={() => setCustomEventDialogOpen(false)}
        onSubmit={handleCustomEventSubmit}
        customEvent={editingCustomEvent}
        mode={customEventDialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={deleting ? undefined : () => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteTarget?.name}?
            {deleteTarget?.type === 'customEvent' && ' All timeline entries using this custom event will also be deleted.'}
            This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            startIcon={<img src={iconCancel} alt="" style={{ width: 20, height: 20 }} />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <img src={dogSpinner} alt="" style={{ width: 20, height: 20 }} /> : <img src={iconOk} alt="" style={{ width: 20, height: 20 }} />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SetupPage;
