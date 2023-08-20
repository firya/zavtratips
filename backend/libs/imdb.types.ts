export interface ImdbSearchResults {
  Search: Search[];
  totalResults: string;
  Response: string;
}

interface Search {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}
