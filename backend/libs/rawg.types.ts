export interface RawgSearchPesponse {
  count: number;
  next: string;
  previous: string | undefined;
  results: Result[];
  user_platforms: boolean;
}

interface Result {
  slug: string;
  name: string;
  playtime: number;
  platforms: Platform[];
  stores?: Store[];
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings: Rating[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: AddedByStatus;
  metacritic?: number;
  suggestions_count: number;
  updated: string;
  id: number;
  score: string;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  clip: any;
  tags: Tag[];
  esrb_rating?: EsrbRating;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  user_game: any;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  short_screenshots: ShortScreenshot[];
  parent_platforms: ParentPlatform[];
  genres: Genre[];
}

interface Platform {
  platform: Platform2;
}

interface Platform2 {
  id: number;
  name: string;
  slug: string;
}

interface Store {
  store: Store2;
}

interface Store2 {
  id: number;
  name: string;
  slug: string;
}

interface Rating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

interface AddedByStatus {
  yet: number;
  owned: number;
  beaten: number;
  toplay: number;
  dropped: number;
  playing: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

interface EsrbRating {
  id: number;
  name: string;
  slug: string;
  name_en: string;
  name_ru: string;
}

interface ShortScreenshot {
  id: number;
  image: string;
}

interface ParentPlatform {
  platform: Platform3;
}

interface Platform3 {
  id: number;
  name: string;
  slug: string;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}
