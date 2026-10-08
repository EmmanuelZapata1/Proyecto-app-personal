import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useTasks } from '@/contexts/tasks';

const tags = ['Personal', 'Proyecto', 'Tech'];

export function TaskComposer({ onSaved }: { onSaved?: () => void }) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState(tags[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await createTask({ title, tag });
      setTitle('');
      onSaved?.();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos guardar la tarea. Inténtalo otra vez.');
    } finally {
      setSaving(false);
    }
  }

  return <View style={styles.composer}>
    <Text style={styles.label}>Nueva tarea</Text>
    <TextInput accessibilityLabel="Título de la tarea" onChangeText={(value) => { setTitle(value); setError(null); }} onSubmitEditing={save} placeholder="¿Qué necesitas hacer?" placeholderTextColor={colors.muted} returnKeyType="done" style={styles.input} value={title} />
    <View style={styles.footer}>
      <View style={styles.tags}>{tags.map((item) => <Pressable key={item} onPress={() => setTag(item)} style={[styles.tag, tag === item && styles.tagSelected]}><Text style={[styles.tagText, tag === item && styles.tagTextSelected]}>{item}</Text></Pressable>)}</View>
      <Pressable accessibilityLabel="Guardar tarea" disabled={saving} onPress={save} style={[styles.save, saving && styles.saveDisabled]}><Text style={styles.saveText}>{saving ? 'Guardando' : 'Guardar'}</Text></Pressable>
    </View>
    {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  composer: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, gap: 11, padding: 14 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 12, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 48, paddingHorizontal: 12 },
  footer: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  tags: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderColor: colors.line, borderRadius: 999, borderWidth: 1, justifyContent: 'center', minHeight: 36, paddingHorizontal: 10 },
  tagSelected: { backgroundColor: colors.mossSoft, borderColor: colors.moss },
  tagText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  tagTextSelected: { color: colors.moss },
  save: { alignItems: 'center', backgroundColor: colors.moss, borderRadius: 11, justifyContent: 'center', minHeight: 42, paddingHorizontal: 13 },
  saveDisabled: { opacity: 0.6 },
  saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '600' },
});
