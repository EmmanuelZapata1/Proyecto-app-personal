import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { IconButton, PageTitle, Pill, Section } from '@/components/ui';
import { colors } from '@/constants/theme';
import { feedNames, useNews } from '@/contexts/news';
import { relativeTime } from '@/lib/news';

type Tone = 'moss' | 'amber' | 'blue';

const toneByFeed: Record<string, Tone> = {
  Lobsters: 'moss',
  'Hacker News': 'blue',
  'The Verge': 'amber',
};

const topicByTone: Record<Tone, string> = { moss: 'Comunidad', blue: 'Desarrollo', amber: 'Hardware' };

export default function NewsScreen() {
  const { articles, isLoading, error, refresh } = useNews();

  return (
    <Screen>
      <PageTitle
        title="Noticias"
        action={<IconButton icon="refresh-outline" label="Actualizar noticias" onPress={() => void refresh()} />}
      />

      <View style={styles.summary}>
        <Ionicons name="sparkles-outline" color={colors.moss} size={22} />
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Lectura breve, elegida por ti</Text>
          <Text style={styles.summaryText}>{feedNames.join(' · ')}</Text>
        </View>
      </View>

      <Section title="Para ti" action={articles.length ? `${articles.length} nuevas` : undefined}>
        <ScrollView
          refreshControl={<RefreshControl onRefresh={() => void refresh()} refreshing={isLoading} tintColor={colors.moss} />}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        >
          {isLoading && !articles.length ? <ActivityIndicator color={colors.moss} /> : null}
          {error && !articles.length ? <Text style={styles.error}>{error}</Text> : null}
          {!isLoading && !articles.length && !error ? <Text style={styles.error}>Sin artículos por ahora.</Text> : null}
          {articles.map((article) => {
            const tone = toneByFeed[article.feedName] ?? 'moss';
            return (
              <Pressable
                key={`${article.id}-${article.feedName}`}
                onPress={() => void WebBrowser.openBrowserAsync(article.link)}
                style={({ pressed }) => [styles.article, pressed && styles.pressed]}
              >
                <View style={styles.articleMeta}>
                  <Text style={styles.source}>{article.feedName}</Text>
                  <Text style={styles.time}>{relativeTime(article.publishedAt)}</Text>
                </View>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Pill label={topicByTone[tone]} tone={tone} />
              </Pressable>
            );
          })}
        </ScrollView>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'flex-start', backgroundColor: colors.mossSoft, borderRadius: 18, flexDirection: 'row', gap: 12, padding: 16 },
  summaryCopy: { flex: 1, gap: 4 },
  summaryTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  summaryText: { color: '#456856', fontSize: 13, lineHeight: 19 },
  list: { gap: 10 },
  article: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, gap: 11, padding: 16 },
  articleMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  source: { color: colors.moss, fontSize: 12, fontWeight: '800' },
  time: { color: colors.muted, fontSize: 12 },
  articleTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', lineHeight: 23 },
  pressed: { opacity: 0.72 },
  error: { color: colors.muted, fontSize: 13, fontWeight: '600', paddingVertical: 12 },
});
