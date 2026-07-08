import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AppLanguage } from '../../i18n/language-config';
import { isTabType, TabType } from '../tabs/tabs';
import { LanguageService } from '../../../service/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcherComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);

  readonly isOpen = signal(false);
  readonly availableLanguages = this.languageService.languages;
  readonly selectedLanguage = computed(() => this.languageService.currentLanguage());

  toggleDropdown(): void {
    this.isOpen.update((value) => !value);
  }

  setLanguage(language: AppLanguage, event: Event): void {
    event.stopPropagation();

    const currentTabParam = this.route.snapshot.paramMap.get('tab');
    const currentTab: TabType = isTabType(currentTabParam) ? currentTabParam : 'movies';

    this.languageService.setLanguage(language.code);
    this.router.navigate(['/', language.code, currentTab]);
    this.isOpen.set(false);
  }
}
