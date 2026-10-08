import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSession } from '@/contexts/session';
import { apiRequest } from '@/lib/api';

export type Note = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type NotesContextValue = {
  notes: Note[];
  isReady: boolean;
  error: string | null;
  createNote: (body: string) => Promise<void>;
  updateNote: (id: string, body: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export function NotesProvider({ children }: PropsWithChildren) {
  const { email } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El layout remonta este proveedor cuando cambia la sesión, así que no hay estado viejo que limpiar.
  useEffect(() => {
    if (!email) return;
    let active = true;
    apiRequest<{ notes: Note[] }>('/api/notes')
      .then((result) => {
        if (!active) return;
        setNotes(result.notes);
        setError(null);
      })
      .catch((exception: unknown) => {
        if (active) setError(exception instanceof Error ? exception.message : 'No pudimos cargar tus notas.');
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, [email]);

  const createNote = useCallback(async (body: string) => {
    const trimmedBody = body.trim();
    if (!trimmedBody) throw new Error('Escribe algo antes de guardar la nota.');
    const result = await apiRequest<{ note: Note }>('/api/notes', { method: 'POST', body: { body: trimmedBody } });
    setNotes((current) => [result.note, ...current]);
  }, []);

  const updateNote = useCallback(
    async (id: string, body: string) => {
      const trimmedBody = body.trim();
      if (!trimmedBody) throw new Error('Una nota no puede quedar vacía.');
      const previous = notes;
      setNotes((current) =>
        current.map((note) => (note.id === id ? { ...note, body: trimmedBody, updatedAt: new Date().toISOString() } : note)),
      );
      try {
        await apiRequest(`/api/notes/${id}`, { method: 'PATCH', body: { body: trimmedBody } });
      } catch (exception) {
        setNotes(previous);
        throw exception;
      }
    },
    [notes],
  );

  const removeNote = useCallback(
    async (id: string) => {
      const previous = notes;
      setNotes((current) => current.filter((note) => note.id !== id));
      try {
        await apiRequest(`/api/notes/${id}`, { method: 'DELETE' });
      } catch (exception) {
        setNotes(previous);
        throw exception;
      }
    },
    [notes],
  );

  const value = useMemo(
    () => ({ notes, isReady, error, createNote, updateNote, removeNote }),
    [notes, isReady, error, createNote, updateNote, removeNote],
  );
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes debe usarse dentro de NotesProvider.');
  return context;
}
