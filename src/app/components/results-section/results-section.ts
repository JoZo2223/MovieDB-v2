import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { TmdbItem } from '../../../service/clientService';
import { TabType } from '../tabs/tabs';
import { ResultsListComponent } from '../result-list/result-list';
import { InfoMessageComponent } from '../info-message/info-message';

@Component({
  selector: 'app-results-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ResultsListComponent, InfoMessageComponent],
  templateUrl: './results-section.html',
  styleUrl: './results-section.css',
})
export class ResultsSectionComponent {
  readonly titleKey = input.required<string>();
  readonly resultCount = input(0);
  readonly showResultCount = input(false);
  readonly showLoading = input(false);
  readonly showError = input(false);
  readonly errorMessage = input('');
  readonly showResultsList = input(false);
  readonly showLoadingMore = input(false);
  readonly showNoMoreResults = input(false);
  readonly showNoResults = input(false);
  readonly results = input<TmdbItem[]>([]);
  readonly activeTab = input<TabType>('movies');
  readonly itemSelected = output<TmdbItem>();

  onItemSelected(item: TmdbItem): void {
    this.itemSelected.emit(item);
  }
}
