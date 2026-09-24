// frontend/src/app/features/directory/directory.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule],
  template: `
    <!-- frontend/src/app/features/directory/directory.component.html -->
    <div class="space-y-6">
      <!-- Page Title & Header Banner -->
      <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 max-w-2xl">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 mb-3 border border-indigo-400/30">
            <span class="material-icons text-sm">groups</span>
            Official Network
          </span>
          <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">Alumni Directory</h1>
          <p class="text-indigo-200/90 text-sm sm:text-base mt-2">
            Discover and connect with fellow graduates, explore where alumni are working, and find mentors in your industry.
          </p>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <!-- Search Input -->
        <div class="relative flex-1 w-full">
          <span class="material-icons absolute left-3.5 top-3 text-slate-400 text-xl">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            placeholder="Search by name, company, title, degree, or city..."
            class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
          />
        </div>

        <!-- Filters & View Toggle -->
        <div class="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto items-center">
          <!-- Graduation Year Filter -->
          <div class="relative w-full sm:w-44">
            <select
              [(ngModel)]="selectedYear"
              (ngModelChange)="onFilterChange()"
              class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Grad Years</option>
              @for (yr of yearsList; track yr) {
                <option [value]="yr">Class of {{ yr }}</option>
              }
            </select>
            <span class="material-icons absolute right-2.5 top-2.5 text-slate-400 pointer-events-none text-xl">expand_more</span>
          </div>

          <!-- Company Filter -->
          <div class="relative w-full sm:w-44">
            <input
              type="text"
              [(ngModel)]="companyQuery"
              (ngModelChange)="onFilterChange()"
              placeholder="Filter company..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- View Mode Toggle -->
          <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              (click)="viewMode.set('grid')"
              [class.bg-white]="viewMode() === 'grid'"
              [class.shadow-sm]="viewMode() === 'grid'"
              [class.text-indigo-600]="viewMode() === 'grid'"
              [class.text-slate-600]="viewMode() !== 'grid'"
              class="p-1.5 rounded-lg transition-all"
              title="Grid View"
            >
              <span class="material-icons text-xl block">grid_view</span>
            </button>
            <button
              (click)="viewMode.set('table')"
              [class.bg-white]="viewMode() === 'table'"
              [class.shadow-sm]="viewMode() === 'table'"
              [class.text-indigo-600]="viewMode() === 'table'"
              [class.text-slate-600]="viewMode() !== 'table'"
              class="p-1.5 rounded-lg transition-all"
              title="Table View"
            >
              <span class="material-icons text-xl block">view_list</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div class="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
        <span>Showing <strong class="text-slate-800">{{ alumni().length }}</strong> alumni members</span>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-slate-500 font-medium">Loading alumni directory...</p>
        </div>
      } @else if (alumni().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <span class="material-icons text-3xl">person_search</span>
          </div>
          <h2 class="text-lg font-bold text-slate-800">No Alumni Found</h2>
          <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">We couldn't find any alumni matching your search parameters. Try adjusting your filters.</p>
          <button
            (click)="resetFilters()"
            class="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      } @else {
        <!-- GRID VIEW -->
        @if (viewMode() === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (person of alumni(); track person._id) {
              <div class="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
                <div>
                  <div class="flex items-start justify-between gap-4 mb-4">
                    <img
                      [src]="person.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
                      [alt]="person.name"
                      class="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-50 shadow-sm"
                    />
                    @if (person.graduationYear) {
                      <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Class of '{{ person.graduationYear.toString().slice(-2) }}
                      </span>
                    }
                  </div>

                  <h2 class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{{ person.name }}</h2>
                  <p class="text-sm font-medium text-slate-700 mt-0.5">
                    {{ person.jobTitle || 'Alumnus' }}
                    @if (person.currentCompany) {
                      <span class="text-slate-500 font-normal">at {{ person.currentCompany }}</span>
                    }
                  </p>

                  @if (person.degree) {
                    <p class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                      <span class="material-icons text-sm text-slate-400">school</span>
                      <span>{{ person.degree }}</span>
                    </p>
                  }

                  @if (person.location) {
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <span class="material-icons text-sm text-slate-400">location_on</span>
                      <span>{{ person.location }}</span>
                    </p>
                  }

                  @if (person.bio) {
                    <p class="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {{ person.bio }}
                    </p>
                  }
                </div>

                <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    (click)="selectedModalUser.set(person)"
                    class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <span class="material-icons text-sm">chevron_right</span>
                  </button>

                  @if (person.linkedinUrl) {
                    <a
                      [href]="person.linkedinUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="LinkedIn"
                    >
                      <span class="material-icons text-lg">link</span>
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- TABLE VIEW (Angular Material / Tailwind) -->
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 text-slate-700 uppercase text-xs font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="px-6 py-4">Alumnus</th>
                    <th class="px-6 py-4">Current Role</th>
                    <th class="px-6 py-4">Grad Year</th>
                    <th class="px-6 py-4">Degree</th>
                    <th class="px-6 py-4">Location</th>
                    <th class="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (person of alumni(); track person._id) {
                    <tr class="hover:bg-indigo-50/40 transition-colors">
                      <td class="px-6 py-4 flex items-center gap-3">
                        <img
                          [src]="person.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'"
                          [alt]="person.name"
                          class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p class="font-semibold text-slate-900">{{ person.name }}</p>
                          <p class="text-xs text-slate-400">{{ person.email }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <p class="font-medium text-slate-800">{{ person.jobTitle || '—' }}</p>
                        <p class="text-xs text-slate-500">{{ person.currentCompany || '—' }}</p>
                      </td>
                      <td class="px-6 py-4">
                        @if (person.graduationYear) {
                          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                            {{ person.graduationYear }}
                          </span>
                        } @else {
                          <span>—</span>
                        }
                      </td>
                      <td class="px-6 py-4 text-slate-700">{{ person.degree || '—' }}</td>
                      <td class="px-6 py-4 text-slate-700">{{ person.location || '—' }}</td>
                      <td class="px-6 py-4 text-right">
                        <button
                          (click)="selectedModalUser.set(person)"
                          class="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- Alumni Profile Modal Dialog -->
      @if (selectedModalUser(); as modalUser) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              (click)="selectedModalUser.set(null)"
              class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span class="material-icons">close</span>
            </button>

            <div class="flex items-center gap-4 mb-6">
              <img
                [src]="modalUser.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
                [alt]="modalUser.name"
                class="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
              />
              <div>
                <h2 class="text-xl font-bold text-slate-900">{{ modalUser.name }}</h2>
                <p class="text-sm font-medium text-indigo-600">{{ modalUser.jobTitle }} at {{ modalUser.currentCompany }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Class of {{ modalUser.graduationYear }} • {{ modalUser.degree }}</p>
              </div>
            </div>

            <div class="space-y-4 text-sm border-t border-slate-100 pt-5">
              @if (modalUser.bio) {
                <div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Biography</h3>
                  <p class="text-slate-700 leading-relaxed">{{ modalUser.bio }}</p>
                </div>
              }

              <div class="grid grid-cols-2 gap-3 pt-2">
                <div class="bg-slate-50 p-3 rounded-xl">
                  <p class="text-xs text-slate-400 font-medium">Email</p>
                  <p class="text-slate-800 font-semibold truncate">{{ modalUser.email }}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl">
                  <p class="text-xs text-slate-400 font-medium">Location</p>
                  <p class="text-slate-800 font-semibold truncate">{{ modalUser.location || 'Not specified' }}</p>
                </div>
              </div>

              @if (modalUser.linkedinUrl) {
                <div class="pt-3">
                  <a
                    [href]="modalUser.linkedinUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <span>Connect on LinkedIn</span>
                    <span class="material-icons text-sm">open_in_new</span>
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AlumniDirectoryComponent implements OnInit {
  private apiService = inject(ApiService);

  alumni = signal<User[]>([]);
  loading = signal<boolean>(true);
  viewMode = signal<'grid' | 'table'>('grid');
  selectedModalUser = signal<User | null>(null);

  searchQuery = '';
  selectedYear = '';
  companyQuery = '';

  yearsList: number[] = [];

  ngOnInit(): void {
    // Generate graduation years from 1980 to current year
    const currentYear = new Date().getFullYear();
    for (let yr = currentYear; yr >= 1980; yr--) {
      this.yearsList.push(yr);
    }
    this.fetchAlumni();
  }

  fetchAlumni(): void {
    this.loading.set(true);
    this.apiService.getUsers({
      search: this.searchQuery,
      year: this.selectedYear,
      company: this.companyQuery
    }).subscribe({
      next: (res) => {
        this.alumni.set(res.users || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.fetchAlumni();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedYear = '';
    this.companyQuery = '';
    this.fetchAlumni();
  }
}
