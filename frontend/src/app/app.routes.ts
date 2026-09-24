// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'directory'
      },
      {
        path: 'directory',
        loadComponent: () =>
          import('./features/directory/directory.component').then((m) => m.AlumniDirectoryComponent)
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/events.component').then((m) => m.EventsComponent)
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs.component').then((m) => m.JobsComponent)
      },
      {
        path: 'donations',
        loadComponent: () =>
          import('./features/donations/donations.component').then((m) => m.DonationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin.component').then((m) => m.AdminDashboardComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'directory'
  }
];
