import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSession } from '@/contexts/session';
import { apiRequest } from '@/lib/api';

export type InventoryKind = 'proyecto' | 'hardware' | 'software' | 'servicio';

export type InventoryItem = {
  id: string;
  kind: InventoryKind;
  name: string;
  detail: string | null;
  renewsOn: string | null;
};

export type NewInventoryItem = Omit<InventoryItem, 'id'>;

type InventoryContextValue = {
  items: InventoryItem[];
  isReady: boolean;
  error: string | null;
  createItem: (item: NewInventoryItem) => Promise<void>;
  updateItem: (id: string, item: NewInventoryItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export function InventoryProvider({ children }: PropsWithChildren) {
  const { email } = useSession();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El layout remonta este proveedor cuando cambia la sesión, así que no hay estado viejo que limpiar.
  useEffect(() => {
    if (!email) return;
    let active = true;
    apiRequest<{ items: InventoryItem[] }>('/api/inventory')
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setError(null);
      })
      .catch((exception: unknown) => {
        if (active) setError(exception instanceof Error ? exception.message : 'No pudimos cargar tus registros.');
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, [email]);

  const createItem = useCallback(async ({ kind, name, detail, renewsOn }: NewInventoryItem) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Escribe un nombre antes de guardar.');
    const result = await apiRequest<{ item: InventoryItem }>('/api/inventory', {
      method: 'POST',
      body: { kind, name: trimmedName, detail: detail?.trim() || null, renewsOn: renewsOn || null },
    });
    setItems((current) => [...current, result.item]);
  }, []);

  const updateItem = useCallback(async (id: string, { kind, name, detail, renewsOn }: NewInventoryItem) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('El nombre no puede quedar vacío.');
    const previous = items;
    const next: InventoryItem = { id, kind, name: trimmedName, detail: detail?.trim() || null, renewsOn: renewsOn || null };
    setItems((current) => current.map((item) => (item.id === id ? next : item)));
    try {
      await apiRequest(`/api/inventory/${id}`, { method: 'PATCH', body: next });
    } catch (exception) {
      setItems(previous);
      throw exception;
    }
  }, [items]);

  const removeItem = useCallback(async (id: string) => {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await apiRequest(`/api/inventory/${id}`, { method: 'DELETE' });
    } catch (exception) {
      setItems(previous);
      throw exception;
    }
  }, [items]);

  const value = useMemo(
    () => ({ items, isReady, error, createItem, updateItem, removeItem }),
    [items, isReady, error, createItem, updateItem, removeItem],
  );
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory debe usarse dentro de InventoryProvider.');
  return context;
}
