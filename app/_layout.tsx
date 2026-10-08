import { Stack } from 'expo-router';
import { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';

import { HabitsProvider } from '@/contexts/habits';
import { InventoryProvider } from '@/contexts/inventory';
import { NewsProvider } from '@/contexts/news';
import { NotesProvider } from '@/contexts/notes';
import { SessionProvider, useSession } from '@/contexts/session';
import { TasksProvider } from '@/contexts/tasks';

export default function RootLayout() {
  return (
    <SessionProvider>
      <UserDataProviders>
        <NewsProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </NewsProvider>
      </UserDataProviders>
    </SessionProvider>
  );
}

// Al cambiar de usuario (o cerrar sesión) la key cambia y React descarta los datos del anterior.
function UserDataProviders({ children }: PropsWithChildren) {
  const { email } = useSession();
  return (
    <TasksProvider key={email ?? 'sin-sesion'}>
      <HabitsProvider>
        <NotesProvider>
          <InventoryProvider>{children}</InventoryProvider>
        </NotesProvider>
      </HabitsProvider>
    </TasksProvider>
  );
}
