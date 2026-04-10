import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = {
  code: 'sk' | 'en' | 'de' | 'fr' | 'es';
  tmdbCode: 'sk-SK' | 'en-US' | 'de-DE' | 'fr-FR' | 'es-ES';
  label: string;
  flag: string;
};

@Injectable({
  providedIn: 'root'
})
export class LanguageStore {
  private readonly storageKey = 'selectedLanguage';
  private readonly translate = inject(TranslateService);

  readonly languages: Language[] = [
    { code: 'sk', tmdbCode: 'sk-SK', label: 'SK', flag: '/assets/flags/sk.png' },
    { code: 'en', tmdbCode: 'en-US', label: 'EN', flag: '/assets/flags/gb.png' },
    { code: 'de', tmdbCode: 'de-DE', label: 'DE', flag: '/assets/flags/de.png' },
    { code: 'fr', tmdbCode: 'fr-FR', label: 'FR', flag: '/assets/flags/fr.png' },
    { code: 'es', tmdbCode: 'es-ES', label: 'ES', flag: '/assets/flags/es.png' }
  ];

  private readonly selectedCode = signal<Language['code']>(
    (localStorage.getItem(this.storageKey) as Language['code']) || 'en'
  );

  readonly selected = computed(() =>
    this.languages.find(l => l.code === this.selectedCode()) ?? this.languages[1]
  );

  readonly selectedTmdbLanguage = computed(() => this.selected().tmdbCode);

  constructor() {
    this.translate.use(this.selectedCode());
  }

  setLanguage(code: Language['code']): void {
    this.selectedCode.set(code);
    localStorage.setItem(this.storageKey, code);
    this.translate.use(code);
  }
}