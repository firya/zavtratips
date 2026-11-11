import test from 'node:test';
import assert from 'node:assert/strict';
import { OmdbMediaService, omdbType, matchesContentType } from './omdb';
const title = (id: string, type='movie', year='2024', animation=false, country='United States') => ({ Title:id, imdbID:id, Type:type, Year:year, Genre:animation?'Animation, Adventure':'Drama', Country:country });

test('all five categories respect format and animation', () => {
  assert.equal(omdbType('Аниме'),undefined);
  const film={mediaType:'movie',genre:'Drama'};
  const series={mediaType:'series',genre:'Drama'};
  const cartoon={mediaType:'movie',genre:'Animation',country:'United States'};
  const cartoonSeries={...cartoon,mediaType:'series'};
  const anime={...cartoonSeries,country:'Japan, South Korea'};
  for(const [category,accepted,rejected] of [['Фильм',film,cartoon],['Сериал',series,cartoonSeries],['Мультфильм',cartoon,cartoonSeries],['Мультсериал',cartoonSeries,cartoon],['Аниме',anime,series]] as const) {
    assert.equal(matchesContentType(accepted,category),true,category);
    assert.equal(matchesContentType(rejected,category),false,category);
  }
  assert.equal(matchesContentType(cartoon,'Аниме'),false);
  assert.equal(matchesContentType({...anime,mediaType:'movie'},'Аниме'),true);
});

test('50 results sort newest first with cached metadata and at most four simultaneous calls',async()=>{
  let calls=0,active=0,max=0;
  const service=new OmdbMediaService(async p=>{
    calls++;
    if(p.t)return {};
    if(p.i){active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,1));active--;return title(String(p.i),'movie',String(1950+Number(String(p.i).slice(2))-1000000));}
    return {totalResults:'123',Search:Array.from({length:10},(_,i)=>title(`tt${1000000+(Number(p.page)-1)*10+i}`))};
  });
  const results=await service.search('Batman','Фильм');
  assert.equal(results.length,50);assert.equal(results[0].year,'1999');assert.equal(results[49].year,'1950');
  assert.ok(max<=4);assert.equal(calls,56);
  await service.search('batman','Фильм');assert.equal(calls,56);
  assert.equal((await service.search('Batman','Мультфильм')).length,0);
  assert.equal(calls,62,'metadata should be reused across categories');
});

test('Cyberpunk and Tower of God match anime, not live action',async()=>{
  for(const [name,id]of [['Cyberpunk: Edgerunners','tt12590266'],['Tower of God','tt12057106']]){
    const anime={...title(id,'series','2022–',true,'Japan, United States'),Title:name};
    const service=new OmdbMediaService(async p=>{assert.equal(p.type,undefined);return p.t||p.i?anime:{Search:[anime],totalResults:'1'};});
    assert.equal((await service.search(name,'Аниме'))[0].imdbId,id);
  }
});

test('series use premiere year; episodes excluded and unknown years last',async()=>{
  const items=[title('tt1000001','series','2010–2026'),title('tt1000002','series','2024–'),title('tt1000003','series','N/A'),title('tt1000004','episode','2026')];
  const service=new OmdbMediaService(async p=>p.i?items.find(t=>t.imdbID===p.i)!:p.t?{}:{Search:items,totalResults:'4'});
  assert.deepEqual((await service.search('Test','Сериал')).map(m=>m.imdbId),['tt1000002','tt1000001','tt1000003']);
});

test('IMDb URL lookup obeys category and caches metadata',async()=>{
  let calls=0;
  const service=new OmdbMediaService(async p=>{calls++;assert.equal(p.i,'tt12590266');return {...title('tt12590266','series','2022',true,'Japan'),Title:'Cyberpunk: Edgerunners'};});
  assert.equal((await service.search('https://www.imdb.com/title/tt12590266/','Аниме'))[0].name,'Cyberpunk: Edgerunners');
  assert.equal((await service.search('tt12590266','Фильм')).length,0);assert.equal(calls,1);
  await assert.rejects(service.details('../invalid'));
});

test('exact title and successful pages survive one failed page',async()=>{
  const item=title('tt1000001');
  const service=new OmdbMediaService(async p=>{if(p.i||p.t)return item;if(p.page===2)throw Error('timeout');return {Search:[item],totalResults:'30'};});
  assert.equal((await service.search('English alias','Фильм')).length,1);
});

test('concurrent detail requests share one upstream call',async()=>{
  let calls=0;
  const service=new OmdbMediaService(async()=>{calls++;await new Promise(r=>setTimeout(r,1));return title('tt1000001');});
  await Promise.all(Array.from({length:10},()=>service.details('tt1000001')));assert.equal(calls,1);
});
