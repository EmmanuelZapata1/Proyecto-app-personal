import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { HabitComposer } from '@/components/HabitComposer';
import { HabitRow } from '@/components/HabitRow';
import { NoteCard } from '@/components/NoteCard';
import { NoteComposer } from '@/components/NoteComposer';
import { Screen } from '@/components/Screen';
import { TaskComposer } from '@/components/TaskComposer';
import { PageTitle, Section } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useHabits, type Habit } from '@/contexts/habits';
import { useNotes, type Note } from '@/contexts/notes';
import { useTasks, type PersonalTask } from '@/contexts/tasks';

const collections = [
  { icon: 'checkmark-done-outline' as const, title: 'Tareas', color: colors.moss, tint: colors.mossSoft },
  { icon: 'document-text-outline' as const, title: 'Notas', color: colors.blue, tint: colors.blueSoft },
  { icon: 'repeat-outline' as const, title: 'Hábitos', color: colors.amber, tint: colors.amberSoft },
];

export default function OrganizeScreen() {
  const { tasks } = useTasks();
  const { habits, isReady: habitsReady, toggleHabit, removeHabit } = useHabits();
  const { notes, isReady: notesReady, removeNote } = useNotes();
  const doneToday = habits.filter((habit) => habit.doneToday).length;
  return (
    <Screen>
      <PageTitle title="Organizar" />
      <View style={styles.capture}>
        <View style={styles.captureIcon}>
          <Ionicons name="flash-outline" size={22} color={colors.amber} />
        </View>
        <View style={styles.captureCopy}>
          <Text style={styles.captureTitle}>Captura antes de olvidarlo</Text>
          <Text style={styles.captureText}>Una nota ahora puede convertirse en tarea después.</Text>
        </View>
      </View>
      <TaskComposer />
      <Section title="Tus espacios">
        <View style={styles.list}>
          {collections.map((collection) => (
            <View key={collection.title} style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: collection.tint }]}>
                <Ionicons name={collection.icon} size={21} color={collection.color} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{collection.title}</Text>
                <Text style={styles.itemDetail}>{detailFor(collection.title, tasks, notes, habits, doneToday)}</Text>
              </View>
              <Ionicons name="chevron-forward" color={colors.muted} size={19} />
            </View>
          ))}
        </View>
      </Section>
      <Section title="Hábitos de hoy" action={habits.length ? `${doneToday}/${habits.length}` : undefined}>
        {!habitsReady ? (
          <ActivityIndicator color={colors.moss} />
        ) : habits.length ? (
          <View style={styles.list}>
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onRemove={() => void removeHabit(habit.id)}
                onToggle={() => void toggleHabit(habit.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyHabits />
        )}
        <HabitComposer />
      </Section>
      <Section title="Notas" action={notes.length ? `${notes.length} guardadas` : undefined}>
        {!notesReady ? (
          <ActivityIndicator color={colors.blue} />
        ) : notes.length ? (
          <View style={styles.list}>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onRemove={() => void removeNote(note.id)} />
            ))}
          </View>
        ) : (
          <EmptyNotes />
        )}
        <NoteComposer />
      </Section>
    </Screen>
  );
}

function detailFor(title: string, tasks: PersonalTask[], notes: Note[], habits: Habit[], doneToday: number) {
  if (title === 'Tareas') return `${tasks.filter((task) => !task.completed).length} pendientes`;
  if (title === 'Notas') return `${notes.length} notas`;
  return `${doneToday} de ${habits.length} hechos hoy`;
}

function EmptyHabits() {
  return (
    <View style={styles.empty}>
      <Ionicons name="leaf-outline" color={colors.moss} size={24} />
      <View style={styles.itemCopy}>
        <Text style={styles.itemTitle}>Sin hábitos aún</Text>
        <Text style={styles.itemDetail}>Agrega uno pequeño y fácil de repetir.</Text>
      </View>
    </View>
  );
}

function EmptyNotes() {
  return (
    <View style={styles.empty}>
      <Ionicons name="document-text-outline" color={colors.blue} size={24} />
      <View style={styles.itemCopy}>
        <Text style={styles.itemTitle}>Sin notas todavía</Text>
        <Text style={styles.itemDetail}>Usa el campo de abajo para capturar la primera.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capture: { alignItems: 'center', backgroundColor: colors.amberSoft, borderRadius: 18, flexDirection: 'row', gap: 13, padding: 16 },
  captureIcon: { alignItems: 'center', backgroundColor: '#FFFFFFA8', borderRadius: 14, height: 46, justifyContent: 'center', width: 46 },
  captureCopy: { flex: 1, gap: 3 },
  captureTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  captureText: { color: '#70451C', fontSize: 13, lineHeight: 18 },
  list: { gap: 8 },
  item: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 76,
    paddingHorizontal: 14,
  },
  itemIcon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  itemCopy: { flex: 1, gap: 3 },
  itemTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  itemDetail: { color: colors.muted, fontSize: 13 },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 14,
  },
});
