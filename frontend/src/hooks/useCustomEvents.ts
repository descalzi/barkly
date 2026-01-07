import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { CustomEvent, CustomEventCreate, CustomEventUpdate } from '../types';

export const useCustomEvents = () => {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.customEvents.getAll();
      setCustomEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch custom events');
      console.error('Error fetching custom events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomEvents();
  }, [fetchCustomEvents]);

  const createCustomEvent = async (customEventData: CustomEventCreate): Promise<CustomEvent> => {
    const data = await apiClient.customEvents.create(customEventData);
    setCustomEvents((prev) => [...prev, data]);
    return data;
  };

  const updateCustomEvent = async (id: string, customEventData: CustomEventUpdate): Promise<CustomEvent> => {
    const data = await apiClient.customEvents.update(id, customEventData);
    setCustomEvents((prev) => prev.map((ce) => (ce.id === id ? data : ce)));
    return data;
  };

  const deleteCustomEvent = async (id: string): Promise<void> => {
    await apiClient.customEvents.delete(id);
    setCustomEvents((prev) => prev.filter((ce) => ce.id !== id));
  };

  return {
    customEvents,
    loading,
    error,
    refetch: fetchCustomEvents,
    createCustomEvent,
    updateCustomEvent,
    deleteCustomEvent,
  };
};
