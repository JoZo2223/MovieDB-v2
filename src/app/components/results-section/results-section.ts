import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { TmdbItem } from '../../../service/clientService';
import { TabType } from '../tabs/tabs';
import { ResultsListComponent } from '../result-list/result-list';
import { InfoMessageComponent } from '../info-message/info-message';
import { MessageOptions } from '../info-message/message-options';

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
  readonly showResultsList = input(false);
  readonly results = input<TmdbItem[]>([]);
  readonly activeTab = input<TabType>('movies');
  readonly messages = input<MessageOptions[]>([]);
  readonly favoriteIds = input<Set<string>>(new Set());
  readonly favoriteLoadingIds = input<Set<string>>(new Set());
  readonly itemSelected = output<TmdbItem>();
  readonly favoriteToggle = output<{ item: TmdbItem; type: TabType }>();

  onFavoriteToggle(event: { item: TmdbItem; type: TabType }): void {
    this.favoriteToggle.emit(event);
  }

  onItemSelected(item: TmdbItem): void {
    this.itemSelected.emit(item);
  }
}