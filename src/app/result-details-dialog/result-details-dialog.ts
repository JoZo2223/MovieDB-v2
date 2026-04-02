import { Component, Inject, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ClientService, TmdbDetail } from '../../service/clientService';

type DetailDialogData = {
  id: number;
  type: 'movies' | 'series';
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

  detail?: TmdbDetail;
  isLoading = true;
  errorMessage = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: DetailDialogData) {}

  ngOnInit(): void {
    queueMicrotask(() => {
      this.loadDetails();
    });
  }

  private loadDetails(): void {
    const request$ = this.data.type === 'movies'
      ? this.client.getMovieDetails(this.data.id)
      : this.client.getSeriesDetails(this.data.id);

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
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Detail load error:', error);
          this.errorMessage = 'Failed to load detail data.';
          this.cdr.detectChanges();
        }
      });
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