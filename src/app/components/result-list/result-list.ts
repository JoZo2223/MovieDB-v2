import { Component, computed, input, output } from '@angular/core';
import { TmdbItem } from '../../../service/clientService';
import { ResultCardComponent } from '../result-card/result-card';
import { TabType } from '../tabs/tabs';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [ResultCardComponent],
  templateUrl: './result-list.html',
  styleUrl: './result-list.css',
})
export class ResultsListComponent {
  readonly results = input<TmdbItem[]>([]);
  readonly activeTab = input<TabType>('movies');
  readonly favoriteIds = input<Set<string>>(new Set());
  readonly favoriteLoadingIds = input<Set<string>>(new Set());
  readonly itemSelected = output<TmdbItem>();
  readonly favoriteToggle = output<{ item: TmdbItem; type: TabType }>();

  readonly items = computed(() => this.results() ?? []);

  getItemType(item: TmdbItem): TabType {
    return item.media_type === 'tv' ? 'series' : item.media_type === 'movie' ? 'movies' : this.activeTab();
  }

  getFavoriteKey(item: TmdbItem): string {
    return `${this.getItemType(item) === 'movies' ? 'movie' : 'tv'}-${item.id}`;
  }

  onFavoriteToggle(item: TmdbItem): void {
    this.favoriteToggle.emit({ item, type: this.getItemType(item) });
  }

  onItemSelected(item: TmdbItem): void {
    this.itemSelected.emit(item);
  }

  trackById = (index: number, item: TmdbItem): string =>
    `${this.activeTab()}-${item.id}-${index}`;
}