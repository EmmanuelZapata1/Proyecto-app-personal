import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { Note } from '@/contexts/notes';

export function NoteCard({ note, onRemove }: { note: Note; onRemove: () => void }) {
  const edited = note.updatedAt !== note.createdAt;
  return (
    <View style={styles.card}>
      <Text style={styles.body}>{note.body}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{edited ? 'Editada' : 'Guardada'} · {formatDate(note.updatedAt)}</Text>
        <Pressable accessibilityLabel={`Eliminar nota: ${note.body.slice(0, 40)}`} hitSlop={8} onPress={onRemove} style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
          <Ionicons name="trash-outline" color={colors.muted} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  return sameDay ? `hoy ${time}` : `${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} ${time}`;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, gap: 12, padding: 16 },
  body: { color: colors.ink, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  footer: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  meta: { color: colors.muted, flex: 1, fontSize: 12, fontWeight: '600' },
  remove: { alignItems: 'center', height: 44, justifyContent: 'center', width: 40 },
  pressed: { opacity: 0.72 },
});
