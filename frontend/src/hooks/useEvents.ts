import { useState, useEffect, useCallback } from 'react';
import { Event, EventCreate, EventUpdate } from '../types';
import { apiClient } from '../api/client';

export const useEvents = (dogId?: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.events.getAll(dogId);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (event: EventCreate): Promise<Event> => {
    const newEvent = await apiClient.events.create(event);
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = async (id: string, event: EventUpdate): Promise<Event> => {
    const updatedEvent = await apiClient.events.update(id, event);
    setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    return updatedEvent;
  };

  const deleteEvent = async (id: string): Promise<void> => {
    await apiClient.events.delete(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
