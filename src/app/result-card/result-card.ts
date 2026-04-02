import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TmdbItem } from '../../service/clientService';

@Component({
  selector: 'app-result-card',
  standalone: true,
  templateUrl: './result-card.html',
  styleUrl: './result-card.css'
})
export class ResultCardComponent {
  @Input({ required: true }) item!: TmdbItem;
  @Input({ required: true }) posterUrl!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) date!: string;

  @Output() cardClick = new EventEmitter<TmdbItem>();

  onClick(): void {
    this.cardClick.emit(this.item);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cardClick.emit(this.item);
    }
  }
}