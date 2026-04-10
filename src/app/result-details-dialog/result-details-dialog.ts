import { Component, Inject, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ClientService, TmdbDetail, TmdbTranslationsResponse } from '../../service/clientService';
import { LanguageStore } from '../store/language-store';

type DetailDialogData = {
  id: number;
  type: 'movies' | 'series';
};

type TmdbDetailWithTranslations = TmdbDetail & {
  translations?: TmdbTranslationsResponse;
};

@Component({
  selector: 'app-result-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './result-details-dialog.html',
  styleUrl: './result-details-dialog.css'
})
export class ResultDetailsDialog implements OnInit {
  private client = inject(ClientService);
  private dialogRef = inject(MatDialogRef<ResultDetailsDialog>);
  private cdr = inject(ChangeDetectorRef);
  private languageStore = inject(LanguageStore);

  detail?: TmdbDetailWithTranslations;
  isLoading = true;
  errorMessage = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: DetailDialogData) {}

  ngOnInit(): void {
    queueMicrotask(() => {
      this.loadDetails();
    });
  }

  private loadDetails(): void {
    const tmdbLanguage = this.languageStore.selected().tmdbCode;

    const request$ = this.data.type === 'movies'
      ? this.client.getMovieDetails(this.data.id, tmdbLanguage, true)
      : this.client.getSeriesDetails(this.data.id, tmdbLanguage, true);

    request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.detail = response;
          this.applyTranslationFallback();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Detail load error:', error);
          this.errorMessage = 'Failed to load detail data.';
          this.cdr.detectChanges();
        }
      });
  }

  private applyTranslationFallback(): void {
    if (!this.detail) {
      return;
    }

    if (this.detail.overview?.trim()) {
      return;
    }

    const selectedLanguage = this.languageStore.selected();
    const [iso639, iso3166] = selectedLanguage.tmdbCode.split('-');

    const translations = this.detail.translations?.translations ?? [];

    const exactMatch = translations.find(
      translation =>
        translation.iso_639_1?.toLowerCase() === iso639.toLowerCase() &&
        translation.iso_3166_1?.toUpperCase() === iso3166.toUpperCase() &&
        translation.data?.overview?.trim()
    );

    if (exactMatch?.data?.overview) {
      this.detail = {
        ...this.detail,
        overview: exactMatch.data.overview
      };
      return;
    }

    const languageOnlyMatch = translations.find(
      translation =>
        translation.iso_639_1?.toLowerCase() === selectedLanguage.code.toLowerCase() &&
        translation.data?.overview?.trim()
    );

    if (languageOnlyMatch?.data?.overview) {
      this.detail = {
        ...this.detail,
        overview: languageOnlyMatch.data.overview
      };
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  get title(): string {
    return this.detail?.title || this.detail?.name || 'Untitled';
  }

  get date(): string {
    return this.detail?.release_date || this.detail?.first_air_date || 'Unknown date';
  }

  get posterUrl(): string {
    return this.client.getPosterUrl(this.detail?.poster_path ?? null);
  }

  get genreText(): string {
    return this.detail?.genres?.map(genre => genre.name).join(', ') || 'Unknown';
  }
}