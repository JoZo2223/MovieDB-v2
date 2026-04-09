import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageStore, Language } from '../store/language-store';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcherComponent {
  readonly store = inject(LanguageStore);

  isOpen = false;

  @Output() languageChange = new EventEmitter<string>();

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  setLanguage(lang: Language, event: Event): void {
    event.stopPropagation();
    this.store.setLanguage(lang.code);
    this.isOpen = false;
    this.languageChange.emit(lang.code);
  }
}