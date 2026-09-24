// frontend/src/app/layout/main-layout/main-layout.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- frontend/src/app/layout/main-layout/main-layout.component.html -->
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Mobile Backdrop -->
      @if (sidebarOpen()) {
        <div
          (click)="toggleSidebar()"
          class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        ></div>
      }

      <!-- Sidebar -->
      <aside
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()"
        class="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
      >
        <!-- Logo Branding -->
        <div class="h-20 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-xl">
            <span class="material-icons text-2xl">school</span>
          </div>
          <div>
            <span class="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">AlmaConnect</span>
            <p class="text-xs text-indigo-400 font-medium">Alumni Portal</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <a
            routerLink="/directory"
            routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            (click)="closeMobileSidebar()"
            class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition-all group"
          >
            <span class="material-icons text-slate-400 group-hover:text-white transition-colors">people_alt</span>
            <span>Alumni Directory</span>
          </a>

          <a
            routerLink="/events"
            routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            (click)="closeMobileSidebar()"
            class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition-all group"
          >
            <span class="material-icons text-slate-400 group-hover:text-white transition-colors">event</span>
            <span>Events & Reunions</span>
          </a>

          <a
            routerLink="/jobs"
            routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            (click)="closeMobileSidebar()"
            class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition-all group"
          >
            <span class="material-icons text-slate-400 group-hover:text-white transition-colors">work_outline</span>
            <span>Job Opportunities</span>
          </a>

          <a
            routerLink="/donations"
            routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            (click)="closeMobileSidebar()"
            class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition-all group"
          >
            <span class="material-icons text-slate-400 group-hover:text-white transition-colors">volunteer_activism</span>
            <span>Giving & Campaigns</span>
          </a>

          <a
            routerLink="/profile"
            routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            (click)="closeMobileSidebar()"
            class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition-all group"
          >
            <span class="material-icons text-slate-400 group-hover:text-white transition-colors">account_circle</span>
            <span>My Profile</span>
          </a>

          @if (authService.isAdmin()) {
            <div class="pt-5 pb-2 px-3">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Administration</p>
            </div>
            <a
              routerLink="/admin"
              routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 font-medium transition-all group"
            >
              <span class="material-icons text-amber-400">admin_panel_settings</span>
              <span>Admin Dashboard</span>
            </a>
          }
        </nav>

        <!-- Current User Snapshot in Sidebar Bottom -->
        @if (authService.currentUser(); as user) {
          <div class="p-4 border-t border-slate-800 bg-slate-950/40">
            <div class="flex items-center gap-3">
              <img
                [src]="user.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'"
                alt="Profile"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ user.name }}</p>
                <p class="text-xs text-slate-400 truncate">{{ user.jobTitle || user.role }}</p>
              </div>
              <button
                (click)="logout()"
                title="Logout"
                class="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <span class="material-icons text-xl">logout</span>
              </button>
            </div>
          </div>
        }
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navbar -->
        <header class="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div class="flex items-center gap-4">
            <button
              (click)="toggleSidebar()"
              class="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            >
              <span class="material-icons">menu</span>
            </button>
            <div>
              <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">College Alumni Network</h1>
              <p class="text-xs text-slate-500 hidden sm:block">Connecting graduates worldwide</p>
            </div>
          </div>

          <!-- User Header Actions -->
          <div class="flex items-center gap-3">
            @if (authService.currentUser(); as user) {
              <div class="hidden md:flex flex-col text-right">
                <span class="text-sm font-semibold text-slate-800">{{ user.name }}</span>
                <span class="text-xs text-indigo-600 font-medium">Class of {{ user.graduationYear || 'Alumnus' }}</span>
              </div>
              <img
                [src]="user.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'"
                alt="Profile Avatar"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-600"
              />
              <button
                (click)="logout()"
                class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all ml-2"
              >
                <span class="material-icons text-base">power_settings_new</span>
                <span>Sign Out</span>
              </button>
            }
          </div>
        </header>

        <!-- Main Body Routed Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/60">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeMobileSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
