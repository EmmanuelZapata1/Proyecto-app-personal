import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useNotes } from '@/contexts/notes';

export function NoteComposer() {
  const { createNote } = useNotes();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await createNote(body);
      setBody('');
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos guardar la nota. Inténtalo otra vez.');
    } finally {
      setSaving(false);
    }
  }

  return <View style={styles.composer}>
    <Text style={styles.label}>Nueva nota</Text>
    <TextInput
      accessibilityLabel="Contenido de la nota"
      multiline
      onChangeText={(value) => { setBody(value); setError(null); }}
      placeholder="Captura una idea antes de que se pierda."
      placeholderTextColor={colors.muted}
      style={styles.input}
      textAlignVertical="top"
      value={body}
    />
    <View style={styles.footer}>
      <Text style={styles.hint}>Las notas se guardan en tu cuenta.</Text>
      <Pressable accessibilityLabel="Guardar nota" disabled={saving} onPress={save} style={[styles.save, saving && styles.saveDisabled]}>
        <Text style={styles.saveText}>{saving ? 'Guardando' : 'Guardar'}</Text>
      </Pressable>
    </View>
    {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  composer: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, gap: 11, padding: 14 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 12, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 96, padding: 12 },
  footer: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  hint: { color: colors.muted, flex: 1, fontSize: 12, fontWeight: '600' },
  save: { alignItems: 'center', backgroundColor: colors.blue, borderRadius: 11, justifyContent: 'center', minHeight: 42, paddingHorizontal: 13 },
  saveDisabled: { opacity: 0.6 },
  saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '600' },
});
