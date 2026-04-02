import { Routes } from '@angular/router';
import { SearchPageComponent } from '../page/page';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: SearchPageComponent },
  { path: 'series', component: SearchPageComponent },
  { path: '**', redirectTo: 'movies' }
];