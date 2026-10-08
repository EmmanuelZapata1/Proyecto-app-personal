import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSession } from '@/contexts/session';
import { apiRequest } from '@/lib/api';

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

  // El layout remonta este proveedor cuando cambia la sesión, así que no hay estado viejo que limpiar.
  useEffect(() => {
    if (!email) return;
    let active = true;
    apiRequest<{ tasks: PersonalTask[] }>('/api/tasks')
      .then((result) => {
        if (!active) return;
        setTasks(result.tasks);
        setError(null);
      })
      .catch((exception: unknown) => {
        if (active) setError(exception instanceof Error ? exception.message : 'No pudimos cargar tus tareas.');
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, [email]);

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
