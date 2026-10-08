import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { InventoryForm, kinds } from '@/components/InventoryForm';
import { Screen } from '@/components/Screen';
import { AddButton, PageTitle, Pill, Section } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useInventory, type InventoryItem, type InventoryKind } from '@/contexts/inventory';

export default function TechScreen() {
  const { items, isReady, createItem } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const upcoming = items.filter((item) => item.renewsOn).slice(0, 3);

  return (
    <Screen>
      <PageTitle eyebrow="CENTRO TÉCNICO" title="Tech" />

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TU ECOSISTEMA</Text>
        <Text style={styles.heroTitle}>Proyectos, equipos{`\n`}y renovaciones.</Text>
        <Text style={styles.heroCopy}>Sin convertirlo en una consola empresarial.</Text>
      </View>

      <Section title="Vencimientos" action={upcoming.length ? `${upcoming.length}` : undefined}>
        {upcoming.length ? (
          upcoming.map((item) => <Renewal key={item.id} item={item} />)
        ) : (
          <Text style={styles.muted}>Nada por vencer. Agrega una fecha y lo vigilarás aquí.</Text>
        )}
      </Section>

      <Section title="Registros" action={items.length ? `${items.length}` : undefined}>
        {!isReady ? (
          <ActivityIndicator color={colors.moss} />
        ) : items.length ? (
          <View style={styles.list}>
            {items.map((item) => (
              <InventoryRow key={item.id} item={item} />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>Sin registros todavía.</Text>
        )}
      </Section>

      {showForm ? (
        <InventoryForm
          onCancel={() => setShowForm(false)}
          onSave={async (value) => {
            await createItem(value);
            setShowForm(false);
          }}
        />
      ) : (
        <AddButton label="Agregar registro" onPress={() => setShowForm(true)} />
      )}
    </Screen>
  );
}

function Renewal({ item }: { item: InventoryItem }) {
  const days = daysUntil(item.renewsOn);
  const tone = days !== null && days <= 30 ? 'amber' : 'blue';
  return (
    <View style={styles.renewal}>
      <View style={[styles.renewalIcon, { backgroundColor: tone === 'amber' ? colors.amberSoft : colors.blueSoft }]}>
        <Ionicons name="time-outline" color={tone === 'amber' ? colors.amber : colors.blue} size={20} />
      </View>
      <View style={styles.entryCopy}>
        <Text style={styles.entryTitle}>{item.name}</Text>
        <Text style={styles.entrySub}>{item.renewsOn}</Text>
      </View>
      <Pill label={days === null ? 'Sin fecha' : days <= 0 ? 'Vencido' : `${days} días`} tone={tone} />
    </View>
  );
}

function InventoryRow({ item }: { item: InventoryItem }) {
  const meta = kinds.find((option) => option.value === item.kind);
  return (
    <View style={styles.entry}>
      <View style={styles.entryIcon}>
        <Ionicons name={meta?.icon ?? 'pricetag-outline'} size={21} color={colors.ink} />
      </View>
      <View style={styles.entryCopy}>
        <Text style={styles.entryTitle}>{item.name}</Text>
        <Text style={styles.entrySub}>{item.detail ?? labelFor(item.kind)}</Text>
      </View>
      <Pill label={labelFor(item.kind)} tone={toneFor(item.kind)} />
    </View>
  );
}

function labelFor(kind: InventoryKind) {
  return kinds.find((option) => option.value === kind)?.label ?? 'Registro';
}

function toneFor(kind: InventoryKind) {
  if (kind === 'proyecto') return 'moss' as const;
  if (kind === 'hardware') return 'blue' as const;
  return 'amber' as const;
}

function daysUntil(value: string | null) {
  if (!value) return null;
  const target = new Date(`${value}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.blue, borderRadius: 20, gap: 9, padding: 20 },
  heroLabel: { color: '#CBE7F7', fontSize: 12, fontWeight: '800', letterSpacing: 0.45 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, lineHeight: 33 },
  heroCopy: { color: '#DBEEF8', fontSize: 14, lineHeight: 20, maxWidth: 300 },
  list: { gap: 8 },
  entry: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 78,
    paddingHorizontal: 14,
  },
  renewal: {
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
  entryIcon: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 13,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  renewalIcon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  entryCopy: { flex: 1, gap: 4 },
  entryTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  entrySub: { color: colors.muted, fontSize: 12 },
  muted: { color: colors.muted, fontSize: 13, fontWeight: '600', paddingVertical: 6 },
});
