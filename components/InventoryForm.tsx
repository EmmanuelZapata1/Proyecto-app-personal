import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { InventoryKind } from '@/contexts/inventory';

export const kinds: { value: InventoryKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'proyecto', label: 'Proyecto', icon: 'git-branch-outline' },
  { value: 'hardware', label: 'Equipo', icon: 'laptop-outline' },
  { value: 'software', label: 'Software', icon: 'code-slash-outline' },
  { value: 'servicio', label: 'Servicio', icon: 'globe-outline' },
];

export function InventoryForm({ onSave, onCancel }: { onSave: (value: { kind: InventoryKind; name: string; detail: string; renewsOn: string }) => Promise<void>; onCancel: () => void }) {
  const [kind, setKind] = useState<InventoryKind>('proyecto');
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [renewsOn, setRenewsOn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ kind, name, detail, renewsOn });
      setName(''); setDetail(''); setRenewsOn('');
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos guardar el registro. Inténtalo otra vez.');
    } finally {
      setSaving(false);
    }
  }

  return <View style={styles.form}>
    <Text style={styles.label}>Tipo</Text>
    <View style={styles.kinds}>{kinds.map((option) => <Pressable key={option.value} onPress={() => setKind(option.value)} style={[styles.kind, kind === option.value && styles.kindSelected]}><Ionicons name={option.icon} color={kind === option.value ? colors.moss : colors.muted} size={15} /><Text style={[styles.kindText, kind === option.value && styles.kindTextSelected]}>{option.label}</Text></Pressable>)}</View>
    <TextInput accessibilityLabel="Nombre" onChangeText={(value) => { setName(value); setError(null); }} placeholder="Nombre" placeholderTextColor={colors.muted} style={styles.input} value={name} />
    <TextInput accessibilityLabel="Detalle" onChangeText={setDetail} placeholder="Detalle (opcional)" placeholderTextColor={colors.muted} style={styles.input} value={detail} />
    <TextInput accessibilityLabel="Fecha de renovación" onChangeText={setRenewsOn} placeholder="Renueva (AAAA-MM-DD, opcional)" placeholderTextColor={colors.muted} style={styles.input} value={renewsOn} />
    {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    <View style={styles.actions}>
      <Pressable accessibilityLabel="Cancelar" onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
      <Pressable accessibilityLabel="Guardar registro" disabled={saving} onPress={() => void submit()} style={[styles.save, saving && styles.saveDisabled]}><Text style={styles.saveText}>{saving ? 'Guardando' : 'Guardar'}</Text></Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  form: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, gap: 10, padding: 14 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kind: { alignItems: 'center', borderColor: colors.line, borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 38, paddingHorizontal: 11 },
  kindSelected: { backgroundColor: colors.mossSoft, borderColor: colors.moss },
  kindText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  kindTextSelected: { color: colors.moss },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 12, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 46, paddingHorizontal: 12 },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancel: { alignItems: 'center', justifyContent: 'center', minHeight: 42, paddingHorizontal: 13 },
  cancelText: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  save: { alignItems: 'center', backgroundColor: colors.moss, borderRadius: 11, justifyContent: 'center', minHeight: 42, paddingHorizontal: 15 },
  saveDisabled: { opacity: 0.6 },
  saveText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  error: { color: colors.danger, fontSize: 12, fontWeight: '600' },
});
