import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Habit } from '@/contexts/habits';
import { colors } from '@/constants/theme';

export function HabitRow({ habit, onToggle, onRemove }: { habit: Habit; onToggle: () => void; onRemove: () => void }) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel={`Marcar ${habit.name} como ${habit.doneToday ? 'pendiente' : 'hecho'}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: habit.doneToday }}
        onPress={onToggle}
        style={[styles.check, habit.doneToday && styles.checked]}
      >
        {habit.doneToday && <Ionicons name="checkmark" color="#FFFFFF" size={16} />}
      </Pressable>
      <View style={styles.copy}>
        <Text style={[styles.name, habit.doneToday && styles.done]}>{habit.name}</Text>
        <Text style={styles.meta}>{habit.doneToday ? 'Completado hoy' : 'Pendiente'}</Text>
      </View>
      <Pressable
        accessibilityLabel={`Eliminar ${habit.name}`}
        hitSlop={8}
        onPress={onRemove}
        style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
      >
        <Ionicons name="trash-outline" color={colors.muted} size={19} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 14,
  },
  check: {
    alignItems: 'center',
    borderColor: colors.moss,
    borderRadius: 12,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checked: { backgroundColor: colors.moss },
  copy: { flex: 1, gap: 4 },
  name: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  done: { color: colors.muted, textDecorationLine: 'line-through' },
  meta: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  remove: { alignItems: 'center', height: 48, justifyContent: 'center', width: 40 },
  pressed: { opacity: 0.72 },
});
