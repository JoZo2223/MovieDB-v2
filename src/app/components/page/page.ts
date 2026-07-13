import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TmdbItem } from '../../../service/clientService';
import { HeaderComponent } from '../header/header';
import { TabsComponent, TabType, isTabType } from '../tabs/tabs';
import { SearchFieldComponent } from '../search-field/search-field';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { SidebarComponent } from '../sidebar/sidebar';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';
import { ResultDetailsDialog } from '../result-details-dialog/result-details-dialog';
import { ResultsSectionComponent } from '../results-section/results-section';
import { SearchPageStore } from '../../store/search-page.store';
import { MessageOptions } from '../info-message/message-options';
import { LanguageService } from '../../../service/language.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TranslatePipe,
    HeaderComponent,
    TabsComponent,
    SearchFieldComponent,
    LanguageSwitcherComponent,
    SidebarComponent,
    ThemeToggleComponent,
    ResultsSectionComponent,
  ],
  providers: [SearchPageStore],
  templateUrl: './page.html',
  styleUrl: './page.css',
})
export class SearchPageComponent implements AfterViewInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);

  readonly store = inject(SearchPageStore);

  readonly resultMessages = computed<MessageOptions[]>(() => [
    {
      id: 'loading',
      visible: this.store.showLoading(),
      kind: 'loading',
      textKey: 'RESULTS.LOADING',
    },
    {
      id: 'error',
      visible: this.store.showError(),
      kind: 'error',
      textKey: this.store.errorMessage(),
    },
    {
      id: 'loading-more',
      visible: this.store.showLoadingMore(),
      kind: 'loading',
      textKey: 'RESULTS.LOADING_MORE',
    },
    {
      id: 'no-more-results',
      visible: this.store.showNoMoreResults(),
      kind: 'info',
      textKey: 'RESULTS.NO_MORE',
    },
    {
      id: 'no-results',
      visible: this.store.showNoResults(),
      kind: 'empty',
      textKey: 'RESULTS.NO_RESULTS',
    },
  ]);

  @ViewChild('loadMoreTrigger', { static: false })
  loadMoreTrigger?: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const langParam = params.get('lang');
        const tabParam = params.get('tab');

        const normalizedLanguage = this.languageService.syncFromRoute(langParam);
        const normalizedTab: TabType = isTabType(tabParam) ? tabParam : 'movies';

        const shouldRedirect = normalizedLanguage !== langParam || normalizedTab !== tabParam;

        this.store.setActiveTab(normalizedTab);

        if (!this.store.initialized()) {
          this.store.initialize();
        }

        if (shouldRedirect) {
          this.router.navigate(['/', normalizedLanguage, normalizedTab], {
            replaceUrl: true,
          });
        }
      });

    effect(() => {
      this.store.results();
      this.store.isLoading();
      this.store.isLoadingMore();

      if (!this.store.initialized()) {
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
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  setTab(tab: TabType): void {
    this.router.navigate(['/', this.languageService.currentLanguageCode(), tab]);
  }

  onSearchChange(value: string): void {
    this.store.setSearchTerm(value);
  }

  openDetails(item: TmdbItem): void {
    this.dialog.open(ResultDetailsDialog, {
      data: {
        id: item.id,
        type: this.store.activeTab(),
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

        if (this.store.isLoading() || this.store.isLoadingMore()) {
          return;
        }

        if (!this.store.hasMoreResults()) {
          return;
        }

        if (this.store.results().length === 0) {
          return;
        }

        this.store.loadMore();
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

    if (this.store.isLoading() || this.store.isLoadingMore()) {
      return;
    }

    if (!this.store.hasMoreResults()) {
      return;
    }

    if (this.store.results().length === 0) {
      return;
    }

    const rect = this.loadMoreTrigger.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top <= viewportHeight + 300) {
      this.store.loadMore();
    }
  }
}