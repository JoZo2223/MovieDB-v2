import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

const THEME_STORAGE_KEY = 'theme';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = false;

  ngOnInit(): void {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const preferredTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    this.applyTheme(storedTheme ?? preferredTheme);
  }

  toggleTheme(): void {
    this.applyTheme(this.isDarkMode ? 'light' : 'dark');
  }

  private applyTheme(theme: Theme): void {
    this.isDarkMode = theme === 'dark';
    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
