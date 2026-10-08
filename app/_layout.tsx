import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { HabitsProvider } from '@/contexts/habits';
import { InventoryProvider } from '@/contexts/inventory';
import { NewsProvider } from '@/contexts/news';
import { NotesProvider } from '@/contexts/notes';
import { SessionProvider } from '@/contexts/session';
import { TasksProvider } from '@/contexts/tasks';

export default function RootLayout() {
  return (
    <SessionProvider>
      <TasksProvider>
        <HabitsProvider>
          <NotesProvider>
            <InventoryProvider>
              <NewsProvider>
                <StatusBar style="dark" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="sign-in" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </NewsProvider>
            </InventoryProvider>
          </NotesProvider>
        </HabitsProvider>
      </TasksProvider>
    </SessionProvider>
  );
}
