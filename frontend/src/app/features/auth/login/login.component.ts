// frontend/src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- frontend/src/app/features/auth/login/login.component.html -->
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 relative overflow-hidden">
      <!-- Glow ambient background -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-md relative z-10">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 items-center justify-center shadow-xl shadow-indigo-500/30 text-white mb-4">
            <span class="material-icons text-3xl">school</span>
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">AlmaConnect</h1>
          <p class="text-indigo-200/80 text-sm mt-1">Sign in to your college alumni account</p>
        </div>

        <!-- Glass Login Card -->
        <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">
          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3">
              <span class="material-icons text-rose-400 text-xl">error_outline</span>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Email Address</label>
              <div class="relative">
                <span class="material-icons absolute left-3.5 top-3.5 text-indigo-300 text-xl">email</span>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="alumnus@college.edu"
                  class="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                <p class="text-xs text-rose-300 mt-1.5">Valid email is required</p>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Password</label>
              <div class="relative">
                <span class="material-icons absolute left-3.5 top-3.5 text-indigo-300 text-xl">lock</span>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                <p class="text-xs text-rose-300 mt-1.5">Password must be at least 6 characters</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid || loading()"
              class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              } @else {
                <span>Sign In</span>
                <span class="material-icons text-lg">arrow_forward</span>
              }
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-white/10 text-center">
            <p class="text-sm text-slate-300">
              Not registered yet?
              <a routerLink="/register" class="text-indigo-300 hover:text-white font-semibold underline underline-offset-4 ml-1">
                Create alumni profile
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/directory';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please verify your credentials.');
      }
    });
  }
}
