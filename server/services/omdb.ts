import axios from 'axios';

interface OmdbTitle {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster?: string;
  Released?: string;
  imdbRating?: string;
  Genre?: string;
  Runtime?: string;
  Country?: string;
}

interface OmdbResponse extends Partial<OmdbTitle> {
  Search?: OmdbTitle[];
  totalResults?: string;
  Response?: string;
}

type OmdbRequest = (params: Record<string, string | number>) => Promise<OmdbResponse>;

export function omdbType(contentType: string): 'movie' | 'series' | undefined {
  const name = contentType.toLowerCase();
  if (name.includes('аниме')) return undefined;
  return name.includes('сериал') || name.includes('шоу') ? 'series' : 'movie';
}

export function releaseYear(year?: string): number {
  return Number(year?.match(/\d{4}/)?.[0]) || 0;
}

const clean = (value?: string) => value && value !== 'N/A' ? value : undefined;

function mediaItem(title: OmdbTitle) {
  return {
    imdbId: title.imdbID,
    name: title.Title,
    year: clean(title.Year),
    mediaType: title.Type,
    link: `https://www.imdb.com/title/${title.imdbID}/`,
    image: clean(title.Poster),
    platforms: 'IMDb',
    rate: clean(title.imdbRating),
    genre: clean(title.Genre),
    country: clean(title.Country),
    releaseDate: clean(title.Released),
    length: clean(title.Runtime),
  };
}

export function matchesContentType(item: { mediaType: string; genre?: string; country?: string }, contentType: string) {
  const name = contentType.toLowerCase();
  const type = omdbType(contentType);
  if (item.mediaType === 'episode' || (type && item.mediaType !== type)) return false;
  const animation = /\bAnimation\b/i.test(item.genre || '');
  if (name.includes('аниме')) return animation && /\bJapan\b/i.test(item.country || '');
  if (name.includes('мульт')) return animation;
  if (name.includes('фильм') || name.includes('сериал')) return !animation;
  return true;
}

export class OmdbMediaService {
  private cache = new Map<string, { expires: number; data: unknown }>();
  private inFlight = new Map<string, Promise<ReturnType<typeof mediaItem>>>();
  private activeDetails = 0;
  private waiting: (() => void)[] = [];

  constructor(private request: OmdbRequest) {}

  private cached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry && entry.expires > Date.now()) return entry.data as T;
    this.cache.delete(key);
  }

  private remember<T>(key: string, data: T, ttl = 5 * 60 * 1000): T {
    if (this.cache.size >= 1000) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, { data, expires: Date.now() + ttl });
    return data;
  }

  async details(id: string) {
    if (!/^tt\d{7,10}$/.test(id)) throw new Error('Invalid IMDb ID');
    const hit = this.cached<ReturnType<typeof mediaItem>>(`id:${id}`);
    if (hit) return hit;
    const pending = this.inFlight.get(id);
    if (pending) return pending;
    const load = (async () => {
      if (this.activeDetails >= 4) await new Promise<void>(resolve => this.waiting.push(resolve));
      else this.activeDetails++;
      try {
        const data = await this.request({ i: id, plot: 'short' });
        if (!data.imdbID || data.Response === 'False') throw new Error('Title not found in OMDb');
        return this.remember(`id:${id}`, mediaItem(data as OmdbTitle), 24 * 60 * 60 * 1000);
      } finally {
        const next = this.waiting.shift();
        if (next) next();
        else this.activeDetails--;
      }
    })();
    this.inFlight.set(id, load);
    try { return await load; } finally { this.inFlight.delete(id); }
  }

  async search(query: string, contentType: string) {
    query = query.trim();
    const type = omdbType(contentType);
    const key = `search:${contentType}:${query.toLowerCase()}`;
    const hit = this.cached<ReturnType<typeof mediaItem>[]>(key);
    if (hit) return hit;

    // IMDb links/IDs provide an exact lookup when OMDb does not index an alias.
    const id = query.match(/^(?:https?:\/\/(?:www\.)?imdb\.com\/title\/)?(tt\d{7,10})(?:\/.*|\?.*)?$/i)?.[1];
    if (id) {
      const item = await this.details(id.toLowerCase());
      return matchesContentType(item, contentType) ? [item] : [];
    }

    const params: Record<string, string | number> = { s: query };
    if (type) params.type = type;
    const [first, exact] = await Promise.all([
      this.request({ ...params, page: 1 }),
      this.request({ t: query, ...(type ? { type } : {}) }).catch(() => ({} as OmdbResponse)),
    ]);
    const results = [...(first.Search || [])];
    const pages = Math.min(5, Math.ceil(Number(first.totalResults || 0) / 10));
    const additional = await Promise.allSettled(
      Array.from({ length: Math.max(0, pages - 1) }, (_, index) => this.request({ ...params, page: index + 2 })),
    );
    for (const response of additional) {
      if (response.status === 'fulfilled') results.push(...(response.value.Search || []));
    }
    if (exact.imdbID && exact.Response !== 'False') results.push(exact as OmdbTitle);

    const unique = [...new Map(results.filter(title => title.Type !== 'episode' && (!type || title.Type === type))
      .map(title => [title.imdbID, title])).values()];
    // Search summaries have no genre/country. Classify using cached details,
    // with shared in-flight requests and at most four upstream detail calls.
    const detailed = await Promise.allSettled(unique.map(title => this.details(title.imdbID)));
    const matching = detailed.flatMap(result => result.status === 'fulfilled' && matchesContentType(result.value, contentType) ? [result.value] : []);
    matching.sort((a, b) => releaseYear(b.year) - releaseYear(a.year) || a.name.localeCompare(b.name));
    return this.remember(key, matching.slice(0, 50));
  }
}

export const omdbMedia = new OmdbMediaService(async params => {
  try {
    const response = await axios.get<OmdbResponse>('https://www.omdbapi.com/', {
      params: { ...params, apikey: process.env.OMDB_API_KEY },
      timeout: 10000,
    });
    return response.data;
  } catch {
    // Axios errors include request parameters; never log the API key.
    throw new Error('OMDb request failed');
  }
});
