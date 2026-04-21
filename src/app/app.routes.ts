import { Routes } from '@angular/router';
import { SearchPageComponent } from './components/page/page';
import { DEFAULT_LANGUAGE_CODE } from './i18n/language-config';

export const routes: Routes = [
  { path: '', redirectTo: `${DEFAULT_LANGUAGE_CODE}/movies`, pathMatch: 'full' },
  { path: ':lang/:tab', component: SearchPageComponent },
  { path: '**', redirectTo: `${DEFAULT_LANGUAGE_CODE}/movies` },
];