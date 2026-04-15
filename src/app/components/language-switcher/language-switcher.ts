import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageStore, Language } from '../../languageStore/language-store';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcherComponent {
  readonly store = inject(LanguageStore);
  readonly isOpen = signal(false);
  readonly availableLanguages = computed(() => this.store.languages);
  readonly selectedLanguage = this.store.selected;

  toggleDropdown(): void {
    this.isOpen.update((value) => !value);
  }

  setLanguage(language: Language, event: Event): void {
    event.stopPropagation();
    this.store.setLanguage(language.code);
    this.isOpen.set(false);
  }
}