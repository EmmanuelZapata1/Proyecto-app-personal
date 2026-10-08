import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { TaskComposer } from '@/components/TaskComposer';
import { TaskRow } from '@/components/TaskRow';
import { PageTitle, Pill, Section } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useHabits } from '@/contexts/habits';
import { useNews } from '@/contexts/news';
import { useTasks } from '@/contexts/tasks';

export default function TodayScreen() {
  const { tasks, isReady, toggleTask } = useTasks();
  const { habits } = useHabits();
  const { articles } = useNews();
  const [showComposer, setShowComposer] = useState(false);
  const today = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', weekday: 'long' })
    .format(new Date())
    .toUpperCase();
  const completed = tasks.filter((task) => task.completed).length;
  const habitsDone = habits.filter((habit) => habit.doneToday).length;
  const dayAgo = Date.now() - 86400000;
  const recentNews = articles.filter((article) => article.publishedAt && new Date(article.publishedAt).getTime() >= dayAgo).length;

  return <Screen>
    <PageTitle eyebrow={today} title="Buen día" />

    <View style={styles.focusCard}>
      <View style={styles.focusHead}><View><Text style={styles.focusLabel}>ENFOQUE DEL DÍA</Text><Text style={styles.focusTitle}>Termina lo esencial.</Text></View><View style={styles.progress}><Text style={styles.progressText}>{completed}/{tasks.length}</Text></View></View>
      <Text style={styles.focusCopy}>Empieza por una acción que mueva tu proyecto personal.</Text>
      <Pill label="Prioridad principal" tone="amber" />
    </View>

    <Section title="Para hoy" action="Ver todo" onAction={() => router.navigate('/organize')}>
      {!isReady ? <ActivityIndicator color={colors.moss} /> : tasks.length ? <View style={styles.taskList}>{tasks.map((task) => <TaskRow key={task.id} task={{ id: task.id, title: task.title, tag: task.tag, done: task.completed }} onToggle={() => void toggleTask(task.id)} />)}</View> : <EmptyTasks />}
      {showComposer ? <TaskComposer onSaved={() => setShowComposer(false)} /> : <Pressable accessibilityRole="button" onPress={() => setShowComposer(true)} style={styles.newTask}><Text style={styles.newTaskText}>+ Nueva tarea</Text></Pressable>}
    </Section>

    <Section title="Un vistazo">
      <View style={styles.glanceGrid}>
        <View style={[styles.glance, { backgroundColor: colors.mossSoft }]}><Ionicons name="leaf-outline" size={22} color={colors.moss} /><Text style={styles.glanceNumber}>{habits.length ? `${habitsDone}/${habits.length}` : '0'}</Text><Text style={styles.glanceLabel}>hábitos</Text></View>
        <View style={[styles.glance, { backgroundColor: colors.blueSoft }]}><Ionicons name="newspaper-outline" size={22} color={colors.blue} /><Text style={styles.glanceNumber}>{recentNews}</Text><Text style={styles.glanceLabel}>noticias en 24 h</Text></View>
      </View>
    </Section>
  </Screen>;
}

function EmptyTasks() {
  return <View style={styles.empty}><Ionicons name="checkmark-done-outline" color={colors.moss} size={24} /><View style={styles.emptyCopy}><Text style={styles.emptyTitle}>Tu lista está libre</Text><Text style={styles.emptyText}>Agrega la primera tarea que quieras resolver hoy.</Text></View></View>;
}

const styles = StyleSheet.create({
  focusCard: { backgroundColor: colors.ink, borderRadius: 20, gap: 18, padding: 20 },
  focusHead: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  focusLabel: { color: '#BBD7C5', fontSize: 12, fontWeight: '800', letterSpacing: 0.45 },
  focusTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.35, marginTop: 5 },
  focusCopy: { color: '#D9E2DC', fontSize: 14, lineHeight: 20 },
  progress: { alignItems: 'center', backgroundColor: '#385A48', borderRadius: 999, height: 46, justifyContent: 'center', width: 46 },
  progressText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  taskList: { gap: 8 },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, flexDirection: 'row', gap: 12, minHeight: 80, paddingHorizontal: 15 },
  emptyCopy: { flex: 1, gap: 3 },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  newTask: { alignSelf: 'flex-start', minHeight: 48, justifyContent: 'center', paddingHorizontal: 4 },
  newTaskText: { color: colors.moss, fontSize: 14, fontWeight: '800', paddingVertical: 12 },
  glanceGrid: { flexDirection: 'row', gap: 12 },
  glance: { borderRadius: 16, flex: 1, gap: 4, minHeight: 128, padding: 16 },
  glanceNumber: { color: colors.ink, fontSize: 24, fontWeight: '800', marginTop: 8 },
  glanceLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
