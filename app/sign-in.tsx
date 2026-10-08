import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useSession } from '@/contexts/session';

export default function SignInScreen() {
  const { email: sessionEmail, login, register, isAuthenticating, error } = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  async function submit() {
    if (isAuthenticating) return;
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Completa tu correo y contraseña.');
      return;
    }
    try {
      await (isRegister ? register(email, password) : login(email, password));
    } catch {
      return;
    }
  }

  if (sessionEmail) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.badge}><Ionicons name="cube-outline" color={colors.moss} size={20} /></View>
        <Text style={styles.title}>Nexo</Text>
        <Text style={styles.subtitle}>Tu centro de mando personal. Entra para sincronizar tus datos.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.modes}>
          <Pressable accessibilityRole="button" onPress={() => setMode('login')} style={[styles.mode, mode === 'login' && styles.modeActive]}>
            <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Entrar</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setMode('register')} style={[styles.mode, mode === 'register' && styles.modeActive]}>
            <Text style={[styles.modeText, mode === 'register' && styles.modeTextActive]}>Crear cuenta</Text>
          </Pressable>
        </View>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={(value) => { setEmail(value); setLocalError(null); }}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={(value) => { setPassword(value); setLocalError(null); }}
          onSubmitEditing={() => void submit()}
          placeholder="contraseña"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {(localError || error) ? <Text accessibilityLiveRegion="polite" style={styles.error}>{localError || error}</Text> : null}

        <Pressable accessibilityLabel={isRegister ? 'Crear cuenta' : 'Entrar'} disabled={isAuthenticating} onPress={() => void submit()} style={[styles.submit, isAuthenticating && styles.submitDisabled]}>
          {isAuthenticating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>{isRegister ? 'Crear cuenta' : 'Entrar'}</Text>}
        </Pressable>
      </View>

      <Text style={styles.footnote}>Mínimo 8 caracteres. Tus datos viven en tu servidor.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, gap: 24, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', gap: 10 },
  badge: { alignItems: 'center', backgroundColor: colors.mossSoft, borderRadius: 18, height: 56, justifyContent: 'center', width: 56 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, maxWidth: 300, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 20, borderWidth: 1, gap: 11, padding: 18 },
  modes: { backgroundColor: colors.background, borderRadius: 12, flexDirection: 'row', gap: 4, padding: 4 },
  mode: { alignItems: 'center', borderRadius: 9, flex: 1, justifyContent: 'center', minHeight: 40 },
  modeActive: { backgroundColor: colors.surface },
  modeText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  modeTextActive: { color: colors.ink },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 12, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 50, paddingHorizontal: 13 },
  error: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  submit: { alignItems: 'center', backgroundColor: colors.moss, borderRadius: 12, justifyContent: 'center', minHeight: 50 },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  footnote: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});
