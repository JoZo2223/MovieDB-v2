import { Routes } from '@angular/router';
import { SearchPageComponent } from './components/page/page';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: SearchPageComponent },
  { path: 'series', component: SearchPageComponent },
  { path: '**', redirectTo: 'movies' },
];
