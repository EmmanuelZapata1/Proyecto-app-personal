import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useHabits } from '@/contexts/habits';

export function HabitComposer() {
  const { createHabit } = useHabits();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await createHabit(name);
      setName('');
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos guardar el hábito. Inténtalo otra vez.');
    } finally {
      setSaving(false);
    }
  }

  return <View style={styles.composer}>
    <Text style={styles.label}>Nuevo hábito</Text>
    <View style={styles.row}>
      <TextInput
        accessibilityLabel="Nombre del hábito"
        onChangeText={(value) => { setName(value); setError(null); }}
        onSubmitEditing={save}
        placeholder="¿Qué quieres mantener?"
        placeholderTextColor={colors.muted}
        returnKeyType="done"
        style={styles.input}
        value={name}
      />
      <Pressable accessibilityLabel="Guardar hábito" disabled={saving} onPress={save} style={[styles.save, saving && styles.saveDisabled]}>
        <Text style={styles.saveText}>{saving ? 'Guardando' : 'Guardar'}</Text>
      </Pressable>
    </View>
    {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  composer: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, gap: 11, padding: 14 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 12, borderWidth: 1, color: colors.ink, flex: 1, fontSize: 15, minHeight: 48, paddingHorizontal: 12 },
  save: { alignItems: 'center', backgroundColor: colors.moss, borderRadius: 11, justifyContent: 'center', minHeight: 42, paddingHorizontal: 13 },
  saveDisabled: { opacity: 0.6 },
  saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '600' },
});
