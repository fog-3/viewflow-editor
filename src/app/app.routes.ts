import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page')
    },
    {
        path: 'workspace',
        loadComponent: () => import('./pages/workspace-page/workspace-page')
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
