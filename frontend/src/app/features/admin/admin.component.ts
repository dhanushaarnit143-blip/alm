// frontend/src/app/features/admin/admin.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/user.model';
import { AlumniEvent } from '../../core/models/event.model';
import { Job } from '../../core/models/job.model';
import { Donation } from '../../core/models/donation.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <!-- frontend/src/app/features/admin/admin.component.html -->
    <div class="space-y-8">
      <!-- Admin Header -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 mb-3 border border-amber-500/30">
              <span class="material-icons text-sm">shield</span>
              System Administrator Portal
            </span>
            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">Alumni Administration Overview</h1>
            <p class="text-slate-300 text-sm sm:text-base mt-2">
              System-wide metrics, alumni database control, event attendance records, and endowment auditing.
            </p>
          </div>
        </div>
      </div>

      <!-- KPI Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Alumni -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span class="material-icons text-2xl">people</span>
            </span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Registered Alumni</p>
          <h2 class="text-3xl font-black text-slate-900 mt-1">{{ users().length }}</h2>
        </div>

        <!-- Total Events -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <span class="material-icons text-2xl">event</span>
            </span>
            <span class="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Reunions</span>
          </div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Organized Events</p>
          <h2 class="text-3xl font-black text-slate-900 mt-1">{{ events().length }}</h2>
        </div>

        <!-- Active Jobs -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span class="material-icons text-2xl">work</span>
            </span>
            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Careers</span>
          </div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Job Postings</p>
          <h2 class="text-3xl font-black text-slate-900 mt-1">{{ jobs().length }}</h2>
        </div>

        <!-- Total Donations -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span class="material-icons text-2xl">savings</span>
            </span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Endowment</span>
          </div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Funds Raised</p>
          <h2 class="text-3xl font-black text-slate-900 mt-1">{{ totalDonated() | currency: 'USD' : 'symbol' : '1.0-0' }}</h2>
        </div>
      </div>

      <!-- Management Tabs -->
      <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
          <button
            (click)="activeTab.set('users')"
            [class.border-indigo-600]="activeTab() === 'users'"
            [class.text-indigo-600]="activeTab() === 'users'"
            [class.border-transparent]="activeTab() !== 'users'"
            [class.text-slate-500]="activeTab() !== 'users'"
            class="pb-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all"
          >
            <span class="material-icons text-lg">manage_accounts</span>
            <span>Alumni Records ({{ users().length }})</span>
          </button>

          <button
            (click)="activeTab.set('events')"
            [class.border-indigo-600]="activeTab() === 'events'"
            [class.text-indigo-600]="activeTab() === 'events'"
            [class.border-transparent]="activeTab() !== 'events'"
            [class.text-slate-500]="activeTab() !== 'events'"
            class="pb-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all"
          >
            <span class="material-icons text-lg">event_available</span>
            <span>All Events ({{ events().length }})</span>
          </button>

          <button
            (click)="activeTab.set('jobs')"
            [class.border-indigo-600]="activeTab() === 'jobs'"
            [class.text-indigo-600]="activeTab() === 'jobs'"
            [class.border-transparent]="activeTab() !== 'jobs'"
            [class.text-slate-500]="activeTab() !== 'jobs'"
            class="pb-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all"
          >
            <span class="material-icons text-lg">business_center</span>
            <span>Job Opportunities ({{ jobs().length }})</span>
          </button>
        </div>

        <div class="p-6">
          <!-- USERS TAB -->
          @if (activeTab() === 'users') {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-600">
                <thead class="text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th class="py-3 px-4">Name & Email</th>
                    <th class="py-3 px-4">Role</th>
                    <th class="py-3 px-4">Grad Year</th>
                    <th class="py-3 px-4">Company</th>
                    <th class="py-3 px-4">Degree</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (u of users(); track u._id) {
                    <tr class="hover:bg-slate-50">
                      <td class="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-3">
                        <img
                          [src]="u.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'"
                          alt=""
                          class="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div>{{ u.name }}</div>
                          <div class="text-xs text-slate-400 font-normal">{{ u.email }}</div>
                        </div>
                      </td>
                      <td class="py-3.5 px-4">
                        <span
                          [class.bg-amber-50]="u.role === 'admin'"
                          [class.text-amber-700]="u.role === 'admin'"
                          [class.border-amber-200]="u.role === 'admin'"
                          [class.bg-slate-50]="u.role !== 'admin'"
                          [class.text-slate-600]="u.role !== 'admin'"
                          class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border"
                        >
                          {{ u.role }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 font-medium">{{ u.graduationYear || '—' }}</td>
                      <td class="py-3.5 px-4 font-medium">{{ u.currentCompany || '—' }}</td>
                      <td class="py-3.5 px-4 text-slate-500">{{ u.degree || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- EVENTS TAB -->
          @if (activeTab() === 'events') {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-600">
                <thead class="text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th class="py-3 px-4">Event Title</th>
                    <th class="py-3 px-4">Date</th>
                    <th class="py-3 px-4">Type</th>
                    <th class="py-3 px-4">Organizer</th>
                    <th class="py-3 px-4">Attendees</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (ev of events(); track ev._id) {
                    <tr class="hover:bg-slate-50">
                      <td class="py-3.5 px-4 font-bold text-slate-900">{{ ev.title }}</td>
                      <td class="py-3.5 px-4 text-xs">{{ ev.date | date: 'medium' }}</td>
                      <td class="py-3.5 px-4 capitalize">{{ ev.type }}</td>
                      <td class="py-3.5 px-4">{{ ev.organizer?.name }}</td>
                      <td class="py-3.5 px-4 font-semibold text-indigo-600">{{ ev.attendees?.length || 0 }} registered</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- JOBS TAB -->
          @if (activeTab() === 'jobs') {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-600">
                <thead class="text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th class="py-3 px-4">Role & Company</th>
                    <th class="py-3 px-4">Type</th>
                    <th class="py-3 px-4">Location</th>
                    <th class="py-3 px-4">Posted By</th>
                    <th class="py-3 px-4">Applicants</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (j of jobs(); track j._id) {
                    <tr class="hover:bg-slate-50">
                      <td class="py-3.5 px-4">
                        <p class="font-bold text-slate-900">{{ j.title }}</p>
                        <p class="text-xs text-slate-400">{{ j.company }}</p>
                      </td>
                      <td class="py-3.5 px-4 capitalize">{{ j.jobType }}</td>
                      <td class="py-3.5 px-4">{{ j.location }}</td>
                      <td class="py-3.5 px-4">{{ j.postedBy?.name }}</td>
                      <td class="py-3.5 px-4 font-semibold text-indigo-600">{{ j.applicants?.length || 0 }} applicants</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  users = signal<User[]>([]);
  events = signal<AlumniEvent[]>([]);
  jobs = signal<Job[]>([]);
  totalDonated = signal<number>(0);
  activeTab = signal<'users' | 'events' | 'jobs'>('users');

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.apiService.getUsers().subscribe({
      next: (res) => this.users.set(res.users || [])
    });

    this.apiService.getEvents().subscribe({
      next: (res) => this.events.set(res.events || [])
    });

    this.apiService.getJobs().subscribe({
      next: (res) => this.jobs.set(res.jobs || [])
    });

    this.apiService.getDonations().subscribe({
      next: (res) => this.totalDonated.set(res.stats?.totalAmount || 0)
    });
  }
}
