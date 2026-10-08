import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { PageTitle, Section } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useSession } from '@/contexts/session';

export default function ProfileScreen() {
  const { email, logout } = useSession();
  const initial = (email || 'T')[0].toUpperCase();

  function exit() {
    logout();
    router.replace('/sign-in');
  }

  // Alert.alert no hace nada en react-native-web, así que en web usamos el diálogo del navegador.
  function confirmLogout() {
    const message = 'Volverás a la pantalla de acceso. Tus datos quedan guardados en el servidor.';
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Cerrar sesión\n\n${message}`)) exit();
      return;
    }
    Alert.alert('Cerrar sesión', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: exit },
    ]);
  }

  return (
    <Screen>
      <PageTitle title="Perfil" />
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.identityTitle}>{email || 'Sin sesión'}</Text>
          <Text style={styles.identityText}>Sincronizado con tu servidor</Text>
        </View>
      </View>
      <Section title="Preferencias">
        <View style={styles.settings}>
          <Setting icon="moon-outline" title="Tema del sistema" accessory={<Text style={styles.accessory}>Automático</Text>} />
        </View>
      </Section>
      <Section title="Cuenta">
        <Pressable onPress={confirmLogout} style={({ pressed }) => [styles.dataRow, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" color={colors.danger} size={21} />
          <Text style={[styles.dataText, { color: colors.danger }]}>Cerrar sesión</Text>
        </Pressable>
      </Section>
    </Screen>
  );
}

function Setting({ icon, title, accessory }: { icon: keyof typeof Ionicons.glyphMap; title: string; accessory: ReactNode }) {
  return (
    <View style={styles.setting}>
      <Ionicons name={icon} color={colors.moss} size={21} />
      <Text style={styles.settingTitle}>{title}</Text>
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', backgroundColor: colors.mossSoft, borderRadius: 18, flexDirection: 'row', gap: 13, padding: 16 },
  avatar: { alignItems: 'center', backgroundColor: colors.moss, borderRadius: 16, height: 50, justifyContent: 'center', width: 50 },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  identityCopy: { flex: 1, gap: 3 },
  identityTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  identityText: { color: '#456856', fontSize: 13, marginTop: 3 },
  settings: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 15, borderWidth: 1, overflow: 'hidden' },
  setting: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 15,
  },
  settingTitle: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '700' },
  accessory: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  dataRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 15,
  },
  dataText: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
