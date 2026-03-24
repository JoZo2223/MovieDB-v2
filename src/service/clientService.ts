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

interface TmdbResponse {
  page: number;
  results: TmdbItem[];
  total_pages: number;
  total_results: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;

  // ✅ helper for params (adds API key automatically)
  private createParams(params: Record<string, string>): HttpParams {
    let httpParams = new HttpParams().set('api_key', environment.tmdbToken);

    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key]);
    });

    return httpParams;
  }

  getMovies(query: string): Observable<TmdbResponse> {
    const endpoint = query.trim() ? '/search/movie' : '/discover/movie';

    const params = query.trim()
      ? this.createParams({
          query: query,
          language: 'en-US',
          page: '1'
        })
      : this.createParams({
          language: 'en-US',
          page: '1',
          sort_by: 'popularity.desc'
        });

    return this.http.get<TmdbResponse>(`${this.baseUrl}${endpoint}`, { params })
      .pipe(
        tap(response => {
          console.log('Movies response:', response);
        })
      );
  }

  getSeries(query: string): Observable<TmdbResponse> {
    const endpoint = query.trim() ? '/search/tv' : '/discover/tv';

    const params = query.trim()
      ? this.createParams({
          query: query,
          language: 'en-US',
          page: '1'
        })
      : this.createParams({
          language: 'en-US',
          page: '1',
          sort_by: 'popularity.desc'
        });

    return this.http.get<TmdbResponse>(`${this.baseUrl}${endpoint}`, { params })
      .pipe(
        tap(response => {
          console.log('Series response:', response);
        })
      );
  }

  getPosterUrl(path: string | null): string {
    if (!path) {
      return '';
    }

    return `${environment.tmdbImageBaseUrl}${path}`;
  }
}