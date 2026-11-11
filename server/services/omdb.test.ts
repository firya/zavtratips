import test from 'node:test';
import assert from 'node:assert/strict';
import { OmdbMediaService, omdbType } from './omdb';

test('anime includes series; films and TV retain their filters', () => {
  assert.equal(omdbType('😸 Аниме'), undefined);
  assert.equal(omdbType('🎬 Фильм'), 'movie');
  assert.equal(omdbType('🚶‍♂️ Мультсериал'), 'series');
});

test('five pages produce 50 unique results sorted by start year, without per-result details calls', async () => {
  const calls: Record<string, string | number>[] = [];
  const service = new OmdbMediaService(async params => {
    calls.push(params);
    if (params.t) return { Response: 'False' };
    const page = Number(params.page);
    return { totalResults: '123', Search: Array.from({ length: 10 }, (_, i) => ({
      imdbID: `tt${1000000 + (page - 1) * 10 + i}`, Title: `Title ${page}-${i}`, Type: 'movie', Year: String(1950 + (page - 1) * 10 + i),
    })) };
  });
  const results = await service.search('Batman', '🎬 Фильм');
  assert.equal(results.length, 50);
  assert.equal(results[0].year, '1999');
  assert.equal(results[49].year, '1950');
  assert.equal(calls.length, 6);
  assert.ok(calls.every(c => !c.i));
  await service.search('batman', '🎬 Фильм');
  assert.equal(calls.length, 6, 'repeat search should use cache');
});

test('English anime titles are not filtered as movies, and duplicate exact matches are merged', async () => {
  for (const [name, id] of [['Cyberpunk: Edgerunners', 'tt12590266'], ['Tower of God', 'tt12057106']]) {
    const title = { Title: name, imdbID: id, Year: '2022–', Type: 'series' };
    const service = new OmdbMediaService(async params => {
      assert.equal(params.type, undefined);
      return params.t ? title : { Search: [title], totalResults: '1' };
    });
    const results = await service.search(name, '😸 Аниме');
    assert.equal(results.length, 1);
    assert.equal(results[0].imdbId, id);
  }
});

test('year ranges use premiere year, unknown years are last, episodes are excluded', async () => {
  const service = new OmdbMediaService(async params => params.t ? {} : { Search: [
    { Title: 'Old series', imdbID: 'tt1000001', Year: '2010–2026', Type: 'series' },
    { Title: 'New series', imdbID: 'tt1000002', Year: '2024–', Type: 'series' },
    { Title: 'Unknown', imdbID: 'tt1000003', Year: 'N/A', Type: 'movie' },
    { Title: 'Episode', imdbID: 'tt1000004', Year: '2026', Type: 'episode' },
  ], totalResults: '4' });
  assert.deepEqual((await service.search('Test', '😸 Аниме')).map(m => m.name), ['New series', 'Old series', 'Unknown']);
});

test('IMDb URL and ID support exact lookup and details caching', async () => {
  let calls = 0;
  const service = new OmdbMediaService(async params => {
    calls++;
    assert.equal(params.i, 'tt12590266');
    return { Title: 'Cyberpunk: Edgerunners', imdbID: 'tt12590266', Year: '2022', Type: 'series', Released: '13 Sep 2022', Genre: 'Animation', imdbRating: '8.3' };
  });
  const [title] = await service.search('https://www.imdb.com/title/tt12590266/', '😸 Аниме');
  assert.equal(title.genre, 'Animation');
  assert.equal((await service.details('tt12590266')).releaseDate, '13 Sep 2022');
  assert.equal(calls, 1);
  await assert.rejects(service.details('../invalid'));
});

test('exact title fallback works even when substring search finds no alias', async () => {
  const service = new OmdbMediaService(async params => params.t ? { Title: 'English Alias', imdbID: 'tt1000000', Year: '2025', Type: 'series' } : { Response: 'False' });
  assert.equal((await service.search('English Alias', '😸 Аниме'))[0].name, 'English Alias');
});

test('a failed extra page preserves results from successful pages', async () => {
  const service = new OmdbMediaService(async params => {
    if (params.t) return {};
    if (params.page === 2) throw new Error('timeout');
    return { Search: [{ Title: 'Available', imdbID: `tt100000${params.page}`, Year: '2024', Type: 'movie' }], totalResults: '30' };
  });
  assert.equal((await service.search('Available', '🎬 Фильм')).length, 2);
});
