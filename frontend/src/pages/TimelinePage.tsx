import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
} from '@mui/lab';
import { useDogs } from '../hooks/useDogs';
import { useVets } from '../hooks/useVets';
import { useMedicines } from '../hooks/useMedicines';
import { useCustomEvents } from '../hooks/useCustomEvents';
import { useEvents } from '../hooks/useEvents';
import { useVetVisits } from '../hooks/useVetVisits';
import { useMedicineEvents } from '../hooks/useMedicineEvents';
import { Event, VetVisit, MedicineEvent, EventCreate, EventUpdate, VetVisitCreate, VetVisitUpdate, MedicineEventCreate, MedicineEventUpdate, EventType, TimeOfDay } from '../types';
import EventFormDialog from '../components/EventFormDialog';
import VetVisitFormDialog from '../components/VetVisitFormDialog';
import MedicineEventFormDialog from '../components/MedicineEventFormDialog';
import editIcon from '../assets/edit.png';
import deleteIcon from '../assets/delete.png';
import pawIcon64 from '../assets/paw-64.png';
import calendarNavIcon from '../assets/calendar-nav.png';
import eventPooIcon from '../assets/event_poo.png';
import eventPooEmptyIcon from '../assets/event_poo_empty.png';
import eventMedicineIcon from '../assets/event_medicine.png';
import eventHealthIcon from '../assets/event_health.png';
import eventVetIcon from '../assets/event_vet.png';
import typeVomitIcon from '../assets/type_vomit.png';
import typeScratchyIcon from '../assets/type_scratchy.png';
import typeInjuryIcon from '../assets/type_injury.png';
import typeOtherIcon from '../assets/type_other.png';
import morningIcon from '../assets/morning.png';
import afternoonIcon from '../assets/afternoon.png';
import eveningIcon from '../assets/evening.png';
import nightIcon from '../assets/night.png';
import iconOk from '../assets/icon_ok.png';
import iconCancel from '../assets/icon_cancel.png';
import iconWarning from '../assets/icon_warning.png';
import dogSpinner from '../assets/dog_spinner.gif';
import { Stack } from '@mui/material';

// Unified timeline item type
type TimelineItem = {
  id: string;
  type: 'event' | 'vet_visit' | 'medicine_event';
  date: string;
  data: Event | VetVisit | MedicineEvent;
};

const TimelinePage: React.FC = () => {
  const [selectedDogId, setSelectedDogId] = useState<string>('all');

  // Fetch all data
  const { dogs, loading: dogsLoading } = useDogs();
  const { vets } = useVets();
  const { medicines } = useMedicines();
  const { customEvents } = useCustomEvents();
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent } = useEvents(selectedDogId === 'all' ? undefined : selectedDogId);
  const { vetVisits, loading: vetVisitsLoading, createVetVisit, updateVetVisit, deleteVetVisit } = useVetVisits(selectedDogId === 'all' ? undefined : selectedDogId);
  const { medicineEvents, loading: medicineEventsLoading, createMedicineEvent, updateMedicineEvent, deleteMedicineEvent } = useMedicineEvents(selectedDogId === 'all' ? undefined : selectedDogId);

  // Dialog states
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [vetVisitDialogOpen, setVetVisitDialogOpen] = useState(false);
  const [medicineEventDialogOpen, setMedicineEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingVetVisit, setEditingVetVisit] = useState<VetVisit | null>(null);
  const [editingMedicineEvent, setEditingMedicineEvent] = useState<MedicineEvent | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'event' | 'vet_visit' | 'medicine_event'; id: string } | null>(null);

  // Validation dialog
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  // Combine all items into unified timeline and group by date
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [
      ...events.map(e => ({ id: e.id, type: 'event' as const, date: e.date, data: e })),
      ...vetVisits.map(v => ({ id: v.id, type: 'vet_visit' as const, date: v.date, data: v })),
      ...medicineEvents.map(m => ({ id: m.id, type: 'medicine_event' as const, date: m.date, data: m })),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, vetVisits, medicineEvents]);

  // Group items by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, TimelineItem[]>();

    timelineItems.forEach(item => {
      const dateKey = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(item);
    });

    // Sort within each date group by time of day, then alphabetically
    const timeOfDayOrder = {
      [TimeOfDay.MORNING]: 0,
      [TimeOfDay.AFTERNOON]: 1,
      [TimeOfDay.EVENING]: 2,
      [TimeOfDay.OVERNIGHT]: 3,
    };

    groups.forEach((items) => {
      items.sort((a, b) => {
        const aTimeOfDay = 'time_of_day' in a.data ? a.data.time_of_day : TimeOfDay.MORNING;
        const bTimeOfDay = 'time_of_day' in b.data ? b.data.time_of_day : TimeOfDay.MORNING;

        // First sort by time of day
        const timeDiff = timeOfDayOrder[aTimeOfDay] - timeOfDayOrder[bTimeOfDay];
        if (timeDiff !== 0) return timeDiff;

        // Then sort alphabetically by type
        return a.type.localeCompare(b.type);
      });
    });

    return Array.from(groups.entries());
  }, [timelineItems]);

  const loading = dogsLoading || eventsLoading || vetVisitsLoading || medicineEventsLoading;

  // Handlers
  const handleAddEvent = (type: 'event' | 'vet_visit' | 'medicine_event') => {
    // Validate that required data exists
    if (type === 'vet_visit' && vets.length === 0) {
      setValidationMessage('You need to create a Vet first in the Setup page');
      setValidationDialogOpen(true);
      return;
    }

    if (type === 'medicine_event' && medicines.length === 0) {
      setValidationMessage('You need to create a Medicine first in the Setup page');
      setValidationDialogOpen(true);
      return;
    }

    setEditingEvent(null);
    setEditingVetVisit(null);
    setEditingMedicineEvent(null);
    setDialogMode('create');

    if (type === 'event') setEventDialogOpen(true);
    else if (type === 'vet_visit') setVetVisitDialogOpen(true);
    else if (type === 'medicine_event') setMedicineEventDialogOpen(true);
  };

  const handleItemClick = (item: TimelineItem) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleEditFromDetails = () => {
    if (!selectedItem) return;

    setDetailsDialogOpen(false);
    setDialogMode('edit');

    if (selectedItem.type === 'event') {
      setEditingEvent(selectedItem.data as Event);
      setEventDialogOpen(true);
    } else if (selectedItem.type === 'vet_visit') {
      setEditingVetVisit(selectedItem.data as VetVisit);
      setVetVisitDialogOpen(true);
    } else if (selectedItem.type === 'medicine_event') {
      setEditingMedicineEvent(selectedItem.data as MedicineEvent);
      setMedicineEventDialogOpen(true);
    }
  };

  const handleDeleteFromDetails = () => {
    if (!selectedItem) return;

    setDetailsDialogOpen(false);
    setDeleteTarget({ type: selectedItem.type, id: selectedItem.id });
    setDeleteDialogOpen(true);
  };


  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'event') {
        await deleteEvent(deleteTarget.id);
      } else if (deleteTarget.type === 'vet_visit') {
        await deleteVetVisit(deleteTarget.id);
      } else if (deleteTarget.type === 'medicine_event') {
        await deleteMedicineEvent(deleteTarget.id);
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleEventSubmit = async (eventData: EventCreate | EventUpdate) => {
    if (dialogMode === 'create') {
      await createEvent(eventData as EventCreate);
    } else if (editingEvent) {
      await updateEvent(editingEvent.id, eventData as EventUpdate);
    }
  };

  const handleVetVisitSubmit = async (vetVisitData: VetVisitCreate | VetVisitUpdate) => {
    if (dialogMode === 'create') {
      await createVetVisit(vetVisitData as VetVisitCreate);
    } else if (editingVetVisit) {
      await updateVetVisit(editingVetVisit.id, vetVisitData as VetVisitUpdate);
    }
  };

  const handleMedicineEventSubmit = async (medicineEventData: MedicineEventCreate | MedicineEventUpdate) => {
    if (dialogMode === 'create') {
      await createMedicineEvent(medicineEventData as MedicineEventCreate);
    } else if (editingMedicineEvent) {
      await updateMedicineEvent(editingMedicineEvent.id, medicineEventData as MedicineEventUpdate);
    }
  };

  // Render timeline item
  const renderTimelineItem = (item: TimelineItem) => {
    const getDogName = (dogId: string) => dogs.find(d => d.id === dogId)?.name || 'Unknown';
    const getVetName = (vetId: string) => vets.find(v => v.id === vetId)?.name || 'Unknown';
    const getMedicineName = (medicineId: string) => medicines.find(m => m.id === medicineId)?.name || 'Unknown';
    const getCustomEventName = (customEventId: string) => customEvents.find(ce => ce.id === customEventId)?.name || 'Unknown';

    const getTimeOfDayIcon = (timeOfDay: TimeOfDay) => {
      switch (timeOfDay) {
        case TimeOfDay.MORNING: return morningIcon;
        case TimeOfDay.AFTERNOON: return afternoonIcon;
        case TimeOfDay.EVENING: return eveningIcon;
        case TimeOfDay.OVERNIGHT: return nightIcon;
        default: return morningIcon;
      }
    };

    if (item.type === 'event') {
      const event = item.data as Event;

      return (
        <Card
          key={item.id}
          sx={{
            mb: 2,
            boxShadow: 2,
            cursor: 'pointer',
            '&:hover': { boxShadow: 4 }
          }}
          onClick={() => handleItemClick(item)}
        >
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {event.custom_event_id ? getCustomEventName(event.custom_event_id) : event.event_type}
              </Typography>
              <Chip
                icon={<img src={getTimeOfDayIcon(event.time_of_day)} alt="" style={{ width: 16, height: 16 }} />}
                label={event.time_of_day}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {getDogName(event.dog_id)}
            </Typography>
            {event.event_type === EventType.POO && event.poo_quality && (
              <Box sx={{ mt: 0.5, display: 'flex', gap: 0.25 }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <img
                    key={i}
                    src={i < event.poo_quality! ? eventPooIcon : eventPooEmptyIcon}
                    alt=""
                    style={{ width: 16, height: 16 }}
                  />
                ))}
              </Box>
            )}
            {event.event_type === EventType.VOMIT && event.vomit_quality && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {event.vomit_quality}
              </Typography>
            )}
            {event.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                {event.notes}
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    } else if (item.type === 'vet_visit') {
      const vetVisit = item.data as VetVisit;
      return (
        <Card
          key={item.id}
          sx={{
            mb: 2,
            boxShadow: 2,
            cursor: 'pointer',
            '&:hover': { boxShadow: 4 }
          }}
          onClick={() => handleItemClick(item)}
        >
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Vet Visit
              </Typography>
              <Chip
                icon={<img src={getTimeOfDayIcon(vetVisit.time_of_day)} alt="" style={{ width: 16, height: 16 }} />}
                label={vetVisit.time_of_day}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {getDogName(vetVisit.dog_id)} • {getVetName(vetVisit.vet_id)}
            </Typography>
            {vetVisit.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                {vetVisit.notes}
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    } else if (item.type === 'medicine_event') {
      const medicineEvent = item.data as MedicineEvent;
      return (
        <Card
          key={item.id}
          sx={{
            mb: 2,
            boxShadow: 2,
            cursor: 'pointer',
            '&:hover': { boxShadow: 4 }
          }}
          onClick={() => handleItemClick(item)}
        >
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {getMedicineName(medicineEvent.medicine_id)}
              </Typography>
              <Chip
                icon={<img src={getTimeOfDayIcon(medicineEvent.time_of_day)} alt="" style={{ width: 16, height: 16 }} />}
                label={medicineEvent.time_of_day}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {getDogName(medicineEvent.dog_id)} • {medicineEvent.dosage} dosage
            </Typography>
            {medicineEvent.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                {medicineEvent.notes}
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  if (dogs.length === 0 && !dogsLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Timeline
        </Typography>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <img src={pawIcon64} alt="No dogs" style={{ width: 64, height: 64, opacity: 0.54, marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary">
            No dogs yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Add a dog in the Setup page to start tracking health events
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Timeline
      </Typography>

      {/* Dog Filter */}
      <FormControl fullWidth sx={{ mt: 3, mb: 3 }}>
        <InputLabel>Filter by Dog</InputLabel>
        <Select
          value={selectedDogId}
          onChange={(e) => setSelectedDogId(e.target.value)}
          label="Filter by Dog"
        >
          <MenuItem value="all">All Dogs</MenuItem>
          {dogs.map((dog) => (
            <MenuItem key={dog.id} value={dog.id}>
              {dog.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Timeline */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <img src={dogSpinner} alt="Loading..." style={{ width: 48, height: 48 }} />
        </Box>
      ) : timelineItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No events yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Use the + button to add health events, vet visits, or medicine administrations
          </Typography>
        </Box>
      ) : (
        <Timeline position="right" sx={{
          '& .MuiTimelineItem-root:before': {
            flex: 0,
            padding: 0,
          },
        }}>
          {groupedByDate.map(([dateKey, items], groupIndex) => (
            <React.Fragment key={dateKey}>
              {/* Date Header Timeline Item */}
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="grey" sx={{
                    bgcolor: 'primary.main',
                    boxShadow: 3,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img src={calendarNavIcon} alt="Calendar" style={{ width: 24, height: 24 }} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Typography variant="h5" fontWeight={600} color="primary">
                    {dateKey}
                  </Typography>
                </TimelineContent>
              </TimelineItem>

              {/* Events for this date */}
              {items.map((item, index) => {
                const getEventIcon = () => {
                  if (item.type === 'event') {
                    const event = item.data as Event;
                    if (event.custom_event_id) {
                      return '📌'; // Pushpin for custom events
                    }
                    switch (event.event_type) {
                      case EventType.POO:
                        return <img src={eventPooIcon} alt="Poo" style={{ width: 24, height: 24 }} />;
                      case EventType.VOMIT:
                        return <img src={typeVomitIcon} alt="Vomit" style={{ width: 24, height: 24 }} />;
                      case EventType.ITCHY:
                        return <img src={typeScratchyIcon} alt="Itchy" style={{ width: 24, height: 24 }} />;
                      case EventType.INJURY:
                        return <img src={typeInjuryIcon} alt="Injury" style={{ width: 24, height: 24 }} />;
                      case EventType.OTHER:
                        return <img src={typeOtherIcon} alt="Other" style={{ width: 24, height: 24 }} />;
                      default:
                        return <img src={typeOtherIcon} alt="Event" style={{ width: 24, height: 24 }} />;
                    }
                  } else if (item.type === 'vet_visit') {
                    return <img src={eventVetIcon} alt="Vet Visit" style={{ width: 24, height: 24 }} />;
                  } else {
                    return <img src={eventMedicineIcon} alt="Medicine" style={{ width: 24, height: 24 }} />;
                  }
                };

                return (
                  <TimelineItem key={item.id}>
                    <TimelineSeparator>
                      <TimelineDot
                        sx={{
                          boxShadow: 2,
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'transparent'
                        }}
                      >
                        {getEventIcon()}
                      </TimelineDot>
                      {(index < items.length - 1 || groupIndex < groupedByDate.length - 1) && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      {renderTimelineItem(item)}
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </React.Fragment>
          ))}
        </Timeline>
      )}

      {/* Add Event Buttons */}
      <Stack
        spacing={1.5}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<img src={eventHealthIcon} alt="" style={{ width: 20, height: 20 }} />}
          onClick={() => handleAddEvent('event')}
          sx={{
            boxShadow: '0px 8px 24px rgba(255,138,91,0.4)',
            px: 2.5,
            py: 1.25,
            fontWeight: 600,
            minWidth: 180,
          }}
        >
          Health Event
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<img src={eventVetIcon} alt="" style={{ width: 20, height: 20 }} />}
          onClick={() => handleAddEvent('vet_visit')}
          sx={{
            boxShadow: '0px 8px 24px rgba(255,138,91,0.4)',
            px: 2.5,
            py: 1.25,
            fontWeight: 600,
            minWidth: 180,
          }}
        >
          Vet Visit
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<img src={eventMedicineIcon} alt="" style={{ width: 20, height: 20 }} />}
          onClick={() => handleAddEvent('medicine_event')}
          sx={{
            boxShadow: '0px 8px 24px rgba(255,138,91,0.4)',
            px: 2.5,
            py: 1.25,
            fontWeight: 600,
            minWidth: 180,
          }}
        >
          Medicine
        </Button>
      </Stack>

      {/* Form Dialogs */}
      <EventFormDialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        onSubmit={handleEventSubmit}
        event={editingEvent}
        mode={dialogMode}
        dogs={dogs}
        customEvents={customEvents}
        defaultDogId={selectedDogId === 'all' ? undefined : selectedDogId}
      />

      <VetVisitFormDialog
        open={vetVisitDialogOpen}
        onClose={() => setVetVisitDialogOpen(false)}
        onSubmit={handleVetVisitSubmit}
        vetVisit={editingVetVisit}
        mode={dialogMode}
        dogs={dogs}
        vets={vets}
        defaultDogId={selectedDogId === 'all' ? undefined : selectedDogId}
      />

      <MedicineEventFormDialog
        open={medicineEventDialogOpen}
        onClose={() => setMedicineEventDialogOpen(false)}
        onSubmit={handleMedicineEventSubmit}
        medicineEvent={editingMedicineEvent}
        mode={dialogMode}
        dogs={dogs}
        medicines={medicines}
        defaultDogId={selectedDogId === 'all' ? undefined : selectedDogId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            startIcon={<img src={iconCancel} alt="" style={{ width: 20, height: 20 }} />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<img src={iconOk} alt="" style={{ width: 20, height: 20 }} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={validationDialogOpen} onClose={() => setValidationDialogOpen(false)}>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
            <img src={iconWarning} alt="" style={{ width: 60, height: 60 }} />
            <DialogContentText sx={{ fontSize: '1rem' }}>
              {validationMessage}
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setValidationDialogOpen(false)}
            variant="contained"
            startIcon={<img src={iconOk} alt="" style={{ width: 20, height: 20 }} />}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem && (() => {
            const getDogName = (dogId: string) => dogs.find(d => d.id === dogId)?.name || 'Unknown';
            const getVetName = (vetId: string) => vets.find(v => v.id === vetId)?.name || 'Unknown';
            const getMedicineName = (medicineId: string) => medicines.find(m => m.id === medicineId)?.name || 'Unknown';
            const getCustomEventName = (customEventId: string) => customEvents.find(ce => ce.id === customEventId)?.name || 'Unknown';

            if (selectedItem.type === 'event') {
              const event = selectedItem.data as Event;
              const eventName = event.custom_event_id ? getCustomEventName(event.custom_event_id) : event.event_type;
              return `${getDogName(event.dog_id)}'s ${eventName} event`;
            } else if (selectedItem.type === 'vet_visit') {
              const vetVisit = selectedItem.data as VetVisit;
              return `${getDogName(vetVisit.dog_id)}'s Vet Visit`;
            } else if (selectedItem.type === 'medicine_event') {
              const medicineEvent = selectedItem.data as MedicineEvent;
              return `${getDogName(medicineEvent.dog_id)}'s ${getMedicineName(medicineEvent.medicine_id)}`;
            }
            return 'Event Details';
          })()}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (() => {
            const getVetName = (vetId: string) => vets.find(v => v.id === vetId)?.name || 'Unknown';
            const getTimeOfDayIcon = (timeOfDay: TimeOfDay) => {
              switch (timeOfDay) {
                case TimeOfDay.MORNING: return morningIcon;
                case TimeOfDay.AFTERNOON: return afternoonIcon;
                case TimeOfDay.EVENING: return eveningIcon;
                case TimeOfDay.OVERNIGHT: return nightIcon;
                default: return morningIcon;
              }
            };

            if (selectedItem.type === 'event') {
              const event = selectedItem.data as Event;
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography variant="body1">{new Date(event.date).toLocaleDateString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Time of Day</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <img src={getTimeOfDayIcon(event.time_of_day)} alt="" style={{ width: 24, height: 24 }} />
                      <Typography variant="body1">{event.time_of_day}</Typography>
                    </Box>
                  </Box>
                  {event.event_type === EventType.POO && event.poo_quality && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Poo Quality</Typography>
                      <Box sx={{ display: 'flex', gap: 0.25, mt: 0.5 }}>
                        {Array.from({ length: 7 }, (_, i) => (
                          <img
                            key={i}
                            src={i < event.poo_quality! ? eventPooIcon : eventPooEmptyIcon}
                            alt=""
                            style={{ width: 20, height: 20 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {event.event_type === EventType.VOMIT && event.vomit_quality && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Vomit Quality</Typography>
                      <Typography variant="body1">{event.vomit_quality}</Typography>
                    </Box>
                  )}
                  {event.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Notes</Typography>
                      <Typography variant="body1">{event.notes}</Typography>
                    </Box>
                  )}
                </Box>
              );
            } else if (selectedItem.type === 'vet_visit') {
              const vetVisit = selectedItem.data as VetVisit;
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Veterinarian</Typography>
                    <Typography variant="body1">{getVetName(vetVisit.vet_id)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography variant="body1">{new Date(vetVisit.date).toLocaleDateString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Time of Day</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <img src={getTimeOfDayIcon(vetVisit.time_of_day)} alt="" style={{ width: 24, height: 24 }} />
                      <Typography variant="body1">{vetVisit.time_of_day}</Typography>
                    </Box>
                  </Box>
                  {vetVisit.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Notes</Typography>
                      <Typography variant="body1">{vetVisit.notes}</Typography>
                    </Box>
                  )}
                </Box>
              );
            } else if (selectedItem.type === 'medicine_event') {
              const medicineEvent = selectedItem.data as MedicineEvent;
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Dosage</Typography>
                    <Typography variant="body1">{medicineEvent.dosage}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography variant="body1">{new Date(medicineEvent.date).toLocaleDateString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Time of Day</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <img src={getTimeOfDayIcon(medicineEvent.time_of_day)} alt="" style={{ width: 24, height: 24 }} />
                      <Typography variant="body1">{medicineEvent.time_of_day}</Typography>
                    </Box>
                  </Box>
                  {medicineEvent.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Notes</Typography>
                      <Typography variant="body1">{medicineEvent.notes}</Typography>
                    </Box>
                  )}
                </Box>
              );
            }
            return null;
          })()}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteFromDetails}
            color="error"
            startIcon={<img src={deleteIcon} alt="" style={{ width: 20, height: 20 }} />}
          >
            Delete
          </Button>
          <Button
            onClick={handleEditFromDetails}
            variant="contained"
            startIcon={<img src={editIcon} alt="" style={{ width: 20, height: 20 }} />}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TimelinePage;
