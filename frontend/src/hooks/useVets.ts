import { useState, useEffect, useCallback } from 'react';
import { Vet, VetCreate, VetUpdate } from '../types';
import { apiClient } from '../api/client';

export const useVets = () => {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.vets.getAll();
      setVets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVets();
  }, [fetchVets]);

  const createVet = async (vet: VetCreate): Promise<Vet> => {
    const newVet = await apiClient.vets.create(vet);
    setVets(prev => [...prev, newVet]);
    return newVet;
  };

  const updateVet = async (id: string, vet: VetUpdate): Promise<Vet> => {
    const updatedVet = await apiClient.vets.update(id, vet);
    setVets(prev => prev.map(v => v.id === id ? updatedVet : v));
    return updatedVet;
  };

  const deleteVet = async (id: string): Promise<void> => {
    await apiClient.vets.delete(id);
    setVets(prev => prev.filter(v => v.id !== id));
  };

  return {
    vets,
    loading,
    error,
    refetch: fetchVets,
    createVet,
    updateVet,
    deleteVet,
  };
};
