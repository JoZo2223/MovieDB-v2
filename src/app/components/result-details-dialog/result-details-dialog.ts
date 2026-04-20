import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ClientService } from '../../../service/clientService';
import { getLanguageByCode, readStoredLanguage } from '../../i18n/language-config';
import { UtilsService } from '../../../service/utilsService';
import { TabType } from '../tabs/tabs';
import {
  ResultDetailContentComponent,
  TmdbDetailWithTranslations,
} from '../result-detail-content/result-detail-content';
import { InfoMessageComponent } from '../info-message/info-message';

type DetailDialogData = {
  id: number;
  type: TabType;
};

@Component({
  selector: 'app-result-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TranslatePipe,
    ResultDetailContentComponent,
    InfoMessageComponent,
  ],
  templateUrl: './result-details-dialog.html',
  styleUrl: './result-details-dialog.css',
})
export class ResultDetailsDialog {
  private readonly client = inject(ClientService);
  private readonly dialogRef = inject(MatDialogRef<ResultDetailsDialog>);
  private readonly translate = inject(TranslateService);
  private readonly utils = inject(UtilsService);

  readonly detail = signal<TmdbDetailWithTranslations | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: DetailDialogData) {
    queueMicrotask(() => this.loadDetails());
  }

  private loadDetails(): void {
    const selectedLanguage = getLanguageByCode(
      this.translate.currentLang || readStoredLanguage(),
    );

    const request =
      this.data.type === 'movies'
        ? this.client.getMovieDetails(this.data.id, selectedLanguage.tmdbCode, true)
        : this.client.getSeriesDetails(this.data.id, selectedLanguage.tmdbCode, true);

    request.subscribe({
      next: (response) => {
        const overview =
          response.overview ||
          this.utils.getTranslatedOverview(
            response.translations,
            selectedLanguage.tmdbCode,
            selectedLanguage.code,
          );

        this.detail.set({
          ...response,
          overview,
        });
      },
      error: (error) => {
        console.error('Detail load error:', error);
        this.errorMessage.set('DETAILS.ERROR');
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
