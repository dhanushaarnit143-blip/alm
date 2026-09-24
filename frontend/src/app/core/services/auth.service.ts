// frontend/src/app/core/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'alm_auth_token';

  // Signals for reactive state management
  readonly currentUser = signal<User | null>(null);
  readonly token = signal<string | null>(this.getStoredToken());
  readonly isLoading = signal<boolean>(false);

  // Computed signals
  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    // Rehydrate session if token exists
    if (this.token()) {
      this.loadCurrentUser().subscribe();
    }
  }

  getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getToken(): string | null {
    return this.token();
  }

  register(userData: Partial<User> & { password: string }): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  loadCurrentUser(): Observable<{ success: boolean; user: User } | null> {
    this.isLoading.set(true);
    return this.http.get<{ success: boolean; user: User }>(`${environment.apiUrl}/auth/me`).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.user) {
          this.currentUser.set(res.user);
        }
      }),
      catchError(() => {
        this.isLoading.set(false);
        this.logout();
        return of(null);
      })
    );
  }

  updateProfile(userId: string, data: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${environment.apiUrl}/users/${userId}`, data).pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.currentUser.set(res.user);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(token: string, user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.token.set(token);
    this.currentUser.set(user);
  }
}
