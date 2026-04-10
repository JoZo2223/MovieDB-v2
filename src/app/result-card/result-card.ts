import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { TmdbItem, ClientService } from '../../service/clientService';
import { LanguageStore } from '../store/language-store';

@Component({
  selector: 'app-result-card',
  standalone: true,
  templateUrl: './result-card.html',
  styleUrl: './result-card.css',
})
export class ResultCardComponent {
  @Input({ required: true }) item!: TmdbItem;
  @Input({ required: true }) posterUrl!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) date!: string;
  @Input({ required: true }) type!: 'movies' | 'series'; // 👈 IMPORTANT

  @Output() cardClick = new EventEmitter<TmdbItem>();

  private client = inject(ClientService);
  private languageStore = inject(LanguageStore);

  translatedOverview?: string;
  private isLoadingTranslation = false;

  onClick(): void {
    this.cardClick.emit(this.item);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cardClick.emit(this.item);
    }
  }

  onHover(): void {
    if (this.item.overview || this.translatedOverview || this.isLoadingTranslation) {
      return;
    }

    this.isLoadingTranslation = true;

    const lang = this.languageStore.selectedTmdbLanguage();

    const request$ =
      this.type === 'movies'
        ? this.client.getMovieDetails(this.item.id, lang, true)
        : this.client.getSeriesDetails(this.item.id, lang, true);

    request$.subscribe((res) => {
      this.translatedOverview = res.overview || this.findFallback(res.translations);

      this.isLoadingTranslation = false;
    });
  }

  private findFallback(translations: any): string {
    if (!translations?.translations) return '';

    const selected = this.languageStore.selected();
    const [iso639, iso3166] = selected.tmdbCode.split('-');

    const match = translations.translations.find(
      (t: any) =>
        t.iso_639_1 === iso639.toLowerCase() &&
        t.iso_3166_1 === iso3166.toUpperCase() &&
        t.data?.overview,
    );

    return match?.data?.overview || '';
  }

  get overview(): string {
    return this.item.overview || this.translatedOverview || '';
  }
}
