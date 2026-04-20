import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TmdbItem } from '../../../service/clientService';
import { HeaderComponent } from '../header/header';
import { TabsComponent, TabType } from '../tabs/tabs';
import { SearchFieldComponent } from '../search-field/search-field';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { ResultDetailsDialog } from '../result-details-dialog/result-details-dialog';
import { ResultsSectionComponent } from '../results-section/results-section';
import { SearchPageStore } from '../../store/search-page.store';

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

  readonly store = inject(SearchPageStore);

  @ViewChild('loadMoreTrigger', { static: false })
  loadMoreTrigger?: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;

  constructor() {
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
    const routeTab = this.resolveTabFromRoute();
    this.store.setActiveTab(routeTab);
    this.setupIntersectionObserver();
    this.store.initialize();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  setTab(tab: TabType): void {
    this.store.setActiveTab(tab);
    this.router.navigate([tab], { relativeTo: this.route.parent });
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

  private resolveTabFromRoute(): TabType {
    return this.router.url.includes('/series') ? 'series' : 'movies';
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
