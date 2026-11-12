import axios from 'axios';
import https from 'node:https';
import { omdbMedia, releaseYear } from './omdb';

type Kind = 'movie' | 'tv';
interface Title {
  id: number; title?: string; name?: string; original_title?: string; original_name?: string;
  release_date?: string; first_air_date?: string; last_air_date?: string; in_production?: boolean;
  poster_path?: string; genre_ids?: number[]; genres?: { id: number; name: string }[];
  origin_country?: string[]; production_countries?: { iso_3166_1: string }[];
  runtime?: number; episode_run_time?: number[]; imdb_id?: string;
  external_ids?: { imdb_id?: string }; adult?: boolean; vote_count?: number;
  translations?: { translations?: { iso_639_1: string; data: { title?: string; name?: string } }[] };
  alternative_titles?: { titles?: { iso_3166_1: string; title: string; type?: string }[]; results?: { iso_3166_1: string; title: string; type?: string }[] };
}
interface Response extends Partial<Title> {
  results?: Title[]; total_pages?: number; movie_results?: Title[]; tv_results?: Title[];
}
type Request = (path: string, params?: Record<string, string | number | boolean>) => Promise<Response>;

function imdbPoster(image?: string) {
  try {
    const url = new URL(image || '');
    return url.protocol === 'https:' && ['m.media-amazon.com', 'ia.media-imdb.com', 'images-na.ssl-images-amazon.com'].includes(url.hostname) ? url.href : '';
  } catch { return ''; }
}

export function tmdbKinds(category: string): Kind[] {
  if (/аниме/i.test(category)) return ['movie', 'tv'];
  return [/сериал|шоу/i.test(category) ? 'tv' : 'movie'];
}

export function matchesTmdb(title: Title, kind: Kind, category: string) {
  if (title.adult || !tmdbKinds(category).includes(kind)) return false;
  const genres = title.genre_ids || title.genres?.map(g => g.id) || [];
  const animation = genres.includes(16);
  if (/аниме/i.test(category)) {
    const countries = title.origin_country || title.production_countries?.map(c => c.iso_3166_1);
    return animation && (!countries || countries.includes('JP'));
  }
  if (/мульт/i.test(category)) return animation;
  if (/фильм|сериал/i.test(category)) return !animation && !genres.includes(99) && !genres.includes(10764) && !genres.includes(10767);
  return true;
}

export function tmdbNames(title: Title) {
  const translations = title.translations?.translations || [];
  const alternatives = title.alternative_titles?.titles || title.alternative_titles?.results || [];
  const english = translations.filter(t => t.iso_639_1 === 'en').map(t => (t.data.title || t.data.name || '').trim()).find(Boolean);
  // Details are requested with language=en-US. original_title/original_name
  // are the production-language title (e.g. Japanese), not the English name.
  const name = english || title.title || title.name || '';
  const translated = translations.filter(t => t.iso_639_1 === 'ru').map(t => (t.data.title || t.data.name || '').trim()).find(Boolean);
  const alternative = alternatives.find(t => t.iso_3166_1 === 'RU' && t.title.trim() && /[А-Яа-яЁё]/.test(t.title) && !/season|\bS\d|logo/i.test(t.type || ''))?.title.trim();
  const russian = translated || alternative || '';
  return { name, otherNames: russian.toLocaleLowerCase() === name.trim().toLocaleLowerCase() ? '' : russian };
}

export class TmdbMediaService {
  private cache = new Map<string, { until: number; value: unknown }>();
  private pending = new Map<string, Promise<unknown>>();
  private active = 0;
  private waiting: (() => void)[] = [];
  constructor(private request: Request, private imdbDetails = (id: string) => omdbMedia.details(id)) {}

  private async load<T>(key: string, ttl: number, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.until > Date.now()) return cached.value as T;
    const existing = this.pending.get(key);
    if (existing) return existing as Promise<T>;
    const promise = loader().then(value => {
      if (this.cache.size >= 1000) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(key, { value, until: Date.now() + ttl }); return value;
    });
    this.pending.set(key, promise);
    try { return await promise; } finally { this.pending.delete(key); }
  }

  private async call(path: string, params?: Record<string, string | number | boolean>) {
    if (this.active >= 4) await new Promise<void>(resolve => this.waiting.push(resolve));
    else this.active++;
    try { return await this.request(path, params); }
    finally { const next = this.waiting.shift(); if (next) next(); else this.active--; }
  }

  async details(kind: Kind, id: number) {
    if (!['movie', 'tv'].includes(kind) || !Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid TMDB ID');
    return this.load(`details:${kind}:${id}`, 86400000, async () => {
      const data = await this.call(`/${kind}/${id}`, { language: 'en-US', append_to_response: 'translations,external_ids,alternative_titles' });
      if (!data.id) throw new Error('Title not found in TMDB');
      const title = data as Title;
      const imdbId = title.imdb_id || title.external_ids?.imdb_id;
      const date = kind === 'movie' ? title.release_date : title.first_air_date;
      const year = date?.slice(0, 4);
      const runtime = kind === 'movie' ? title.runtime : title.episode_run_time?.[0];
      return {
        tmdbId: id, mediaType: kind === 'tv' ? 'series' : 'movie', imdbId,
        ...tmdbNames(title), year, releaseDate: date || undefined,
        link: imdbId ? `https://www.imdb.com/title/${imdbId}/` : `https://www.themoviedb.org/${kind}/${id}`,
        // Search results must not supply a TMDB poster as a selection fallback.
        image: '',
        platforms: 'TMDB', genre: title.genres?.map(g => g.name).join(', '),
        length: runtime ? `${runtime} min` : undefined,
        country: (title.origin_country || title.production_countries?.map(c => c.iso_3166_1))?.join(', '),
        genreIds: title.genres?.map(g => g.id) || [],
      };
    });
  }

  async selected(kind: Kind, id: number) {
    const item = await this.details(kind, id);
    // Preserve the existing IMDb score. TMDB votes are a different rating.
    const imdb = item.imdbId ? await this.imdbDetails(item.imdbId).catch(() => undefined) : undefined;
    // Store only the direct IMDb/Amazon CDN URL, never image files or TMDB URLs.
    return { ...item, image: imdbPoster(imdb?.image), rate: imdb?.rate };
  }

  async findImdb(id: string, category?: string) {
    if (!/^tt\d{7,10}$/.test(id)) throw new Error('Invalid IMDb ID');
    const data = await this.call(`/find/${id}`, { external_source: 'imdb_id', language: 'en-US' });
    for (const kind of category ? tmdbKinds(category) : ['movie', 'tv'] as Kind[]) {
      for (const item of (kind === 'movie' ? data.movie_results : data.tv_results) || []) {
        const detail = await this.details(kind, item.id);
        if (!category || this.matchesDetail(detail, category)) return detail;
      }
    }
  }

  private matchesDetail(item: Awaited<ReturnType<TmdbMediaService['details']>>, category: string) {
    // TMDB has no separate Short genre; exclude short promotional films from
    // the live-action film category while allowing unknown upcoming runtimes.
    if (/фильм/i.test(category) && !/мульт/i.test(category) && item.length && parseInt(item.length, 10) < 40) return false;
    return matchesTmdb({ id: item.tmdbId, genre_ids: item.genreIds, origin_country: item.country?.split(', ') || [] }, item.mediaType === 'series' ? 'tv' : 'movie', category);
  }

  async search(query: string, category: string) {
    query = query.trim();
    const imdbId = query.match(/^(?:https?:\/\/(?:www\.)?imdb\.com\/title\/)?(tt\d{7,10})(?:\/.*|\?.*)?$/i)?.[1];
    if (imdbId) { const item = await this.findImdb(imdbId.toLowerCase(), category); return item ? [item] : []; }
    return this.load(`search:${category}:${query.toLocaleLowerCase()}`, 300000, async () => {
      const suffix = query.match(/^(.+?)\s+((?:18|19|20|21)\d{2})$/);
      const variants = suffix ? [{ query: suffix[1], year: suffix[2] }, { query }] : [{ query }];
      const collected: { title: Title; kind: Kind; priority: number }[] = [];
      let complete = true;
      for (const [priority, variant] of variants.entries()) {
        await Promise.all(tmdbKinds(category).map(async kind => {
          const params = { query: variant.query, language: 'en-US', include_adult: false,
            ...(variant.year ? { [kind === 'movie' ? 'primary_release_year' : 'first_air_date_year']: variant.year } : {}) };
          const first = await this.call(`/search/${kind}`, { ...params, page: 1 });
          const titles = [...(first.results || [])];
          const pages = Math.min(first.total_pages || 1, 100);
          for (let start = 2; start <= pages; start += 4) {
            const batch = await Promise.allSettled(Array.from({ length: Math.min(4, pages - start + 1) }, (_, i) => this.call(`/search/${kind}`, { ...params, page: start + i })));
            for (const page of batch) { if (page.status === 'fulfilled') titles.push(...(page.value.results || [])); else complete = false; }
          }
          for (const title of titles) {
            if (matchesTmdb(title, kind, category) && (!variant.year || releaseYear(title.release_date || title.first_air_date) === Number(variant.year))) collected.push({ title, kind, priority });
          }
        }));
      }
      collected.sort((a, b) => a.priority - b.priority || releaseYear(b.title.release_date || b.title.first_air_date) - releaseYear(a.title.release_date || a.title.first_air_date) || (b.title.vote_count || 0) - (a.title.vote_count || 0));
      const unique = [...new Map(collected.map(item => [`${item.kind}:${item.title.id}`, item])).values()];
      // Deduplication must preserve the year interpretation's priority.
      const result: Awaited<ReturnType<TmdbMediaService['details']>>[] = [];
      for (let start = 0; start < unique.length && result.length < 20; start += 4) {
        const batch = await Promise.allSettled(unique.slice(start, start + 4).map(x => this.details(x.kind, x.title.id)));
        for (const item of batch) {
          if (item.status === 'fulfilled') { if (this.matchesDetail(item.value, category)) result.push(item.value); }
          else complete = false;
        }
      }
      if (!complete) throw new Error('TMDB returned incomplete search results; please retry');
      return result.slice(0, 20);
    });
  }
}

// The hosting resolver returns loopback addresses for TMDB. Resolve ONLY the
// API hostname through DoH; keep all other system/application DNS unchanged.
let addresses: { ips: string[]; until: number } | undefined;
let resolving: Promise<string[]> | undefined;
async function resolveApi() {
  if (addresses && addresses.until > Date.now()) return addresses.ips;
  if (resolving) return resolving;
  resolving = (async () => {
    const { data } = await axios.get('https://cloudflare-dns.com/dns-query', {
      params: { name: 'api.themoviedb.org', type: 'A' }, headers: { Accept: 'application/dns-json' }, timeout: 10000,
    });
    const answers = (data.Answer || []).filter((a: { type: number; data: string }) => a.type === 1 && /^\d+\.\d+\.\d+\.\d+$/.test(a.data));
    if (!answers.length) throw new Error('TMDB DNS lookup failed');
    addresses = { ips: answers.map((a: { data: string }) => a.data), until: Date.now() + Math.max(5, Math.min(...answers.map((a: { TTL: number }) => a.TTL || 30), 300)) * 1000 };
    return addresses.ips;
  })();
  try { return await resolving; } finally { resolving = undefined; }
}
const agent = new https.Agent({ keepAlive: true, lookup: (hostname, options, callback) => {
  if (hostname !== 'api.themoviedb.org') { callback(new Error('Unexpected TMDB hostname'), '', 4); return; }
  resolveApi().then(ips => {
    const ip = ips[Math.floor(Math.random() * ips.length)];
    if (typeof options === 'object' && options.all) (callback as Function)(null, [{ address: ip, family: 4 }]);
    else callback(null, ip, 4);
  }).catch(() => callback(new Error('TMDB DNS lookup failed'), '', 4));
} });

export const tmdbMedia = new TmdbMediaService(async (path, params) => {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error('TMDB token is not configured');
  try {
    const { data } = await axios.get<Response>(`https://api.themoviedb.org/3${path}`, {
      params, httpsAgent: agent, headers: { Authorization: `Bearer ${token}` }, timeout: 15000,
    });
    return data;
  } catch {
    // Axios errors contain Authorization; never expose or log the raw error.
    throw new Error('TMDB request failed');
  }
});
