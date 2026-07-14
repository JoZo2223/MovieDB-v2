import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, shareReplay, tap } from 'rxjs';
import { environment } from '../../enviroment';

export interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

export interface Genre {
  id: number;
  name: string;
}

export interface TmdbDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genres: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
}


export interface TmdbFavoriteRequest {
  media_type: 'movie' | 'tv';
  media_id: number;
  favorite: boolean;
}

export interface TmdbFavoriteResponse {
  status_code: number;
  status_message: string;
}

export interface TmdbResponse {
  page: number;
  results: TmdbItem[];
  total_pages: number;
  total_results: number;
}

export interface TmdbTranslationData {
  title?: string;
  name?: string;
  overview?: string;
  homepage?: string;
  tagline?: string;
}

export interface TmdbTranslation {
  iso_3166_1: string;
  iso_639_1: string;
  name: string;
  english_name: string;
  data: TmdbTranslationData;
}

export interface TmdbTranslationsResponse {
  id: number;
  translations: TmdbTranslation[];
}

type CacheEntry<T> = {
  expiresAt: number;
  value$: Observable<T>;
};

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.tmdbBaseUrl;

  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly cacheTtlMs = 5 * 60 * 1000; 

  private createParams(params: Record<string, string>): HttpParams {
    let httpParams = new HttpParams().set('api_key', environment.tmdbToken);

    Object.keys(params).forEach((key) => {
      httpParams = httpParams.set(key, params[key]);
    });

    return httpParams;
  }

  private getFromCache<T>(key: string): Observable<T> | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value$ as Observable<T>;
  }

  private saveToCache<T>(key: string, request$: Observable<T>): Observable<T> {
    const shared$ = request$.pipe(
      shareReplay(1),
    );

    this.cache.set(key, {
      expiresAt: Date.now() + this.cacheTtlMs,
      value$: shared$,
    });

    return shared$;
  }

  private getOrCreateCache<T>(key: string, factory: () => Observable<T>): Observable<T> {
    const cached = this.getFromCache<T>(key);

    if (cached) {
      return cached;
    }

    return this.saveToCache(key, factory());
  }

  private buildListCacheKey(
    type: 'movie' | 'tv',
    query: string,
    page: number,
    language: string,
  ): string {
    return `${type}|q=${query.trim()}|page=${page}|lang=${language}`;
  }

  private buildDetailCacheKey(
    type: 'movie' | 'tv',
    id: number,
    language: string,
    includeTranslations: boolean,
  ): string {
    return `${type}|id=${id}|lang=${language}|translations=${includeTranslations}`;
  }

  getMovies(
    query: string,
    page: number = 1,
    language: string = 'en-US',
  ): Observable<TmdbResponse> {
    const trimmedQuery = query.trim();
    const endpoint = trimmedQuery ? '/search/movie' : '/discover/movie';

    const params = trimmedQuery
      ? this.createParams({
          query: trimmedQuery,
          language,
          page: String(page),
        })
      : this.createParams({
          language,
          page: String(page),
          sort_by: 'popularity.desc',
        });

    const cacheKey = this.buildListCacheKey('movie', trimmedQuery, page, language);

    return this.getOrCreateCache(cacheKey, () =>
      this.http.get<TmdbResponse>(`${this.baseUrl}${endpoint}`, { params }).pipe(
        tap((response) => console.log('Movies response:', response)),
      ),
    );
  }

  getSeries(
    query: string,
    page: number = 1,
    language: string = 'en-US',
  ): Observable<TmdbResponse> {
    const trimmedQuery = query.trim();
    const endpoint = trimmedQuery ? '/search/tv' : '/discover/tv';

    const params = trimmedQuery
      ? this.createParams({
          query: trimmedQuery,
          language,
          page: String(page),
        })
      : this.createParams({
          language,
          page: String(page),
          sort_by: 'popularity.desc',
        });

    const cacheKey = this.buildListCacheKey('tv', trimmedQuery, page, language);

    return this.getOrCreateCache(cacheKey, () =>
      this.http.get<TmdbResponse>(`${this.baseUrl}${endpoint}`, { params }).pipe(
        tap((response) => console.log('Series response:', response)),
      ),
    );
  }

  getMovieDetails(
    id: number,
    language: string = 'en-US',
    includeTranslations: boolean = false,
  ): Observable<TmdbDetail & { translations?: TmdbTranslationsResponse }> {
    const params = this.createParams({
      language,
      ...(includeTranslations ? { append_to_response: 'translations' } : {}),
    });

    const cacheKey = this.buildDetailCacheKey('movie', id, language, includeTranslations);

    return this.getOrCreateCache(cacheKey, () =>
      this.http
        .get<TmdbDetail & { translations?: TmdbTranslationsResponse }>(
          `${this.baseUrl}/movie/${id}`,
          { params },
        )
        .pipe(
          tap((response) => console.log('Movie detail response:', response)),
        ),
    );
  }

  getSeriesDetails(
    id: number,
    language: string = 'en-US',
    includeTranslations: boolean = false,
  ): Observable<TmdbDetail & { translations?: TmdbTranslationsResponse }> {
    const params = this.createParams({
      language,
      ...(includeTranslations ? { append_to_response: 'translations' } : {}),
    });

    const cacheKey = this.buildDetailCacheKey('tv', id, language, includeTranslations);

    return this.getOrCreateCache(cacheKey, () =>
      this.http
        .get<TmdbDetail & { translations?: TmdbTranslationsResponse }>(
          `${this.baseUrl}/tv/${id}`,
          { params },
        )
        .pipe(
          tap((response) => console.log('Series detail response:', response)),
        ),
    );
  }

  getMovieTranslations(id: number): Observable<TmdbTranslationsResponse> {
    const params = this.createParams({});
    const cacheKey = `movie-translations|id=${id}`;

    return this.getOrCreateCache(cacheKey, () =>
      this.http
        .get<TmdbTranslationsResponse>(`${this.baseUrl}/movie/${id}/translations`, { params })
        .pipe(
          tap((response) => console.log('Movie translations response:', response)),
        ),
    );
  }

  getSeriesTranslations(id: number): Observable<TmdbTranslationsResponse> {
    const params = this.createParams({});
    const cacheKey = `tv-translations|id=${id}`;

    return this.getOrCreateCache(cacheKey, () =>
      this.http
        .get<TmdbTranslationsResponse>(`${this.baseUrl}/tv/${id}/translations`, { params })
        .pipe(
          tap((response) => console.log('Series translations response:', response)),
        ),
    );
  }

  isFavoritesConfigured(): boolean {
    return environment.tmdbAccountId > 0 && environment.tmdbSessionId.trim().length > 0;
  }

  updateFavorite(
    mediaType: 'movie' | 'tv',
    mediaId: number,
    favorite: boolean,
  ): Observable<TmdbFavoriteResponse> {
    const params = this.createParams({ session_id: environment.tmdbSessionId });
    const body: TmdbFavoriteRequest = {
      media_type: mediaType,
      media_id: mediaId,
      favorite,
    };

    return this.http.post<TmdbFavoriteResponse>(
      `${this.baseUrl}/account/${environment.tmdbAccountId}/favorite`,
      body,
      { params },
    );
  }

  getFavoriteMovies(
    page: number = 1,
    language: string = 'en-US',
  ): Observable<TmdbResponse> {
    return this.getFavoritePage('movie', page, language);
  }

  getFavoriteSeries(
    page: number = 1,
    language: string = 'en-US',
  ): Observable<TmdbResponse> {
    return this.getFavoritePage('tv', page, language);
  }

  getAllFavoriteMovies(language: string = 'en-US'): Observable<TmdbItem[]> {
    return this.getAllFavorites('movie', language);
  }

  getAllFavoriteSeries(language: string = 'en-US'): Observable<TmdbItem[]> {
    return this.getAllFavorites('tv', language);
  }

  private getFavoritePage(
    mediaType: 'movie' | 'tv',
    page: number,
    language: string,
  ): Observable<TmdbResponse> {
    const path = mediaType === 'movie' ? 'movies' : 'tv';
    const params = this.createParams({
      session_id: environment.tmdbSessionId,
      language,
      page: String(page),
      sort_by: 'created_at.desc',
    });

    return this.http
      .get<TmdbResponse>(
        `${this.baseUrl}/account/${environment.tmdbAccountId}/favorite/${path}`,
        { params },
      )
      .pipe(
        map((response) => ({
          ...response,
          results: (response.results ?? []).map((item) => ({
            ...item,
            media_type: mediaType,
          })),
        })),
      );
  }

  private getAllFavorites(
    mediaType: 'movie' | 'tv',
    language: string,
  ): Observable<TmdbItem[]> {
    return this.getFavoritePage(mediaType, 1, language).pipe(
      expand((response) =>
        response.page < response.total_pages
          ? this.getFavoritePage(mediaType, response.page + 1, language)
          : EMPTY,
      ),
      map((response) => response.results ?? []),
      reduce((allItems, pageItems) => [...allItems, ...pageItems], [] as TmdbItem[]),
    );
  }

  getPosterUrl(path: string | null): string {
    if (!path) {
      return '';
    }

    return `${environment.tmdbImageBaseUrl}${path}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearExpiredCache(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  clearSearchCache(): void {
    for (const key of this.cache.keys()) {
      if (
        key.startsWith('movie|') ||
        key.startsWith('tv|')
      ) {
        this.cache.delete(key);
      }
    }
  }


}