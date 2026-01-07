import { useState, useEffect, useCallback } from 'react';
import { MedicineEvent, MedicineEventCreate, MedicineEventUpdate } from '../types';
import { apiClient } from '../api/client';

export const useMedicineEvents = (dogId?: string) => {
  const [medicineEvents, setMedicineEvents] = useState<MedicineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicineEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.medicineEvents.getAll(dogId);
      setMedicineEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medicine events');
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    fetchMedicineEvents();
  }, [fetchMedicineEvents]);

  const createMedicineEvent = async (medicineEvent: MedicineEventCreate): Promise<MedicineEvent> => {
    const newMedicineEvent = await apiClient.medicineEvents.create(medicineEvent);
    setMedicineEvents(prev => [newMedicineEvent, ...prev]);
    return newMedicineEvent;
  };

  const updateMedicineEvent = async (id: string, medicineEvent: MedicineEventUpdate): Promise<MedicineEvent> => {
    const updatedMedicineEvent = await apiClient.medicineEvents.update(id, medicineEvent);
    setMedicineEvents(prev => prev.map(e => e.id === id ? updatedMedicineEvent : e));
    return updatedMedicineEvent;
  };

  const deleteMedicineEvent = async (id: string): Promise<void> => {
    await apiClient.medicineEvents.delete(id);
    setMedicineEvents(prev => prev.filter(e => e.id !== id));
  };

  return {
    medicineEvents,
    loading,
    error,
    refetch: fetchMedicineEvents,
    createMedicineEvent,
    updateMedicineEvent,
    deleteMedicineEvent,
  };
};
