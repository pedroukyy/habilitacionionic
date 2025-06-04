   // src/app/app.routes.ts
    import { Routes } from '@angular/router';

    export const routes: Routes = [
      {
        path: '',
        redirectTo: 'project-list', // La página inicial será la lista de proyectos
        pathMatch: 'full',
      },
      {
        path: 'project-list',
        loadComponent: () =>
          import('./pages/project-list/project-list.page').then((m) => m.ProjectListPage),
      },
      {
        path: 'project-form', // Ruta para crear un nuevo proyecto
        loadComponent: () =>
          import('./pages/project-form/project-form.page').then((m) => m.ProjectFormPage),
      },
      {
        path: 'project-form/:id', // Ruta para editar un proyecto existente (pasando el ID del proyecto)
        loadComponent: () =>
          import('./pages/project-form/project-form.page').then((m) => m.ProjectFormPage),
      },
      {
        path: 'project-detail/:id', // Ruta para ver los detalles de un proyecto (pasando el ID)
        loadComponent: () =>
          import('./pages/project-detail/project-detail.page').then((m) => m.ProjectDetailPage),
      },
      // Si tienes una página 'home' generada por defecto y no la usas, puedes eliminar su ruta o redirigirla.
      // Ejemplo:
      // {
      //   path: 'home',
      //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      // },
    ];
    