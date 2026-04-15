import { en } from './lang/en';
import { sk } from './lang/sk';
import { de } from './lang/de';
import { fr } from './lang/fr';
import { es } from './lang/es';

export type AppLanguageCode = 'en' | 'sk' | 'de' | 'fr' | 'es';

export interface TranslationDictionary {
  headerTitle: string;
  headerSubtitle: string;
  tabsMovies: string;
  tabsSeries: string;
  searchMovies: string;
  searchSeries: string;
  resultsMovies: string;
  resultsSeries: string;
  resultsLoading: string;
  resultsLoadingMore: string;
  resultsNoMore: string;
  resultsNoResults: string;
  resultsError: string;
  loading: string;
  noResults: string;
  errorGeneric: string;
  errorLoadMore: string;
  resultCount: string;
  resultUnknownTitle: string;
  resultUnknownDate: string;
  resultNoImage: string;
  detailsTitle: string;
  detailsUntitled: string;
  detailsReleaseDate: string;
  detailsFirstAirDate: string;
  detailsUnknownDate: string;
  detailsOverview: string;
  detailsNoOverview: string;
  detailsOriginalLanguage: string;
  detailsPopularity: string;
  detailsVoteAverage: string;
  detailsVoteCount: string;
  detailsRating: string;
  detailsGenres: string;
  detailsStatus: string;
  detailsRuntime: string;
  detailsSeasons: string;
  detailsEpisodes: string;
  detailsUnknown: string;
  detailsNoImage: string;
  detailsLoading: string;
  detailsError: string;
  close: string;
  language: string;
}

export type TranslationKey = keyof TranslationDictionary;

export const TRANSLATIONS: Record<AppLanguageCode, TranslationDictionary> = {
  en,
  sk,
  de,
  fr,
  es,
};