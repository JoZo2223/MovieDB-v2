import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap } from 'rxjs';
import { TmdbItem, ClientService } from '../service/clientService';

type TabType = 'movies' | 'series';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private client = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);
  private searchSubject = new Subject<string>();

  activeTab: TabType = 'movies';
  searchTerm = '';
  results: TmdbItem[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => {
        this.isLoading = true;
        this.errorMessage = '';
        this.cdr.markForCheck();

        return (this.activeTab === 'movies'
          ? this.client.getMovies(term)
          : this.client.getSeries(term)
        ).pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          })
        );
      })
    ).subscribe({
      next: (response) => {
        console.log('Search response:', response);
        this.results = response.results.slice(0, 10);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.errorMessage = 'Failed to load data from TMDB.';
        this.results = [];
        this.cdr.markForCheck();
      }
    });

    this.loadData();
  }

  setTab(tab: TabType): void {
    this.activeTab = tab;
    this.searchTerm = '';
    this.loadData();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const request$ = this.activeTab === 'movies'
      ? this.client.getMovies(this.searchTerm)
      : this.client.getSeries(this.searchTerm);

    request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Component response:', response);
          this.results = response.results.slice(0, 10);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Load error:', error);
          this.errorMessage = 'Failed to load data from TMDB.';
          this.results = [];
          this.cdr.markForCheck();
        }
      });
  }

  getDisplayTitle(item: TmdbItem): string {
    return item.title || item.name || 'Untitled';
  }

  getDisplayDate(item: TmdbItem): string {
    return item.release_date || item.first_air_date || 'Unknown date';
  }

  getPosterUrl(path: string | null): string {
    return this.client.getPosterUrl(path);
  }
}