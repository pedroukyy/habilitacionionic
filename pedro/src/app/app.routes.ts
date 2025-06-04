
    import { Routes } from '@angular/router';

    export const routes: Routes = [
      {
        path: '',
        redirectTo: 'project-list',
        pathMatch: 'full',
      },
      {
        path: 'project-list',
        loadComponent: () =>
          import('./pages/project-list/project-list.page').then((m) => m.ProjectListPage),
      },
      {
        path: 'project-form',
        loadComponent: () =>
          import('./pages/project-form/project-form.page').then((m) => m.ProjectFormPage),
      },
      {
        path: 'project-form/:id',
        loadComponent: () =>
          import('./pages/project-form/project-form.page').then((m) => m.ProjectFormPage),
      },
      {
        path: 'project-detail/:id',
        loadComponent: () =>
          import('./pages/project-detail/project-detail.page').then((m) => m.ProjectDetailPage),
      },
     
    ];
