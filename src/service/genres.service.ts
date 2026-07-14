import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { ClientService, Genre, GenreCard, TmdbItem } from './clientService';
import { LanguageService } from './language.service';
import { TabType } from '../app/components/tabs/tabs';

@Injectable({ providedIn: 'root' })
export class GenresService {
  private readonly client = inject(ClientService);
  private readonly languageService = inject(LanguageService);

  readonly genres = signal<GenreCard[]>([]);
  readonly selectedGenre = signal<GenreCard | null>(null);
  readonly results = signal<TmdbItem[]>([]);
  readonly activeTab = signal<TabType>('movies');
  readonly isLoadingGenres = signal(false);
  readonly isLoadingResults = signal(false);
  readonly errorKey = signal('');

  readonly hasSelectedGenre = computed(() => this.selectedGenre() !== null);

  loadGenres(): void {
    this.selectedGenre.set(null);
    this.results.set([]);
    this.errorKey.set('');

    if (this.genres().length > 0) {
      return;
    }

    this.isLoadingGenres.set(true);
    const language = this.languageService.currentTmdbLanguage();

    forkJoin({
      movies: this.client.getMovieGenres(language),
      series: this.client.getSeriesGenres(language),
    })
      .pipe(
        map(({ movies, series }) => this.mergeGenres(movies.genres, series.genres)),
        switchMap((genres) => {
          if (genres.length === 0) {
            return of([] as GenreCard[]);
          }

          return forkJoin(
            genres.map((genre) =>
              this.client.getGenrePreview(genre.id, language, genre.mediaTypes[0]).pipe(
                map((previewPath) => ({ ...genre, previewPath })),
                catchError(() => of({ ...genre, previewPath: null })),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (genres) => this.genres.set(genres),
        error: (error) => {
          console.error('Genres load error:', error);
          this.errorKey.set('GENRES.LOAD_ERROR');
          this.isLoadingGenres.set(false);
        },
        complete: () => this.isLoadingGenres.set(false),
      });
  }

  selectGenre(genre: GenreCard): void {
    this.selectedGenre.set(genre);
    this.loadResults();
  }

  clearSelection(): void {
    this.selectedGenre.set(null);
    this.results.set([]);
    this.errorKey.set('');
  }

  setActiveTab(tab: TabType): void {
    if (this.activeTab() === tab) {
      return;
    }

    this.activeTab.set(tab);

    if (this.selectedGenre()) {
      this.loadResults();
    }
  }

  reload(): void {
    if (this.selectedGenre()) {
      this.loadResults();
    } else {
      this.genres.set([]);
      this.loadGenres();
    }
  }

  private loadResults(): void {
    const genre = this.selectedGenre();

    if (!genre) {
      return;
    }

    this.isLoadingResults.set(true);
    this.errorKey.set('');
    this.results.set([]);

    const language = this.languageService.currentTmdbLanguage();
    const request$ =
      this.activeTab() === 'movies'
        ? this.client.discoverMoviesByGenre(genre.id, language)
        : this.client.discoverSeriesByGenre(genre.id, language);

    request$.subscribe({
      next: (response) => this.results.set(response.results ?? []),
      error: (error) => {
        console.error('Genre results load error:', error);
        this.errorKey.set('GENRES.RESULTS_ERROR');
        this.isLoadingResults.set(false);
      },
      complete: () => this.isLoadingResults.set(false),
    });
  }

  private mergeGenres(movieGenres: Genre[], seriesGenres: Genre[]): GenreCard[] {
    const merged = new Map<number, GenreCard>();

    movieGenres.forEach((genre) => {
      merged.set(genre.id, {
        ...genre,
        mediaTypes: ['movie'],
        previewPath: null,
      });
    });

    seriesGenres.forEach((genre) => {
      const existing = merged.get(genre.id);

      if (existing) {
        existing.mediaTypes = [...new Set<'movie' | 'tv'>([...existing.mediaTypes, 'tv'])];
      } else {
        merged.set(genre.id, {
          ...genre,
          mediaTypes: ['tv'],
          previewPath: null,
        });
      }
    });

    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
}
