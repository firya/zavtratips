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
    releaseDate: clean(title.Released),
    length: clean(title.Runtime),
  };
}

export class OmdbMediaService {
  private cache = new Map<string, { expires: number; data: unknown }>();

  constructor(private request: OmdbRequest) {}

  private cached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry && entry.expires > Date.now()) return entry.data as T;
    this.cache.delete(key);
  }

  private remember<T>(key: string, data: T): T {
    if (this.cache.size >= 200) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, { data, expires: Date.now() + 5 * 60 * 1000 });
    return data;
  }

  async details(id: string) {
    if (!/^tt\d{7,10}$/.test(id)) throw new Error('Invalid IMDb ID');
    const hit = this.cached<ReturnType<typeof mediaItem>>(`id:${id}`);
    if (hit) return hit;
    const data = await this.request({ i: id, plot: 'short' });
    if (!data.imdbID || data.Response === 'False') throw new Error('Title not found in OMDb');
    return this.remember(`id:${id}`, mediaItem(data as OmdbTitle));
  }

  async search(query: string, contentType: string) {
    query = query.trim();
    const type = omdbType(contentType);
    const key = `search:${type || 'all'}:${query.toLowerCase()}`;
    const hit = this.cached<ReturnType<typeof mediaItem>[]>(key);
    if (hit) return hit;

    // IMDb links/IDs provide an exact lookup when OMDb does not index an alias.
    const id = query.match(/^(?:https?:\/\/(?:www\.)?imdb\.com\/title\/)?(tt\d{7,10})(?:\/.*|\?.*)?$/i)?.[1];
    if (id) {
      const item = await this.details(id.toLowerCase());
      return item.mediaType !== 'episode' && (!type || item.mediaType === type) ? [item] : [];
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
    unique.sort((a, b) => releaseYear(b.Year) - releaseYear(a.Year) || a.Title.localeCompare(b.Title));
    return this.remember(key, unique.slice(0, 50).map(mediaItem));
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
