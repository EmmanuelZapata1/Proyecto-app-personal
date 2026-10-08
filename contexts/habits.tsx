import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSession } from '@/contexts/session';
import { apiRequest, getToken } from '@/lib/api';

export type Habit = {
  id: string;
  name: string;
  doneToday: boolean;
};

type HabitsContextValue = {
  habits: Habit[];
  isReady: boolean;
  error: string | null;
  createHabit: (name: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
};

// Fecha local del dispositivo; el servidor la usa para decidir qué es "hoy".
function localDay() {
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export function HabitsProvider({ children }: PropsWithChildren) {
  const { email } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      const requestToken = getToken();
      const result = await apiRequest<{ habits: Habit[] }>(`/api/habits?day=${localDay()}`);
      // Si la sesión cambió mientras llegaba la respuesta, la descartamos.
      if (getToken() !== requestToken) return;
      setHabits(result.habits);
      setError(null);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos cargar tus hábitos.');
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!email) {
      setHabits([]);
      setError(null);
      setIsReady(false);
      return;
    }
    void loadHabits();
  }, [email, loadHabits]);

  const createHabit = useCallback(async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Escribe un hábito antes de guardarlo.');
    const result = await apiRequest<{ habit: Habit }>('/api/habits', { method: 'POST', body: { name: trimmedName } });
    setHabits((current) => [...current, result.habit]);
  }, []);

  const toggleHabit = useCallback(async (id: string) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;
    const doneToday = !habit.doneToday;
    setHabits((current) => current.map((item) => (item.id === id ? { ...item, doneToday } : item)));
    try {
      const result = await apiRequest<{ id: string; doneToday: boolean }>(`/api/habits/${id}/toggle`, { method: 'POST', body: { day: localDay() } });
      setHabits((current) => current.map((item) => (item.id === id ? { ...item, doneToday: result.doneToday } : item)));
    } catch (exception) {
      setHabits((current) => current.map((item) => (item.id === id ? { ...item, doneToday: !doneToday } : item)));
      throw exception;
    }
  }, [habits]);

  const removeHabit = useCallback(async (id: string) => {
    const previous = habits;
    setHabits((current) => current.filter((item) => item.id !== id));
    try {
      await apiRequest(`/api/habits/${id}`, { method: 'DELETE' });
    } catch (exception) {
      setHabits(previous);
      throw exception;
    }
  }, [habits]);

  const value = useMemo(
    () => ({ habits, isReady, error, createHabit, toggleHabit, removeHabit }),
    [habits, isReady, error, createHabit, toggleHabit, removeHabit],
  );
  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) throw new Error('useHabits debe usarse dentro de HabitsProvider.');
  return context;
}
