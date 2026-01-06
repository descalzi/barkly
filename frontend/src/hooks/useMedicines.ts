import { useState, useEffect, useCallback } from 'react';
import { Medicine, MedicineCreate, MedicineUpdate } from '../types';
import { apiClient } from '../api/client';

export const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.medicines.getAll();
      setMedicines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const createMedicine = async (medicine: MedicineCreate): Promise<Medicine> => {
    const newMedicine = await apiClient.medicines.create(medicine);
    setMedicines(prev => [...prev, newMedicine]);
    return newMedicine;
  };

  const updateMedicine = async (id: string, medicine: MedicineUpdate): Promise<Medicine> => {
    const updatedMedicine = await apiClient.medicines.update(id, medicine);
    setMedicines(prev => prev.map(m => m.id === id ? updatedMedicine : m));
    return updatedMedicine;
  };

  const deleteMedicine = async (id: string): Promise<void> => {
    await apiClient.medicines.delete(id);
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  return {
    medicines,
    loading,
    error,
    refetch: fetchMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
  };
};
