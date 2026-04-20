import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

import { ClientService, TmdbItem } from '../../service/clientService';
import { getLanguageByCode, readStoredLanguage } from '../i18n/language-config';
import { TabType } from '../components/tabs/tabs';

@Injectable()
export class SearchPageStore {
  private readonly client = inject(ClientService);
  private readonly translate = inject(TranslateService);
  private readonly currentLangChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  readonly activeTab = signal<TabType>('movies');
  readonly searchTerm = signal('');
  readonly results = signal<TmdbItem[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly errorMessage = signal('');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly hasSearched = signal(false);
  readonly initialized = signal(false);

  readonly hasResults = computed(() => this.results().length > 0);
  readonly hasMoreResults = computed(() => this.currentPage() < this.totalPages());

  readonly showLoading = computed(() => this.isLoading());
  readonly showError = computed(() => !!this.errorMessage());
  readonly showResultCount = computed(() => !this.isLoading() && !this.errorMessage() && this.hasResults());
  readonly showResultsList = computed(() => !this.isLoading() && !this.errorMessage() && this.hasResults());
  readonly showLoadingMore = computed(() => this.showResultsList() && this.isLoadingMore());
  readonly showNoMoreResults = computed(() => this.showResultsList() && !this.hasMoreResults());
  readonly showNoResults = computed(
    () => !this.isLoading() && !this.errorMessage() && !this.hasResults() && this.hasSearched(),
  );

  constructor() {
    effect(() => {
      this.currentLangChange();

      if (!this.initialized()) {
        return;
      }

      untracked(() => this.runSearch(true));
    });
  }

  initialize(): void {
    if (this.initialized()) {
      return;
    }

    this.initialized.set(true);
    this.runSearch(true);
  }

  setActiveTab(tab: TabType): void {
    if (this.activeTab() === tab) {
      return;
    }

    this.activeTab.set(tab);
    this.runSearch(true);
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);

    if (value.length === 0 || value.trim().length >= 3) {
      this.runSearch(true);
    }
  }

  runSearch(resetPage: boolean): void {
    if (this.isLoading() || this.isLoadingMore()) {
      return;
    }

    const query = this.searchTerm().trim();
    const language = this.getSelectedLanguage().tmdbCode;

    if (resetPage) {
      this.currentPage.set(1);
      this.totalPages.set(1);
      this.results.set([]);
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.hasSearched.set(true);

    const request$ =
      this.activeTab() === 'movies'
        ? this.client.getMovies(query, 1, language)
        : this.client.getSeries(query, 1, language);

    request$.subscribe({
      next: (response) => {
        this.results.set(response.results ?? []);
        this.currentPage.set(response.page ?? 1);
        this.totalPages.set(response.total_pages ?? 1);
      },
      error: () => {
        this.errorMessage.set('RESULTS.ERROR');
        this.results.set([]);
        this.currentPage.set(1);
        this.totalPages.set(1);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMoreResults()) {
      return;
    }

    const nextPage = this.currentPage() + 1;
    const query = this.searchTerm().trim();
    const language = this.getSelectedLanguage().tmdbCode;

    this.isLoadingMore.set(true);

    const request$ =
      this.activeTab() === 'movies'
        ? this.client.getMovies(query, nextPage, language)
        : this.client.getSeries(query, nextPage, language);

    request$.subscribe({
      next: (response) => {
        const newResults = response.results ?? [];

        this.results.update((current) => [...current, ...newResults]);
        this.currentPage.set(response.page ?? nextPage);
        this.totalPages.set(response.total_pages ?? this.totalPages());
      },
      error: () => {
        this.errorMessage.set('RESULTS.ERROR_LOAD_MORE');
      },
      complete: () => {
        this.isLoadingMore.set(false);
      },
    });
  }

  private getSelectedLanguage() {
    return getLanguageByCode(this.translate.currentLang || readStoredLanguage());
  }
}
