// frontend/src/app/features/jobs/jobs.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <!-- frontend/src/app/features/jobs/jobs.component.html -->
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="max-w-2xl">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 mb-3 border border-blue-400/30">
              <span class="material-icons text-sm">work</span>
              Alumni Career Board
            </span>
            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">Job Board & Referrals</h1>
            <p class="text-blue-200/90 text-sm sm:text-base mt-2">
              Explore exclusive career opportunities posted by alumni and hiring managers across tech, finance, and engineering.
            </p>
          </div>
          <button
            (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-950 font-bold hover:bg-slate-100 transition-all shadow-lg shadow-black/20 self-start md:self-auto shrink-0"
          >
            <span class="material-icons text-xl text-indigo-600">post_add</span>
            <span>Post an Opportunity</span>
          </button>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="relative flex-1 w-full">
          <span class="material-icons absolute left-3.5 top-3 text-slate-400 text-xl">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            placeholder="Search roles, companies, or keywords..."
            class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button
            (click)="setJobTypeFilter('')"
            [class.bg-indigo-600]="selectedJobType === ''"
            [class.text-white]="selectedJobType === ''"
            [class.bg-slate-100]="selectedJobType !== ''"
            [class.text-slate-600]="selectedJobType !== ''"
            class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            All Roles
          </button>
          <button
            (click)="setJobTypeFilter('full-time')"
            [class.bg-indigo-600]="selectedJobType === 'full-time'"
            [class.text-white]="selectedJobType === 'full-time'"
            [class.bg-slate-100]="selectedJobType !== 'full-time'"
            [class.text-slate-600]="selectedJobType !== 'full-time'"
            class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            Full-Time
          </button>
          <button
            (click)="setJobTypeFilter('part-time')"
            [class.bg-indigo-600]="selectedJobType === 'part-time'"
            [class.text-white]="selectedJobType === 'part-time'"
            [class.bg-slate-100]="selectedJobType !== 'part-time'"
            [class.text-slate-600]="selectedJobType !== 'part-time'"
            class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            Part-Time
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-slate-500 font-medium">Loading opportunities...</p>
        </div>
      } @else if (jobs().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <span class="material-icons text-3xl">work_off</span>
          </div>
          <h2 class="text-lg font-bold text-slate-800">No Job Openings Found</h2>
          <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">There are currently no listings matching your criteria. Try adjusting your query or post a job.</p>
        </div>
      } @else {
        <!-- Jobs List -->
        <div class="space-y-4">
          @for (job of jobs(); track job._id) {
            <div class="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                  {{ job.company.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <h2 class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {{ job.title }}
                    </h2>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">
                      {{ job.jobType }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {{ job.salaryRange || 'Competitive' }}
                    </span>
                  </div>

                  <p class="text-sm font-medium text-slate-600">
                    {{ job.company }} • <span class="text-slate-500">{{ job.location }}</span>
                  </p>

                  <p class="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed line-clamp-2">
                    {{ job.description }}
                  </p>

                  <div class="mt-3 flex items-center gap-4 text-xs text-slate-400">
                    <span class="flex items-center gap-1">
                      <span class="material-icons text-sm">person</span>
                      Posted by {{ job.postedBy?.name }}
                    </span>
                    <span>•</span>
                    <span>{{ job.applicants?.length || 0 }} applicants</span>
                  </div>
                </div>
              </div>

              <!-- Apply Action -->
              <div class="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-2">
                @if (hasApplied(job)) {
                  <span class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                    <span class="material-icons text-sm">check_circle</span>
                    <span>Application Submitted</span>
                  </span>
                } @else {
                  <button
                    (click)="apply(job._id)"
                    class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <span class="material-icons text-sm">send</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Post Job Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              (click)="showCreateModal.set(false)"
              class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span class="material-icons">close</span>
            </button>

            <h2 class="text-xl font-bold text-slate-900 mb-1">Post a Job Opening</h2>
            <p class="text-xs text-slate-500 mb-6">Share an opportunity with qualified alumni from your alma mater.</p>

            <form [formGroup]="jobForm" (ngSubmit)="onCreateJob()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Title *</label>
                <input
                  type="text"
                  formControlName="title"
                  placeholder="e.g. Lead Frontend Architect"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Company *</label>
                  <input
                    type="text"
                    formControlName="company"
                    placeholder="e.g. Acme Labs"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Location *</label>
                  <input
                    type="text"
                    formControlName="location"
                    placeholder="e.g. Remote / New York"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Employment Type *</label>
                  <select
                    formControlName="jobType"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Salary Range</label>
                  <input
                    type="text"
                    formControlName="salaryRange"
                    placeholder="e.g. $120k - $150k"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description & Qualifications *</label>
                <textarea
                  rows="4"
                  formControlName="description"
                  placeholder="Detail the responsibilities, stack, team culture, and how alumni can apply..."
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                ></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  (click)="showCreateModal.set(false)"
                  class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="jobForm.invalid || isSubmitting()"
                  class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  @if (isSubmitting()) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  } @else {
                    <span>Publish Role</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class JobsComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  jobs = signal<Job[]>([]);
  loading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);

  searchQuery = '';
  selectedJobType = '';

  jobForm = this.fb.group({
    title: ['', Validators.required],
    company: ['', Validators.required],
    location: ['', Validators.required],
    jobType: ['full-time', Validators.required],
    salaryRange: ['Competitive'],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading.set(true);
    this.apiService.getJobs({
      search: this.searchQuery,
      jobType: this.selectedJobType || undefined
    }).subscribe({
      next: (res) => {
        this.jobs.set(res.jobs || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.loadJobs();
  }

  setJobTypeFilter(type: string): void {
    this.selectedJobType = type;
    this.loadJobs();
  }

  hasApplied(job: Job): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId || !job.applicants) return false;
    return job.applicants.some((a) => (typeof a === 'string' ? a === currentUserId : a._id === currentUserId));
  }

  apply(jobId: string): void {
    this.apiService.applyJob(jobId).subscribe({
      next: (res) => {
        this.jobs.update((jList) =>
          jList.map((j) => (j._id === jobId ? res.job : j))
        );
      }
    });
  }

  onCreateJob(): void {
    if (this.jobForm.invalid) return;

    this.isSubmitting.set(true);
    const formVal = this.jobForm.value;

    this.apiService.createJob(formVal as Partial<Job>).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.showCreateModal.set(false);
        this.jobForm.reset({ jobType: 'full-time', salaryRange: 'Competitive' });
        this.jobs.update((jList) => [res.job, ...jList]);
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
