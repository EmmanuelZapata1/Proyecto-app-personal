import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function PageTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <View style={styles.titleRow}><View style={styles.titleBlock}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.pageTitle}>{title}</Text></View>{action}</View>;
}

export function Section({ title, action, children }: PropsWithChildren<{ title: string; action?: string }>) {
  return <View style={styles.section}><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text>{action && <Text style={styles.sectionAction}>{action}</Text>}</View>{children}</View>;
}

export function IconButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return <Pressable accessibilityLabel={label} hitSlop={8} onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><Ionicons name={icon} size={21} color={colors.ink} /></Pressable>;
}

export function AddButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Ionicons name="add" color="#FFFFFF" size={20} /><Text style={styles.addText}>{label}</Text></Pressable>;
}

export function Pill({ label, tone = 'moss' }: { label: string; tone?: 'moss' | 'amber' | 'blue' }) {
  return <View style={[styles.pill, tone === 'amber' && styles.amberPill, tone === 'blue' && styles.bluePill]}><Text style={[styles.pillText, tone === 'amber' && styles.amberText, tone === 'blue' && styles.blueText]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  titleBlock: { gap: 4 },
  eyebrow: { color: colors.moss, fontWeight: '800', fontSize: 13, letterSpacing: 0.35 },
  pageTitle: { color: colors.ink, fontSize: 31, lineHeight: 38, fontWeight: '800', letterSpacing: -0.6 },
  section: { gap: 12 },
  sectionHeading: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  sectionAction: { color: colors.moss, fontSize: 13, fontWeight: '800' },
  iconButton: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  addButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.moss, borderRadius: 14, flexDirection: 'row', gap: 7, minHeight: 48, paddingHorizontal: 16 },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.72 },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.mossSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { color: colors.moss, fontSize: 12, fontWeight: '800' },
  amberPill: { backgroundColor: colors.amberSoft },
  amberText: { color: colors.amber },
  bluePill: { backgroundColor: colors.blueSoft },
  blueText: { color: colors.blue },
});
