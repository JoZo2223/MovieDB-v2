import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, filter, finalize } from 'rxjs';
import { TmdbItem, ClientService } from '../service/clientService';
import { HeaderComponent } from '../header/header';
import { TabsComponent } from '../app/tabs/tabs';
import { SearchFieldComponent } from '../app/search-field/search-field';
import { ResultsListComponent } from '../app/result-list/result-list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResultDetailsDialog } from '../app/result-details-dialog/result-details-dialog';
import { LanguageSwitcherComponent } from '../app/language-switcher/language-switcher';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageStore } from '../app/store/language-store';

type TabType = 'movies' | 'series';

type TmdbResponse = {
  page: number;
  results: TmdbItem[];
  total_pages: number;
  total_results: number;
};

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TitleCasePipe,
    HeaderComponent,
    TabsComponent,
    SearchFieldComponent,
    ResultsListComponent,
    MatDialogModule,
    LanguageSwitcherComponent,
    TranslatePipe,
  ],
  templateUrl: './page.html',
  styleUrl: './page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPageComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private client = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private searchSubject = new Subject<string>();
  private languageStore = inject(LanguageStore);

  private observer?: IntersectionObserver;
  private loadMoreTrigger?: ElementRef<HTMLDivElement>;

  @ViewChild('loadMoreTrigger')
  set loadMoreTriggerSetter(element: ElementRef<HTMLDivElement> | undefined) {
    this.loadMoreTrigger = element;

    if (element) {
      this.setupIntersectionObserver();
    }
  }

  activeTab: TabType = 'movies';
  searchTerm = '';
  results: TmdbItem[] = [];

  isLoading = false;
  isLoadingMore = false;
  errorMessage = '';

  currentPage = 1;
  totalPages = 1;
  hasMoreResults = true;

  ngOnInit(): void {
    this.setTabFromRoute();

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((term) => term.trim().length >= 3 || term.trim().length === 0),
      )
      .subscribe(() => {
        this.resetAndLoadFirstPage();
      });

    this.resetAndLoadFirstPage();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  setTab(tab: TabType): void {
    this.router.navigate(['/' + tab]);
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  openDetails(item: TmdbItem): void {
    this.dialog.open(ResultDetailsDialog, {
      data: {
        id: item.id,
        type: this.activeTab,
      },
      width: '900px',
      maxWidth: '95vw',
      autoFocus: false,
    });
  }

  private resetAndLoadFirstPage(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.hasMoreResults = true;
    this.results = [];
    this.observer?.disconnect();
    this.observer = undefined;
    this.loadPage(1, false);
  }

  private loadNextPage(): void {
    if (!this.hasMoreResults || this.isLoading || this.isLoadingMore) {
      return;
    }

    this.loadPage(this.currentPage + 1, true);
  }

  private loadPage(page: number, append: boolean): void {
    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
      this.errorMessage = '';
    }

    this.cdr.markForCheck();

    this.getRequest(this.searchTerm, page)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.isLoadingMore = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: TmdbResponse) => {
          const newItems = response.results;

          this.currentPage = response.page;
          this.totalPages = response.total_pages;
          this.hasMoreResults = this.currentPage < this.totalPages;

          this.results = append ? [...this.results, ...newItems] : newItems;

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Load error:', error);
          this.errorMessage = 'Failed to load data from TMDB.';
          if (!append) {
            this.results = [];
          }
          this.cdr.markForCheck();
        },
      });
  }

  private setupIntersectionObserver(): void {
    if (!this.loadMoreTrigger?.nativeElement) {
      return;
    }

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          console.log('loadMoreTrigger intersected');
          this.loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0,
      },
    );

    this.observer.observe(this.loadMoreTrigger.nativeElement);
  }

  private setTabFromRoute(): void {
    const path = this.route.snapshot.routeConfig?.path;
    this.activeTab = path === 'series' ? 'series' : 'movies';
  }

  private getRequest(term: string, page: number) {
    const language = this.languageStore.selectedTmdbLanguage();

    return this.activeTab === 'movies'
      ? this.client.getMovies(term, page, language)
      : this.client.getSeries(term, page, language);
  }

  getDisplayTitle(item: TmdbItem): string {
    return item.title || item.name || 'Untitled';
  }

  getDisplayDate(item: TmdbItem): string {
    return item.release_date || item.first_air_date || 'Unknown date';
  }

  getPosterUrl(path: string | null): string {
    return this.client.getPosterUrl(path);
  }

  onLanguageChange(lang: string): void {
    console.log('Selected language:', lang);
    this.resetAndLoadFirstPage();
  }
}