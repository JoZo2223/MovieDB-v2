import { Injectable, computed, signal } from '@angular/core';
import { AppLanguageCode } from '../i18n/translations';
import { flag } from '../utils/assetUtil';

export type Language = {
  code: AppLanguageCode;
  tmdbCode: 'sk-SK' | 'en-US' | 'de-DE' | 'fr-FR' | 'es-ES';
  label: string;
  flag: string;
};

@Injectable({
  providedIn: 'root',
})
export class LanguageStore {
  private readonly storageKey = 'selectedLanguage';

  readonly languages: readonly Language[] = [
    { code: 'sk', tmdbCode: 'sk-SK', label: 'SK', flag: flag('sk') },
    { code: 'en', tmdbCode: 'en-US', label: 'EN', flag: flag('gb') },
    { code: 'de', tmdbCode: 'de-DE', label: 'DE', flag: flag('de') },
    { code: 'fr', tmdbCode: 'fr-FR', label: 'FR', flag: flag('fr') },
    { code: 'es', tmdbCode: 'es-ES', label: 'ES', flag: flag('es') },
  ];

  private readonly selectedCode = signal<AppLanguageCode>(this.readStoredLanguage());

  readonly selected = computed(
    () => this.languages.find((l) => l.code === this.selectedCode()) ?? this.languages[1],
  );

  readonly selectedLanguageCode = this.selectedCode.asReadonly();
  readonly selectedTmdbLanguage = computed(() => this.selected().tmdbCode);

  setLanguage(code: AppLanguageCode): void {
    this.selectedCode.set(code);
    localStorage.setItem(this.storageKey, code);
  }

  private readStoredLanguage(): AppLanguageCode {
    const value = localStorage.getItem(this.storageKey);
    const validCodes = new Set<AppLanguageCode>(this.languages.map((l) => l.code));

    return value && validCodes.has(value as AppLanguageCode) ? (value as AppLanguageCode) : 'en';
  }
}