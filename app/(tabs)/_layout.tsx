import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';

import { colors } from '@/constants/theme';
import { useSession } from '@/contexts/session';

const iconByRoute: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'today-outline',
  organize: 'checkbox-outline',
  news: 'newspaper-outline',
  tech: 'hardware-chip-outline',
  profile: 'person-circle-outline',
};

export default function TabLayout() {
  const { email, isReady } = useSession();

  // Si la sesión se cierra o expira, volvemos al acceso.
  if (isReady && !email) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 72,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={iconByRoute[route.name]} size={size} />
        ),
      })}>
      <Tabs.Screen name="index" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="organize" options={{ title: 'Organizar' }} />
      <Tabs.Screen name="news" options={{ title: 'Noticias' }} />
      <Tabs.Screen name="tech" options={{ title: 'Tech' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
