import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ClientService, TmdbItem } from './clientService';
import { LanguageService } from './language.service';
import { TabType } from '../app/components/tabs/tabs';

export type FavoriteMediaType = 'movie' | 'tv';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly client = inject(ClientService);
  private readonly languageService = inject(LanguageService);

  private readonly itemsState = signal<TmdbItem[]>([]);
  private readonly loadingIdsState = signal<Set<string>>(new Set());

  readonly items = this.itemsState.asReadonly();
  readonly loadingIds = this.loadingIdsState.asReadonly();
  readonly isLoading = signal(false);
  readonly errorKey = signal('');
  readonly isConfigured = computed(() => this.client.isFavoritesConfigured());
  readonly favoriteIds = computed(() =>
    new Set(this.itemsState().map((item) => this.key(item.media_type ?? 'movie', item.id))),
  );

  load(): void {
    if (!this.client.isFavoritesConfigured()) {
      this.errorKey.set('FAVORITES.NOT_CONFIGURED');
      this.itemsState.set([]);
      return;
    }

    this.isLoading.set(true);
    this.errorKey.set('');
    const language = this.languageService.currentTmdbLanguage();

    forkJoin({
      movies: this.client.getAllFavoriteMovies(language),
      series: this.client.getAllFavoriteSeries(language),
    }).subscribe({
      next: ({ movies, series }) => {
        this.itemsState.set([...movies, ...series]);
      },
      error: (error) => {
        console.error('Favorites load error:', error);
        this.errorKey.set('FAVORITES.LOAD_ERROR');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  isFavorite(item: TmdbItem, tab: TabType): boolean {
    return this.favoriteIds().has(this.key(this.toMediaType(item, tab), item.id));
  }

  isUpdating(item: TmdbItem, tab: TabType): boolean {
    return this.loadingIdsState().has(this.key(this.toMediaType(item, tab), item.id));
  }

  toggle(item: TmdbItem, tab: TabType): void {
    if (!this.client.isFavoritesConfigured()) {
      this.errorKey.set('FAVORITES.NOT_CONFIGURED');
      return;
    }

    const mediaType = this.toMediaType(item, tab);
    const itemKey = this.key(mediaType, item.id);
    const shouldBeFavorite = !this.favoriteIds().has(itemKey);

    this.setUpdating(itemKey, true);
    this.errorKey.set('');

    this.client.updateFavorite(mediaType, item.id, shouldBeFavorite).subscribe({
      next: () => {
        if (shouldBeFavorite) {
          this.itemsState.update((items) => [
            { ...item, media_type: mediaType },
            ...items.filter((existing) =>
              this.key(existing.media_type ?? 'movie', existing.id) !== itemKey,
            ),
          ]);
        } else {
          this.itemsState.update((items) =>
            items.filter((existing) =>
              this.key(existing.media_type ?? 'movie', existing.id) !== itemKey,
            ),
          );
        }
      },
      error: (error) => {
        console.error('Favorite update error:', error);
        this.errorKey.set('FAVORITES.UPDATE_ERROR');
        this.setUpdating(itemKey, false);
      },
      complete: () => this.setUpdating(itemKey, false),
    });
  }

  getMediaTab(item: TmdbItem, fallback: TabType = 'movies'): TabType {
    if (item.media_type === 'tv') {
      return 'series';
    }

    if (item.media_type === 'movie') {
      return 'movies';
    }

    return fallback;
  }

  private toMediaType(item: TmdbItem, tab: TabType): FavoriteMediaType {
    return item.media_type ?? (tab === 'movies' ? 'movie' : 'tv');
  }

  private key(mediaType: FavoriteMediaType, id: number): string {
    return `${mediaType}-${id}`;
  }

  private setUpdating(key: string, updating: boolean): void {
    this.loadingIdsState.update((current) => {
      const next = new Set(current);
      updating ? next.add(key) : next.delete(key);
      return next;
    });
  }
}
