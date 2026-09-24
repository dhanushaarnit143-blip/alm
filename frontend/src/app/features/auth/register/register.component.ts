// frontend/src/app/features/auth/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- frontend/src/app/features/auth/register/register.component.html -->
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-8 relative overflow-hidden">
      <!-- Glow ambient background -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-2xl relative z-10 my-8">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 items-center justify-center shadow-xl shadow-indigo-500/30 text-white mb-4">
            <span class="material-icons text-3xl">school</span>
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Join Alumni Community</h1>
          <p class="text-indigo-200/80 text-sm mt-1">Connect with alumni, attend reunions, and grow your career network</p>
        </div>

        <!-- Glass Register Card -->
        <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/40">
          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3">
              <span class="material-icons text-rose-400 text-xl">error_outline</span>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Full Name -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Full Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Jane Doe"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Email Address *</label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="jane.doe@example.com"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Password *</label>
              <input
                type="password"
                formControlName="password"
                placeholder="At least 6 characters"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Graduation Year -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Graduation Year</label>
                <input
                  type="number"
                  formControlName="graduationYear"
                  placeholder="e.g. 2022"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <!-- Degree -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Degree / Major</label>
                <input
                  type="text"
                  formControlName="degree"
                  placeholder="e.g. B.S. Computer Science"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Current Company -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Current Company</label>
                <input
                  type="text"
                  formControlName="currentCompany"
                  placeholder="e.g. Google / Microsoft / Startup"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <!-- Job Title -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Job Title</label>
                <input
                  type="text"
                  formControlName="jobTitle"
                  placeholder="e.g. Senior Software Engineer"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Location</label>
              <input
                type="text"
                formControlName="location"
                placeholder="e.g. San Francisco, CA / London / Remote"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid || loading()"
              class="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
            >
              @if (loading()) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              } @else {
                <span>Register Alumni Profile</span>
                <span class="material-icons text-lg">check_circle</span>
              }
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-white/10 text-center">
            <p class="text-sm text-slate-300">
              Already have an account?
              <a routerLink="/login" class="text-indigo-300 hover:text-white font-semibold underline underline-offset-4 ml-1">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    graduationYear: [new Date().getFullYear(), [Validators.min(1950), Validators.max(2100)]],
    degree: [''],
    currentCompany: [''],
    jobTitle: [''],
    location: ['']
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const formVal = this.registerForm.value;

    this.authService.register({
      name: formVal.name!,
      email: formVal.email!,
      password: formVal.password!,
      graduationYear: formVal.graduationYear ? Number(formVal.graduationYear) : undefined,
      degree: formVal.degree || '',
      currentCompany: formVal.currentCompany || '',
      jobTitle: formVal.jobTitle || '',
      location: formVal.location || ''
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/directory']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please check your information.');
      }
    });
  }
}
