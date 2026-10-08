import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useSession } from '@/contexts/session';

export default function Gate() {
  const { email, isReady } = useSession();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.moss} size="large" />
        <Text style={styles.loadingText}>Preparando tu espacio…</Text>
      </View>
    );
  }

  if (!email) return <Redirect href="/sign-in" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: 14, justifyContent: 'center' },
  loadingText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
});
