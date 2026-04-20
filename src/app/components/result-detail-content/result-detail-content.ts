import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { TmdbDetail, TmdbTranslationsResponse } from '../../../service/clientService';
import { UtilsService } from '../../../service/utilsService';
import { TabType } from '../tabs/tabs';

export type TmdbDetailWithTranslations = TmdbDetail & {
  translations?: TmdbTranslationsResponse;
};

@Component({
  selector: 'app-result-detail-content',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './result-detail-content.html',
  styleUrl: './result-detail-content.css',
})
export class ResultDetailContentComponent {
  private readonly utils = inject(UtilsService);

  readonly detail = input.required<TmdbDetailWithTranslations>();
  readonly type = input.required<TabType>();

  readonly title = computed(() => this.utils.getDisplayTitle(this.detail(), 'Untitled'));
  readonly date = computed(() => this.utils.getDisplayDate(this.detail(), 'Unknown date'));
  readonly posterUrl = computed(() => this.utils.getPosterUrl(this.detail().poster_path ?? null));
  readonly genreText = computed(() => this.detail().genres?.map((genre) => genre.name).join(', ') || '—');
}
