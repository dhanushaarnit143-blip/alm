// frontend/src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AlumniEvent } from '../models/event.model';
import { Job } from '../models/job.model';
import { Donation, DonationStats } from '../models/donation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // --- Users / Alumni Directory ---
  getUsers(filters?: { year?: number | string; company?: string; search?: string }): Observable<{ success: boolean; count: number; users: User[] }> {
    let params = new HttpParams();
    if (filters?.year) params = params.set('year', filters.year.toString());
    if (filters?.company) params = params.set('company', filters.company);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<{ success: boolean; count: number; users: User[] }>(`${this.baseUrl}/users`, { params });
  }

  getUserById(id: string): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, data: Partial<User>): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.put<{ success: boolean; message: string; user: User }>(`${this.baseUrl}/users/${id}`, data);
  }

  // --- Events ---
  getEvents(): Observable<{ success: boolean; count: number; events: AlumniEvent[] }> {
    return this.http.get<{ success: boolean; count: number; events: AlumniEvent[] }>(`${this.baseUrl}/events`);
  }

  getEventById(id: string): Observable<{ success: boolean; event: AlumniEvent }> {
    return this.http.get<{ success: boolean; event: AlumniEvent }>(`${this.baseUrl}/events/${id}`);
  }

  createEvent(eventData: Partial<AlumniEvent>): Observable<{ success: boolean; message: string; event: AlumniEvent }> {
    return this.http.post<{ success: boolean; message: string; event: AlumniEvent }>(`${this.baseUrl}/events`, eventData);
  }

  rsvpEvent(id: string): Observable<{ success: boolean; message: string; isAttending: boolean; event: AlumniEvent }> {
    return this.http.post<{ success: boolean; message: string; isAttending: boolean; event: AlumniEvent }>(`${this.baseUrl}/events/${id}/rsvp`, {});
  }

  deleteEvent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/events/${id}`);
  }

  // --- Jobs ---
  getJobs(filters?: { jobType?: string; search?: string }): Observable<{ success: boolean; count: number; jobs: Job[] }> {
    let params = new HttpParams();
    if (filters?.jobType) params = params.set('jobType', filters.jobType);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<{ success: boolean; count: number; jobs: Job[] }>(`${this.baseUrl}/jobs`, { params });
  }

  getJobById(id: string): Observable<{ success: boolean; job: Job }> {
    return this.http.get<{ success: boolean; job: Job }>(`${this.baseUrl}/jobs/${id}`);
  }

  createJob(jobData: Partial<Job>): Observable<{ success: boolean; message: string; job: Job }> {
    return this.http.post<{ success: boolean; message: string; job: Job }>(`${this.baseUrl}/jobs`, jobData);
  }

  applyJob(id: string): Observable<{ success: boolean; message: string; hasApplied: boolean; job: Job }> {
    return this.http.post<{ success: boolean; message: string; hasApplied: boolean; job: Job }>(`${this.baseUrl}/jobs/${id}/apply`, {});
  }

  deleteJob(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/jobs/${id}`);
  }

  // --- Donations ---
  getDonations(): Observable<{ success: boolean; stats: DonationStats; donations: Donation[] }> {
    return this.http.get<{ success: boolean; stats: DonationStats; donations: Donation[] }>(`${this.baseUrl}/donations`);
  }

  createDonation(data: { amount: number; campaignName: string; message?: string }): Observable<{ success: boolean; message: string; donation: Donation }> {
    return this.http.post<{ success: boolean; message: string; donation: Donation }>(`${this.baseUrl}/donations`, data);
  }

  getDonationStats(): Observable<{ success: boolean; stats: DonationStats }> {
    return this.http.get<{ success: boolean; stats: DonationStats }>(`${this.baseUrl}/donations/stats`);
  }
}
