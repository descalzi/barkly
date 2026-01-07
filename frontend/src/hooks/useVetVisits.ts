import { useState, useEffect, useCallback } from 'react';
import { VetVisit, VetVisitCreate, VetVisitUpdate } from '../types';
import { apiClient } from '../api/client';

export const useVetVisits = (dogId?: string) => {
  const [vetVisits, setVetVisits] = useState<VetVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVetVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.vetVisits.getAll(dogId);
      setVetVisits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vet visits');
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    fetchVetVisits();
  }, [fetchVetVisits]);

  const createVetVisit = async (vetVisit: VetVisitCreate): Promise<VetVisit> => {
    const newVetVisit = await apiClient.vetVisits.create(vetVisit);
    setVetVisits(prev => [newVetVisit, ...prev]);
    return newVetVisit;
  };

  const updateVetVisit = async (id: string, vetVisit: VetVisitUpdate): Promise<VetVisit> => {
    const updatedVetVisit = await apiClient.vetVisits.update(id, vetVisit);
    setVetVisits(prev => prev.map(v => v.id === id ? updatedVetVisit : v));
    return updatedVetVisit;
  };

  const deleteVetVisit = async (id: string): Promise<void> => {
    await apiClient.vetVisits.delete(id);
    setVetVisits(prev => prev.filter(v => v.id !== id));
  };

  return {
    vetVisits,
    loading,
    error,
    refetch: fetchVetVisits,
    createVetVisit,
    updateVetVisit,
    deleteVetVisit,
  };
};
