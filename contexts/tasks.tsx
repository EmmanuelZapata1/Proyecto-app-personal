import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSession } from '@/contexts/session';
import { apiRequest, getToken } from '@/lib/api';

export type PersonalTask = {
  id: string;
  title: string;
  tag: string;
  dueAt: string | null;
  completed: boolean;
};

type NewTask = Pick<PersonalTask, 'title' | 'tag'>;

type TasksContextValue = {
  tasks: PersonalTask[];
  isReady: boolean;
  error: string | null;
  createTask: (task: NewTask) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function TasksProvider({ children }: PropsWithChildren) {
  const { email } = useSession();
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const requestToken = getToken();
      const result = await apiRequest<{ tasks: PersonalTask[] }>('/api/tasks');
      // Si la sesión cambió mientras llegaba la respuesta, la descartamos.
      if (getToken() !== requestToken) return;
      setTasks(result.tasks);
      setError(null);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos cargar tus tareas.');
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!email) {
      setTasks([]);
      setError(null);
      setIsReady(false);
      return;
    }
    void loadTasks();
  }, [email, loadTasks]);

  const createTask = useCallback(async ({ title, tag }: NewTask) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error('Escribe una tarea antes de guardarla.');
    const result = await apiRequest<{ task: PersonalTask }>('/api/tasks', { method: 'POST', body: { title: trimmedTitle, tag } });
    setTasks((current) => [result.task, ...current]);
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const completed = !task.completed;
    setTasks((current) => current.map((item) => (item.id === id ? { ...item, completed } : item)));
    try {
      await apiRequest(`/api/tasks/${id}`, { method: 'PATCH', body: { completed } });
    } catch (exception) {
      setTasks((current) => current.map((item) => (item.id === id ? { ...item, completed: !completed } : item)));
      throw exception;
    }
  }, [tasks]);

  const removeTask = useCallback(async (id: string) => {
    const previous = tasks;
    setTasks((current) => current.filter((item) => item.id !== id));
    try {
      await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (exception) {
      setTasks(previous);
      throw exception;
    }
  }, [tasks]);

  const value = useMemo(
    () => ({ tasks, isReady, error, createTask, toggleTask, removeTask }),
    [tasks, isReady, error, createTask, toggleTask, removeTask],
  );
  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks debe usarse dentro de TasksProvider.');
  return context;
}
