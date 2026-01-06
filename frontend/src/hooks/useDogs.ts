import { useState, useEffect, useCallback } from 'react';
import { Dog, DogCreate, DogUpdate } from '../types';
import { apiClient } from '../api/client';

export const useDogs = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.dogs.getAll();
      setDogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  const createDog = async (dog: DogCreate): Promise<Dog> => {
    const newDog = await apiClient.dogs.create(dog);
    setDogs(prev => [...prev, newDog]);
    return newDog;
  };

  const updateDog = async (id: string, dog: DogUpdate): Promise<Dog> => {
    const updatedDog = await apiClient.dogs.update(id, dog);
    setDogs(prev => prev.map(d => d.id === id ? updatedDog : d));
    return updatedDog;
  };

  const deleteDog = async (id: string): Promise<void> => {
    await apiClient.dogs.delete(id);
    setDogs(prev => prev.filter(d => d.id !== id));
  };

  return {
    dogs,
    loading,
    error,
    refetch: fetchDogs,
    createDog,
    updateDog,
    deleteDog,
  };
};
