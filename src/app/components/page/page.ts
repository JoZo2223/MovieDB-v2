import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ClientService, TmdbItem } from '../../../service/clientService';
import { AppTranslateService } from '../../../service/translationService';
import { LanguageStore } from '../../languageStore/language-store';

import { HeaderComponent } from '../header/header';
import { TabsComponent, TabType } from '../tabs/tabs';
import { SearchFieldComponent } from '../search-field/search-field';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { ResultsListComponent } from '../result-list/result-list';
import { ResultDetailsDialog } from '../result-details-dialog/result-details-dialog';
import { InfoMessageComponent } from '../info-message/info-message';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    HeaderComponent,
    TabsComponent,
    SearchFieldComponent,
    LanguageSwitcherComponent,
    ResultsListComponent,
    InfoMessageComponent,
  ],
  templateUrl: './page.html',
  styleUrl: './page.css',
})
export class SearchPageComponent implements AfterViewInit, OnDestroy {
  private readonly client = inject(ClientService);
  private readonly translate = inject(AppTranslateService);
  private readonly languageStore = inject(LanguageStore);
  private readonly dialog = inject(MatDialog);

  @ViewChild('loadMoreTrigger', { static: false })
  loadMoreTrigger?: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;
  private readonly initialized = signal(false);

  readonly activeTab = signal<TabType>('movies');
  readonly searchTerm = signal('');
  readonly results = signal<TmdbItem[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly errorMessage = signal('');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly hasSearched = signal(false);

  readonly hasResults = computed(() => this.results().length > 0);
  readonly hasMoreResults = computed(() => this.currentPage() < this.totalPages());

  readonly showLoading = computed(() => this.isLoading());
  readonly showError = computed(() => !!this.errorMessage());
  readonly showResultCount = computed(
    () => !this.isLoading() && !this.errorMessage() && this.hasResults(),
  );
  readonly showResultsList = computed(
    () => !this.isLoading() && !this.errorMessage() && this.hasResults(),
  );
  readonly showLoadingMore = computed(
    () => this.showResultsList() && this.isLoadingMore(),
  );
  readonly showNoMoreResults = computed(
    () => this.showResultsList() && !this.hasMoreResults(),
  );
  readonly showNoResults = computed(
    () => !this.isLoading() && !this.errorMessage() && !this.hasResults() && this.hasSearched(),
  );

  readonly headerTitle = computed(() => this.translate.text('headerTitle'));
  readonly headerSubtitle = computed(() => this.translate.text('headerSubtitle'));

  readonly searchPlaceholder = computed(() =>
    this.activeTab() === 'movies'
      ? this.translate.text('searchMovies')
      : this.translate.text('searchSeries'),
  );

  readonly resultsTitle = computed(() =>
    this.activeTab() === 'movies'
      ? this.translate.text('resultsMovies')
      : this.translate.text('resultsSeries'),
  );

  readonly resultCountLabel = computed(() =>
    this.translate.text('resultCount', { count: this.results().length }),
  );

  readonly resultsLoadingLabel = computed(() => this.translate.text('resultsLoading'));
  readonly resultsLoadingMoreLabel = computed(() => this.translate.text('resultsLoadingMore'));
  readonly resultsNoMoreLabel = computed(() => this.translate.text('resultsNoMore'));
  readonly resultsNoResultsLabel = computed(() => this.translate.text('resultsNoResults'));

  constructor() {
    effect(() => {
      this.languageStore.selectedLanguageCode();

      if (!this.initialized()) {
        return;
      }

      untracked(() => this.runSearch(true));
    });

    effect(() => {
      this.results();
      this.isLoading();
      this.isLoadingMore();

      if (!this.initialized()) {
        return;
      }

      queueMicrotask(() => {
        this.refreshObserver();
        this.tryAutoloadMore();
      });
    });
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    this.initialized.set(true);
    this.runSearch(true);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  setTab(tab: TabType): void {
    if (this.activeTab() === tab) {
      return;
    }

    this.activeTab.set(tab);
    this.runSearch(true);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);

    if (value.length === 0 || value.trim().length >= 3) {
      this.runSearch(true);
    }
  }

  openDetails(item: TmdbItem): void {
    this.dialog.open(ResultDetailsDialog, {
      data: {
        id: item.id,
        type: this.activeTab(),
      },
      width: '900px',
      maxWidth: '95vw',
      autoFocus: false,
    });
  }

  private setupIntersectionObserver(): void {
    if (!this.loadMoreTrigger) {
      return;
    }

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        if (this.isLoading() || this.isLoadingMore()) {
          return;
        }

        if (!this.hasMoreResults()) {
          return;
        }

        if (this.results().length === 0) {
          return;
        }

        this.loadMore();
      },
      {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0,
      },
    );

    this.observer.observe(this.loadMoreTrigger.nativeElement);
  }

  private refreshObserver(): void {
    if (!this.loadMoreTrigger || !this.observer) {
      return;
    }

    this.observer.unobserve(this.loadMoreTrigger.nativeElement);
    this.observer.observe(this.loadMoreTrigger.nativeElement);
  }

  private tryAutoloadMore(): void {
    if (!this.loadMoreTrigger) {
      return;
    }

    if (this.isLoading() || this.isLoadingMore()) {
      return;
    }

    if (!this.hasMoreResults()) {
      return;
    }

    if (this.results().length === 0) {
      return;
    }

    const rect = this.loadMoreTrigger.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top <= viewportHeight + 300) {
      this.loadMore();
    }
  }

  private runSearch(resetPage: boolean): void {
    if (this.isLoading() || this.isLoadingMore()) {
      return;
    }

    const query = this.searchTerm().trim();
    const language = this.languageStore.selectedTmdbLanguage();

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
        this.errorMessage.set(this.translate.text('resultsError'));
        this.results.set([]);
        this.currentPage.set(1);
        this.totalPages.set(1);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  private loadMore(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMoreResults()) {
      return;
    }

    const nextPage = this.currentPage() + 1;
    const query = this.searchTerm().trim();
    const language = this.languageStore.selectedTmdbLanguage();

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
        this.errorMessage.set(this.translate.text('errorLoadMore'));
      },
      complete: () => {
        this.isLoadingMore.set(false);
      },
    });
  }
}