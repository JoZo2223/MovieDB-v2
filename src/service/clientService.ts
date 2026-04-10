import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;

  private createParams(params: Record<string, string>): HttpParams {
    let httpParams = new HttpParams().set('api_key', environment.tmdbToken);

    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key]);
    });

    return httpParams;
  }

  getMovies(query: string, page: number = 1, language: string = 'en-US'): Observable<TmdbResponse> {
    const trimmedQuery = query.trim();
    const endpoint = trimmedQuery ? '/search/movie' : '/discover/movie';

    const params = trimmedQuery
      ? this.createParams({
          query: trimmedQuery,
          language,
          page: String(page)
        })
      : this.createParams({
          language,
          page: String(page),
          sort_by: 'popularity.desc'
        });

    return this.http.get<TmdbResponse>(`${this.baseUrl}${endpoint}`, { params }).pipe(
      tap(response => console.log('Movies response:', response))
    );
  }

  getSeries(query: string, page: number = 1, language: string = 'en-US'): Observable<TmdbResponse> {
    const trimmedQuery = query.trim();
    const endpoint = trimmedQuery ? '/search/tv' : '/discover/tv';

    const params = trimmedQuery
      ? this.createParams({
          query: trimmedQuery,
          language,
          page: String(page)
        })
      : this.createParams({
          language,
          page: String(page),
          sort_by: 'popularity.desc'
        });

    return this.http.get<TmdbResponse>(`${this.baseUrl}${endpoint}`, { params }).pipe(
      tap(response => console.log('Series response:', response))
    );
  }

  getMovieDetails(
  id: number,
  language: string = 'en-US',
  includeTranslations: boolean = false
): Observable<TmdbDetail & { translations?: TmdbTranslationsResponse }> {
  const params = this.createParams({
    language,
    ...(includeTranslations ? { append_to_response: 'translations' } : {})
  });

  return this.http.get<TmdbDetail & { translations?: TmdbTranslationsResponse }>(
    `${this.baseUrl}/movie/${id}`,
    { params }
  ).pipe(
    tap(response => console.log('Movie detail response:', response))
  );
}

getSeriesDetails(
  id: number,
  language: string = 'en-US',
  includeTranslations: boolean = false
): Observable<TmdbDetail & { translations?: TmdbTranslationsResponse }> {
  const params = this.createParams({
    language,
    ...(includeTranslations ? { append_to_response: 'translations' } : {})
  });

  return this.http.get<TmdbDetail & { translations?: TmdbTranslationsResponse }>(
    `${this.baseUrl}/tv/${id}`,
    { params }
  ).pipe(
    tap(response => console.log('Series detail response:', response))
  );
}

  getMovieTranslations(id: number): Observable<TmdbTranslationsResponse> {
    const params = this.createParams({});

    return this.http.get<TmdbTranslationsResponse>(`${this.baseUrl}/movie/${id}/translations`, { params }).pipe(
      tap(response => console.log('Movie translations response:', response))
    );
  }

  getSeriesTranslations(id: number): Observable<TmdbTranslationsResponse> {
    const params = this.createParams({});

    return this.http.get<TmdbTranslationsResponse>(`${this.baseUrl}/tv/${id}/translations`, { params }).pipe(
      tap(response => console.log('Series translations response:', response))
    );
  }

  getPosterUrl(path: string | null): string {
    if (!path) {
      return '';
    }

    return `${environment.tmdbImageBaseUrl}${path}`;
  }
}