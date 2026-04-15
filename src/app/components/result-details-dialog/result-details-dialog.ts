import { Component, Inject, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ClientService, TmdbDetail, TmdbTranslationsResponse } from '../../../service/clientService';
import { LanguageStore } from '../../languageStore/language-store';
import { UtilsService } from '../../../service/utilsService';
import { AppTranslateService } from '../../../service/translationService';
import { TabType } from '../tabs/tabs';

type DetailDialogData = {
  id: number;
  type: TabType;
};

type TmdbDetailWithTranslations = TmdbDetail & {
  translations?: TmdbTranslationsResponse;
};

@Component({
  selector: 'app-result-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './result-details-dialog.html',
  styleUrl: './result-details-dialog.css',
})
export class ResultDetailsDialog {
  private readonly client = inject(ClientService);
  private readonly dialogRef = inject(MatDialogRef<ResultDetailsDialog>);
  private readonly languageStore = inject(LanguageStore);
  private readonly utils = inject(UtilsService);
  private readonly translate = inject(AppTranslateService);

  readonly detail = signal<TmdbDetailWithTranslations | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly title = computed(() =>
    this.utils.getDisplayTitle(this.detail(), this.translate.text('detailsUntitled')),
  );
  readonly date = computed(() =>
    this.utils.getDisplayDate(this.detail(), this.translate.text('detailsUnknownDate')),
  );
  readonly posterUrl = computed(() => this.utils.getPosterUrl(this.detail()?.poster_path ?? null));
  readonly genreText = computed(
    () => this.detail()?.genres?.map((genre) => genre.name).join(', ') || this.translate.text('detailsUnknown'),
  );

  readonly loadingLabel = computed(() => this.translate.text('detailsLoading'));
  readonly releaseDateLabel = computed(() => this.translate.text('detailsReleaseDate'));
  readonly ratingLabel = computed(() => this.translate.text('detailsRating'));
  readonly genresLabel = computed(() => this.translate.text('detailsGenres'));
  readonly statusLabel = computed(() => this.translate.text('detailsStatus'));
  readonly runtimeLabel = computed(() => this.translate.text('detailsRuntime'));
  readonly seasonsLabel = computed(() => this.translate.text('detailsSeasons'));
  readonly episodesLabel = computed(() => this.translate.text('detailsEpisodes'));
  readonly unknownLabel = computed(() => this.translate.text('detailsUnknown'));
  readonly noImageLabel = computed(() => this.translate.text('detailsNoImage'));
  readonly noOverviewLabel = computed(() => this.translate.text('detailsNoOverview'));

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: DetailDialogData) {
    queueMicrotask(() => this.loadDetails());
  }

  private loadDetails(): void {
    const tmdbLanguage = this.languageStore.selectedTmdbLanguage();
    const request =
      this.data.type === 'movies'
        ? this.client.getMovieDetails(this.data.id, tmdbLanguage, true)
        : this.client.getSeriesDetails(this.data.id, tmdbLanguage, true);

    request.subscribe({
      next: (response) => {
        const overview =
          response.overview ||
          this.utils.getTranslatedOverview(
            response.translations,
            this.languageStore.selected().tmdbCode,
            this.languageStore.selected().code,
          );

        this.detail.set({
          ...response,
          overview,
        });
      },
      error: (error) => {
        console.error('Detail load error:', error);
        this.errorMessage.set(this.translate.text('detailsError'));
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
