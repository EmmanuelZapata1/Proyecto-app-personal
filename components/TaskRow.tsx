import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export type Task = { id: string; title: string; time?: string; tag: string; done: boolean };

export function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityLabel={`Marcar ${task.title} como ${task.done ? 'pendiente' : 'hecha'}`} accessibilityRole="checkbox" accessibilityState={{ checked: task.done }} onPress={onToggle} style={[styles.check, task.done && styles.checked]}>
        {task.done && <Ionicons name="checkmark" color="#FFFFFF" size={16} />}
      </Pressable>
      <View style={styles.copy}><Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text><Text style={styles.taskMeta}>{task.time ? `${task.time} · ` : ''}{task.tag}</Text></View>
      <Ionicons name="ellipsis-horizontal" color={colors.muted} size={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, minHeight: 72, paddingHorizontal: 14 },
  check: { alignItems: 'center', borderColor: colors.moss, borderRadius: 12, borderWidth: 2, height: 28, justifyContent: 'center', width: 28 },
  checked: { backgroundColor: colors.moss },
  copy: { flex: 1, gap: 4 },
  taskTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  taskDone: { color: colors.muted, textDecorationLine: 'line-through' },
  taskMeta: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});
