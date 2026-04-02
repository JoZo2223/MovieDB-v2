import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TmdbItem } from '../../service/clientService';
import { ResultCardComponent } from '../result-card/result-card';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [ResultCardComponent],
  templateUrl: './result-list.html',
  styleUrl: './result-list.css'
})
export class ResultsListComponent {
  @Input({ required: true }) results: TmdbItem[] = [];

  @Output() itemSelected = new EventEmitter<TmdbItem>();

  onItemSelected(item: TmdbItem): void {
    this.itemSelected.emit(item);
  }

  getPosterUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '';
  }

  getDisplayTitle(item: TmdbItem): string {
    return item.title || item.name || 'Untitled';
  }

  getDisplayDate(item: TmdbItem): string {
    return item.release_date || item.first_air_date || 'Unknown date';
  }
}