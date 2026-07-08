import { Component, Inject, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { ClientService } from '../../../service/clientService';
import { UtilsService } from '../../../service/utilsService';
import { LanguageService } from '../../../service/language.service';
import { TabType } from '../tabs/tabs';
import {
  ResultDetailContentComponent,
  TmdbDetailWithTranslations,
} from '../result-detail-content/result-detail-content';
import { InfoMessageComponent } from '../info-message/info-message';
import { MessageOptions } from '../info-message/message-options';

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
  private readonly utils = inject(UtilsService);
  private readonly languageService = inject(LanguageService);

  readonly detail = signal<TmdbDetailWithTranslations | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly messages = computed<MessageOptions[]>(() => [
    {
      id: 'details-loading',
      visible: this.isLoading(),
      kind: 'loading',
      textKey: 'DETAILS.LOADING',
    },
    {
      id: 'details-error',
      visible: !!this.errorMessage(),
      kind: 'error',
      textKey: this.errorMessage(),
    },
  ]);

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: DetailDialogData) {
    queueMicrotask(() => this.loadDetails());
  }

  private loadDetails(): void {
    const selectedLanguage = this.languageService.currentLanguage();

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