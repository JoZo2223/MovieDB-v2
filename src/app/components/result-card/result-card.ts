import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { TmdbItem, ClientService, TmdbTranslationsResponse } from '../../../service/clientService';
import { getLanguageByCode, readStoredLanguage } from '../../i18n/language-config';
import { UtilsService } from '../../../service/utilsService';
import { TabType } from '../tabs/tabs';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './result-card.html',
  styleUrl: './result-card.css',
})
export class ResultCardComponent {
  private readonly client = inject(ClientService);
  private readonly translate = inject(TranslateService);
  private readonly utils = inject(UtilsService);

  readonly item = input.required<TmdbItem>();
  readonly type = input.required<TabType>();
  readonly cardClick = output<TmdbItem>();

  readonly translatedOverview = signal('');
  readonly isLoadingTranslation = signal(false);
  private readonly hasTriedTranslation = signal(false);

  readonly posterUrl = computed(() => this.utils.getPosterUrl(this.item().poster_path));
  readonly title = computed(() => this.utils.getDisplayTitle(this.item(), ''));
  readonly overview = computed(() => this.translatedOverview() || this.item().overview || '');

  onClick(): void {
    this.cardClick.emit(this.item());
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cardClick.emit(this.item());
    }
  }

  onHover(): void {
    if (
      this.item().overview ||
      this.translatedOverview() ||
      this.isLoadingTranslation() ||
      this.hasTriedTranslation()
    ) {
      return;
    }

    this.hasTriedTranslation.set(true);
    this.isLoadingTranslation.set(true);

    const request =
      this.type() === 'movies'
        ? this.client.getMovieTranslations(this.item().id)
        : this.client.getSeriesTranslations(this.item().id);

    request.subscribe({
      next: (response: TmdbTranslationsResponse) => {
        const selectedLanguage = getLanguageByCode(
          this.translate.currentLang || readStoredLanguage(),
        );
        const translatedOverview = this.utils.getTranslatedOverview(
          response,
          selectedLanguage.tmdbCode,
          selectedLanguage.code,
        );

        this.translatedOverview.set(translatedOverview);
      },
      error: (error) => {
        console.error('Translation load error:', error);
        this.isLoadingTranslation.set(false);
      },
      complete: () => {
        this.isLoadingTranslation.set(false);
      },
    });
  }
}
