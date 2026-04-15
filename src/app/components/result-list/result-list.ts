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
  readonly itemSelected = output<TmdbItem>();

  readonly items = computed(() => this.results() ?? []);

  onItemSelected(item: TmdbItem): void {
    this.itemSelected.emit(item);
  }

  trackById = (_index: number, item: TmdbItem): number => item.id;
}