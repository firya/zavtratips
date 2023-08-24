/* Generated file */

export interface RawgSearchResponse {
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
  platforms: IPlatform[];
  stores?: IStore[];
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings: IRating[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: IAddedByStatus;
  metacritic?: number;
  suggestions_count: number;
  updated: string;
  id: number;
  score: string;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  clip: any;
  tags: ITag[];
  esrb_rating?: IEsrbRating;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  user_game: any;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  short_screenshots: IShortScreenshot[];
  parent_platforms: IParentPlatform[];
  genres: IGenre[];
}

interface IPlatform {
  platform: IPlatform2;
}

interface IPlatform2 {
  id: number;
  name: string;
  slug: string;
}

interface IStore {
  store: IStore2;
}

interface IStore2 {
  id: number;
  name: string;
  slug: string;
}

interface IRating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

interface IAddedByStatus {
  yet: number;
  owned: number;
  beaten: number;
  toplay: number;
  dropped: number;
  playing: number;
}

interface ITag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

interface IEsrbRating {
  id: number;
  name: string;
  slug: string;
  name_en: string;
  name_ru: string;
}

interface IShortScreenshot {
  id: number;
  image: string;
}

interface IParentPlatform {
  platform: IPlatform3;
}

interface IPlatform3 {
  id: number;
  name: string;
  slug: string;
}

interface IGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgResponse {
  id: number;
  slug: string;
  name: string;
  name_original: string;
  description: string;
  metacritic: number;
  metacritic_platforms: MetacriticPlatform[];
  released: string;
  tba: boolean;
  updated: string;
  background_image: string;
  background_image_additional: string;
  website: string;
  rating: number;
  rating_top: number;
  ratings: Rating[];
  reactions: Reactions;
  added: number;
  added_by_status: AddedByStatus;
  playtime: number;
  screenshots_count: number;
  movies_count: number;
  creators_count: number;
  achievements_count: number;
  parent_achievements_count: number;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  reviews_text_count: number;
  ratings_count: number;
  suggestions_count: number;
  alternative_names: string[];
  metacritic_url: string;
  parents_count: number;
  additions_count: number;
  game_series_count: number;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  user_game: any;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  parent_platforms: ParentPlatform[];
  platforms: Platform3[];
  stores: Store[];
  developers: Developer[];
  genres: Genre[];
  tags: Tag[];
  publishers: Publisher[];
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  esrb_rating: any;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  clip: any;
  description_raw: string;
  gameplayMain?: number;
  gameplayMainExtra?: number;
  gameplayCompletionist?: number;
}

export interface MetacriticPlatform {
  metascore: number;
  url: string;
  platform: Platform;
}

export interface Platform {
  platform: number;
  name: string;
  slug: string;
}

export interface Rating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

export interface Reactions {}

export interface AddedByStatus {
  yet: number;
  owned: number;
  beaten: number;
  toplay: number;
  dropped: number;
  playing: number;
}

export interface ParentPlatform {
  platform: Platform2;
}

export interface Platform2 {
  id: number;
  name: string;
  slug: string;
}

export interface Platform3 {
  platform: Platform4;
  released_at: string;
  requirements: Requirements;
}

export interface Platform4 {
  id: number;
  name: string;
  slug: string;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  image: any;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  year_end: any;
  year_start?: number;
  games_count: number;
  image_background: string;
}

export interface Requirements {
  minimum?: string;
  recommended?: string;
}

export interface Store {
  id: number;
  url: string;
  store: Store2;
}

export interface Store2 {
  id: number;
  name: string;
  slug: string;
  domain: string;
  games_count: number;
  image_background: string;
}

export interface Developer {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}
