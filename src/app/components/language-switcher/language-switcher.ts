import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  APP_LANGUAGES,
  AppLanguage,
  getLanguageByCode,
  persistLanguage,
  readStoredLanguage,
} from '../../i18n/language-config';
import { isTabType, TabType } from '../tabs/tabs';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcherComponent {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly currentLangChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  readonly isOpen = signal(false);
  readonly availableLanguages = APP_LANGUAGES;

  readonly selectedLanguage = computed(() => {
    this.currentLangChange();
    return getLanguageByCode(this.translate.currentLang || readStoredLanguage());
  });

  toggleDropdown(): void {
    this.isOpen.update((value) => !value);
  }

  setLanguage(language: AppLanguage, event: Event): void {
    event.stopPropagation();

    const currentTabParam = this.route.snapshot.paramMap.get('tab');
    const currentTab: TabType = isTabType(currentTabParam) ? currentTabParam : 'movies';

    persistLanguage(language.code);
    this.router.navigate(['/', language.code, currentTab]);

    this.isOpen.set(false);
  }
}