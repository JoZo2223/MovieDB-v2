import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  APP_LANGUAGES,
  AppLanguage,
  AppLanguageCode,
  DEFAULT_LANGUAGE_CODE,
  getLanguageByCode,
  persistLanguage,
  readStoredLanguage,
} from '../app/i18n/language-config'

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly selectedCode = signal<AppLanguageCode>(readStoredLanguage());

  readonly languages = APP_LANGUAGES;
  readonly currentLanguageCode = this.selectedCode.asReadonly();
  readonly currentLanguage = computed<AppLanguage>(() => getLanguageByCode(this.selectedCode()));
  readonly currentTmdbLanguage = computed(() => this.currentLanguage().tmdbCode);

  constructor() {
    this.translate.use(this.selectedCode());
  }

  setLanguage(code: AppLanguageCode): void {
    const normalized = getLanguageByCode(code).code;

    if (this.selectedCode() === normalized) {
      return;
    }

    this.selectedCode.set(normalized);
    persistLanguage(normalized);
    this.translate.use(normalized);
  }

  syncFromRoute(code: string | null | undefined): AppLanguageCode {
    const normalized = getLanguageByCode(code).code;
    this.setLanguage(normalized);
    return normalized;
  }

  getCurrentTranslateLanguage(): string {
    return this.translate.getCurrentLang() || DEFAULT_LANGUAGE_CODE;
  }
}