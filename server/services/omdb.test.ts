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

test('20 results sort newest first with cached metadata and at most four simultaneous calls',async()=>{
  let calls=0,active=0,max=0;
  const service=new OmdbMediaService(async p=>{
    calls++;
    if(p.t)return {};
    if(p.i){active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,1));active--;return title(String(p.i),'movie',String(1900+Number(String(p.i).slice(2))-1000000));}
    return {totalResults:'123',Search:Array.from({length:Math.min(10,123-(Number(p.page)-1)*10)},(_,i)=>{const index=(Number(p.page)-1)*10+i;return title(`tt${1000000+index}`,'movie',String(1900+index));})};
  });
  const results=await service.search('Batman','Фильм');
  assert.equal(results.length,20);assert.equal(results[0].year,'2022');assert.equal(results[19].year,'2003');
  assert.ok(max<=4);assert.equal(calls,34);
  await service.search('batman','Фильм');assert.equal(calls,34);
  assert.equal((await service.search('Batman','Мультфильм')).length,0);
  assert.equal(calls,151,'metadata should be reused across categories');
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

test('Resident Evil 2026 on page eight is included while gameplay, shorts and making-of are excluded',async()=>{
  const items=Array.from({length:76},(_,i)=>({...title(`tt${2000000+i}`,'movie','2010'),Title:`Resident Evil ${i}`}));
  items[0]={...items[0],Title:'Resident Evil 3 Remake (FULL GAME)',Year:'2027'};
  items[1]={...items[1],Title:'Resident Evil Requiem - Evil Has Always Had A Name',Year:'2026',Genre:'Short, Drama, Horror'};
  items[2]={...items[2],Title:'Making Resident Evil',Year:'2026',Genre:'Documentary'};
  items[75]={...title('tt35538033','movie','2026'),Title:'Resident Evil'};
  const pages:number[]=[];const detailIds:string[]=[];
  const service=new OmdbMediaService(async p=>{
    if(p.i){detailIds.push(String(p.i));return items.find(x=>x.imdbID===p.i)!;}
    if(p.t)return {};
    pages.push(Number(p.page));return {totalResults:'76',Search:items.slice((Number(p.page)-1)*10,Number(p.page)*10)};
  });
  const result=await service.search('Resident Evil','Фильм');
  assert.ok(pages.includes(8));
  assert.equal(result[0].imdbId,'tt35538033');
  assert.ok(result.every(x=>!['tt2000000','tt2000001','tt2000002'].includes(x.imdbId)));
  assert.ok(!detailIds.includes('tt2000000'),'obvious gameplay should be rejected before a detail request');
});


test('trailing release year also preserves literal titles containing years or numbers',async()=>{
  const film={...title('tt35538033','movie','2026'),Title:'Resident Evil'};
  const blade={...title('tt1856101','movie','2017'),Title:'Blade Runner 2049'};
  const number={...title('tt2788710','movie','2014'),Title:'Welcome to 2014'};
  const sequel={...title('tt1000003','movie','2023'),Title:'Resident Evil 4'};
  const requests:Record<string,string|number>[]=[];
  const service=new OmdbMediaService(async p=>{
    requests.push(p);
    if(p.i)return [film,blade,number,sequel].find(x=>x.imdbID===p.i)!;
    const q=p.s||p.t;
    const item=q==='Resident Evil'&&p.y==='2026'?film:q==='Blade Runner 2049'?blade:q==='Welcome to 2014'?number:q==='Resident Evil 4'?sequel:undefined;
    return item?(p.t?item:{Search:[item],totalResults:'1'}):{Response:'False'};
  });
  assert.equal((await service.search('Resident Evil 2026','Фильм'))[0].imdbId,film.imdbID);
  assert.ok(requests.some(p=>p.s==='Resident Evil'&&p.y==='2026'));
  assert.equal((await service.search('Blade Runner 2049','Фильм'))[0].imdbId,blade.imdbID);
  assert.equal((await service.search('Welcome to 2014','Фильм'))[0].imdbId,number.imdbID);
  assert.equal((await service.search('Resident Evil 4','Фильм'))[0].imdbId,sequel.imdbID);
});
