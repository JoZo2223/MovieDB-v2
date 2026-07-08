import { computed, effect, inject, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

import { ClientService, TmdbItem } from '../../service/clientService';
import { TabType } from '../components/tabs/tabs';
import { LanguageService } from '../../service/language.service';

type SearchPageState = {
  activeTab: TabType;
  searchTerm: string;
  results: TmdbItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  errorMessage: string;
  currentPage: number;
  totalPages: number;
  hasSearched: boolean;
  initialized: boolean;
};

const initialState: SearchPageState = {
  activeTab: 'movies',
  searchTerm: '',
  results: [],
  isLoading: false,
  isLoadingMore: false,
  errorMessage: '',
  currentPage: 1,
  totalPages: 1,
  hasSearched: false,
  initialized: false,
};

function executeSearch(store: any, resetPage: boolean): void {
  if (store.isLoading() || store.isLoadingMore()) {
    return;
  }

  const query = store.searchTerm().trim();
  const language = store.languageService.currentTmdbLanguage();

  if (resetPage) {
    patchState(store, {
      currentPage: 1,
      totalPages: 1,
      results: [],
    });
  }

  patchState(store, {
    isLoading: true,
    errorMessage: '',
    hasSearched: true,
  });

  const request$ =
    store.activeTab() === 'movies'
      ? store.client.getMovies(query, 1, language)
      : store.client.getSeries(query, 1, language);

  request$.subscribe({
    next: (response: any) => {
      patchState(store, {
        results: response.results ?? [],
        currentPage: response.page ?? 1,
        totalPages: response.total_pages ?? 1,
      });
    },
    error: () => {
      patchState(store, {
        errorMessage: 'RESULTS.ERROR',
        results: [],
        currentPage: 1,
        totalPages: 1,
      });
    },
    complete: () => {
      patchState(store, { isLoading: false });
    },
  });
}

function executeLoadMore(store: any): void {
  const hasMoreResults = store.currentPage() < store.totalPages();

  if (store.isLoading() || store.isLoadingMore() || !hasMoreResults) {
    return;
  }

  const nextPage = store.currentPage() + 1;
  const query = store.searchTerm().trim();
  const language = store.languageService.currentTmdbLanguage();

  patchState(store, { isLoadingMore: true });

  const request$ =
    store.activeTab() === 'movies'
      ? store.client.getMovies(query, nextPage, language)
      : store.client.getSeries(query, nextPage, language);

  request$.subscribe({
    next: (response: any) => {
      patchState(store, {
        results: [...store.results(), ...(response.results ?? [])],
        currentPage: response.page ?? nextPage,
        totalPages: response.total_pages ?? store.totalPages(),
      });
    },
    error: () => {
      patchState(store, {
        errorMessage: 'RESULTS.ERROR_LOAD_MORE',
      });
    },
    complete: () => {
      patchState(store, { isLoadingMore: false });
    },
  });
}

export const SearchPageStore = signalStore(
  withState(initialState),

  withProps(() => ({
    client: inject(ClientService),
    languageService: inject(LanguageService),
  })),

  withComputed((store) => ({
    hasResults: computed(() => store.results().length > 0),
    hasMoreResults: computed(() => store.currentPage() < store.totalPages()),

    showLoading: computed(() => store.isLoading()),
    showError: computed(() => !!store.errorMessage()),
    showResultCount: computed(
      () => !store.isLoading() && !store.errorMessage() && store.results().length > 0,
    ),
    showResultsList: computed(
      () => !store.isLoading() && !store.errorMessage() && store.results().length > 0,
    ),
    showLoadingMore: computed(
      () =>
        !store.isLoading() &&
        !store.errorMessage() &&
        store.results().length > 0 &&
        store.isLoadingMore(),
    ),
    showNoMoreResults: computed(
      () =>
        !store.isLoading() &&
        !store.errorMessage() &&
        store.results().length > 0 &&
        store.currentPage() >= store.totalPages(),
    ),
    showNoResults: computed(
      () =>
        !store.isLoading() &&
        !store.errorMessage() &&
        store.results().length === 0 &&
        store.hasSearched(),
    ),
  })),

  withMethods((store) => ({
    initialize(): void {
      if (store.initialized()) {
        return;
      }

      patchState(store, { initialized: true });
      executeSearch(store, true);
    },

    setActiveTab(tab: TabType): void {
      if (store.activeTab() === tab) {
        return;
      }

      patchState(store, { activeTab: tab });

      if (store.initialized()) {
        executeSearch(store, true);
      }
    },

    setSearchTerm(value: string): void {
      patchState(store, { searchTerm: value });

      if (value.length === 0 || value.trim().length >= 3) {
        executeSearch(store, true);
      }
    },

    reload(): void {
      executeSearch(store, true);
    },

    loadMore(): void {
      executeLoadMore(store);
    },
  })),

  withHooks({
    onInit(store) {
      effect(() => {
        store.languageService.currentLanguageCode();

        if (!store.initialized()) {
          return;
        }

        untracked(() => executeSearch(store, true));
      });
    },
  }),
);