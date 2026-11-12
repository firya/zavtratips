import test from 'node:test';
import assert from 'node:assert/strict';
import { TmdbMediaService, matchesTmdb, tmdbKinds, tmdbNames } from './tmdb';

const movie = (id: number, title: string, year: number, genres = [28]) => ({ id, title, original_title: title, release_date: `${year}-01-01`, genre_ids: genres, genres: genres.map(id => ({ id, name: id === 16 ? 'Animation' : 'Action' })), production_countries: [{ iso_3166_1: 'US' }] });

test('Original Name uses English while Other Names contains one Russian title only', () => {
  assert.deepEqual(tmdbNames({ id: 603, title: 'The Matrix', original_title: 'The Matrix', translations: { translations: [
    { iso_639_1: 'ru', data: { title: 'Матрица' } }, { iso_639_1: 'ru', data: { title: 'Матрица' } }, { iso_639_1: 'en', data: { title: 'The Matrix' } },
  ] } }), { name: 'The Matrix', otherNames: 'Матрица' });
  assert.deepEqual(tmdbNames({ id: 1, name: 'Tower of God', original_name: '神之塔', translations: { translations: [
    { iso_639_1: 'ru', data: { name: 'Башня Бога' } }, { iso_639_1: 'en', data: { name: 'Tower of God' } },
  ] } }), { name: 'Tower of God', otherNames: 'Башня Бога' });
  assert.deepEqual(tmdbNames({ id: 1, name: 'Tower of God', original_name: '神之塔' }), { name: 'Tower of God', otherNames: '' });
  assert.equal(tmdbNames({ id: 1, title: 'No translation' }).otherNames, '');
  assert.deepEqual(tmdbNames({ id: 105248, name: 'Cyberpunk: Edgerunners', alternative_titles: { results: [
    { iso_3166_1: 'RU', title: 'Киберпанк: Бегущие по краю', type: '' },
    { iso_3166_1: 'RU', title: 'Киберпанк: Бегущие по краю 2', type: 'season 2' },
    { iso_3166_1: 'RU', title: 'Ещё одно русское название', type: '' },
    { iso_3166_1: 'US', title: 'Cyberpunk 2', type: '' },
  ] } }), { name: 'Cyberpunk: Edgerunners', otherNames: 'Киберпанк: Бегущие по краю' });
  assert.deepEqual(tmdbNames({ id: 1, title: 'The Matrix', original_title: 'Матрица', translations: { translations: [{ iso_639_1: 'ru', data: { title: 'Матрица' } }] } }), { name: 'The Matrix', otherNames: 'Матрица' });
});

test('Russian search returns English titles and selecting a result keeps the same English name', async () => {
  const service = new TmdbMediaService(async (path, params) => {
    assert.equal(params?.language, 'en-US');
    const title = { ...movie(78, 'Blade Runner', 1982), original_title: 'Бегущий по лезвию', translations: { translations: [{ iso_639_1: 'ru', data: { title: 'Бегущий по лезвию' } }] } };
    if (path === '/search/movie') {
      assert.equal(params?.query, 'Бегущий по лезвию');
      return { results: [title], total_pages: 1 };
    }
    return title;
  });
  const results = await service.search('Бегущий по лезвию', 'Фильм');
  assert.equal(results[0].name, 'Blade Runner');
  assert.equal(results[0].otherNames, 'Бегущий по лезвию');
  const selected = await service.selected('movie', results[0].tmdbId);
  assert.equal(selected.name, 'Blade Runner');
  assert.equal(selected.otherNames, 'Бегущий по лезвию');
});

test('five content categories respect format, animation and Japanese origin', () => {
  const live = movie(1, 'Film', 2026);
  const animation = movie(2, 'Animation', 2026, [16]);
  const japan = { ...animation, origin_country: ['JP'] };
  assert.deepEqual(tmdbKinds('Аниме'), ['movie', 'tv']);
  for (const [category, kind, accepted, rejected] of [
    ['Фильм', 'movie', live, animation], ['Сериал', 'tv', live, animation],
    ['Мультфильм', 'movie', animation, live], ['Мультсериал', 'tv', animation, live],
    ['Аниме', 'tv', japan, live],
  ] as const) {
    assert.equal(matchesTmdb(accepted, kind, category), true);
    assert.equal(matchesTmdb(rejected, kind, category), false);
  }
  assert.equal(matchesTmdb(animation, 'movie', 'Аниме'), false);
  assert.equal(matchesTmdb(live, 'tv', 'Фильм'), false);
  assert.equal(matchesTmdb({ ...live, adult: true }, 'movie', 'Фильм'), false);
});

test('search loads later pages, sorts newest first, filters cartoons and returns at most twenty', async () => {
  const items = Array.from({ length: 45 }, (_, i) => movie(i + 1, `Film ${i}`, 1980 + i));
  const seen: number[] = []; let calls = 0; let active = 0; let max = 0;
  const service = new TmdbMediaService(async (path, p) => {
    calls++; active++; max = Math.max(max, active); await new Promise(r => setTimeout(r, 1)); active--;
    if (path === '/search/movie') {
      const page = Number(p?.page); seen.push(page);
      return { total_pages: 3, results: items.slice((page - 1) * 20, page * 20) };
    }
    return items[Number(path.split('/').pop()) - 1];
  });
  const results = await service.search('Film', 'Фильм');
  assert.equal(results.length, 20); assert.equal(results[0].year, '2024'); assert.equal(results[19].year, '2005');
  assert.ok(seen.includes(3)); assert.ok(max <= 4);
  const before = calls; await service.search('film', 'Фильм'); assert.equal(calls, before);
});

test('year suffix and literal titles both work; sequels are not interpreted as years', async () => {
  const resident = movie(1, 'Resident Evil', 2026); const blade = movie(2, 'Blade Runner 2049', 2017); const sequel = movie(3, 'Resident Evil 4', 2020);
  const service = new TmdbMediaService(async (path, p) => {
    if (!path.startsWith('/search/')) return [resident, blade, sequel][Number(path.split('/').pop()) - 1];
    const item = p?.query === 'Resident Evil' && p?.primary_release_year === '2026' ? resident : p?.query === 'Blade Runner 2049' ? blade : p?.query === 'Resident Evil 4' ? sequel : undefined;
    return { results: item ? [item] : [], total_pages: 1 };
  });
  assert.equal((await service.search('Resident Evil 2026', 'Фильм'))[0].tmdbId, 1);
  assert.equal((await service.search('Blade Runner 2049', 'Фильм'))[0].tmdbId, 2);
  assert.equal((await service.search('Resident Evil 4', 'Фильм'))[0].tmdbId, 3);
});

test('selection fills Russian alias, poster, runtime and IMDb score; shared details avoid extra requests', async () => {
  let calls = 0; let ratings = 0;
  const service = new TmdbMediaService(async () => {
    calls++; return { ...movie(603, 'The Matrix', 1999), imdb_id: 'tt0133093', runtime: 136, poster_path: '/matrix.jpg', translations: { translations: [{ iso_639_1: 'ru', data: { title: 'Матрица' } }] } };
  }, async id => { ratings++; assert.equal(id, 'tt0133093'); return { rate: '8.7' } as Awaited<ReturnType<import('./omdb').OmdbMediaService['details']>>; });
  await Promise.all([service.details('movie', 603), service.details('movie', 603)]);
  const result = await service.selected('movie', 603);
  assert.equal(calls, 1); assert.equal(ratings, 1);
  assert.equal(result.otherNames, 'Матрица'); assert.equal(result.length, '136 min'); assert.equal(result.rate, '8.7');
  assert.equal(result.image, 'https://image.tmdb.org/t/p/w500/matrix.jpg');
  await assert.rejects(service.details('movie', -1));
});

test('IMDb links use the TMDB mapping and obey the selected category', async () => {
  const service = new TmdbMediaService(async path => path.startsWith('/find/') ? { movie_results: [movie(603, 'The Matrix', 1999)] } : movie(603, 'The Matrix', 1999));
  assert.equal((await service.search('https://www.imdb.com/title/tt0133093/', 'Фильм'))[0].tmdbId, 603);
  assert.equal((await service.search('tt0133093', 'Мультфильм')).length, 0);
});

test('live-action film search excludes short promos but keeps unknown upcoming runtimes', async () => {
  const items = [{ ...movie(1, 'Upcoming movie', 2026), runtime: 0 }, { ...movie(2, 'Promo', 2026), runtime: 4 }];
  const service = new TmdbMediaService(async path => path.startsWith('/search/') ? { results: items, total_pages: 1 } : items[Number(path.split('/').pop()) - 1]);
  assert.deepEqual((await service.search('Movie', 'Фильм')).map(x => x.tmdbId), [1]);
});
