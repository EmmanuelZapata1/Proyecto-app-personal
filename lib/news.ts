export type Article = {
  id: string;
  title: string;
  link: string;
  publishedAt: string | null;
  feedName: string;
};

export function relativeTime(iso: string | null) {
  if (!iso) return 'Sin fecha';
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.round(hours / 24)} d`;
}
