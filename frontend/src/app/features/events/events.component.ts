// frontend/src/app/features/events/events.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AlumniEvent } from '../../core/models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  template: `
    <!-- frontend/src/app/features/events/events.component.html -->
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="max-w-2xl">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/30 text-violet-200 mb-3 border border-violet-400/30">
              <span class="material-icons text-sm">celebration</span>
              Campus & Regional Reunions
            </span>
            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">Alumni Events & Networking</h1>
            <p class="text-violet-200/90 text-sm sm:text-base mt-2">
              Join upcoming chapter meetups, homecoming galas, tech talks, and career workshops organized by alumni.
            </p>
          </div>
          <button
            (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-950 font-bold hover:bg-slate-100 transition-all shadow-lg shadow-black/20 self-start md:self-auto shrink-0"
          >
            <span class="material-icons text-xl text-indigo-600">add_circle</span>
            <span>Host New Event</span>
          </button>
        </div>
      </div>

      <!-- Events List Header / Filters -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            (click)="filterType.set('all')"
            [class.bg-indigo-600]="filterType() === 'all'"
            [class.text-white]="filterType() === 'all'"
            [class.bg-white]="filterType() !== 'all'"
            [class.text-slate-600]="filterType() !== 'all'"
            class="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            All Events
          </button>
          <button
            (click)="filterType.set('online')"
            [class.bg-indigo-600]="filterType() === 'online'"
            [class.text-white]="filterType() === 'online'"
            [class.bg-white]="filterType() !== 'online'"
            [class.text-slate-600]="filterType() !== 'online'"
            class="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            Online Webinars
          </button>
          <button
            (click)="filterType.set('offline')"
            [class.bg-indigo-600]="filterType() === 'offline'"
            [class.text-white]="filterType() === 'offline'"
            [class.bg-white]="filterType() !== 'offline'"
            [class.text-slate-600]="filterType() !== 'offline'"
            class="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            In-Person Meetups
          </button>
        </div>
        <span class="text-xs sm:text-sm text-slate-500 font-medium">
          {{ filteredEvents().length }} Events Scheduled
        </span>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-slate-500 font-medium">Loading events...</p>
        </div>
      } @else if (filteredEvents().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <span class="material-icons text-3xl">event_busy</span>
          </div>
          <h2 class="text-lg font-bold text-slate-800">No Events Found</h2>
          <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">There are currently no events matching this filter. Be the first to host one!</p>
          <button
            (click)="showCreateModal.set(true)"
            class="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
          >
            Create Event
          </button>
        </div>
      } @else {
        <!-- Events Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of filteredEvents(); track item._id) {
            <div class="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xl transition-all p-6 flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span
                    [class.bg-emerald-50]="item.type === 'online'"
                    [class.text-emerald-700]="item.type === 'online'"
                    [class.border-emerald-200]="item.type === 'online'"
                    [class.bg-amber-50]="item.type === 'offline'"
                    [class.text-amber-700]="item.type === 'offline'"
                    [class.border-amber-200]="item.type === 'offline'"
                    class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5"
                  >
                    <span class="material-icons text-sm">{{ item.type === 'online' ? 'videocam' : 'location_on' }}</span>
                    <span>{{ item.type }}</span>
                  </span>

                  <span class="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <span class="material-icons text-sm text-slate-400">schedule</span>
                    <span>{{ item.date | date: 'mediumDate' }}</span>
                  </span>
                </div>

                <h2 class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {{ item.title }}
                </h2>

                <p class="text-slate-600 text-sm mt-2 line-clamp-3 leading-relaxed">
                  {{ item.description }}
                </p>

                <!-- Location details -->
                <div class="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                  <span class="material-icons text-base text-indigo-500">pin_drop</span>
                  <span class="truncate font-medium">{{ item.location }}</span>
                </div>

                <!-- Organizer & Attendees -->
                <div class="mt-5 flex items-center justify-between text-xs text-slate-500">
                  <div class="flex items-center gap-2">
                    <img
                      [src]="item.organizer?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'"
                      alt="Organizer"
                      class="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span class="font-medium text-slate-700">Host: {{ item.organizer?.name }}</span>
                  </div>

                  <span class="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {{ item.attendees?.length || 0 }} attending
                  </span>
                </div>
              </div>

              <!-- RSVP Action Button -->
              <div class="mt-6 pt-4 border-t border-slate-100">
                <button
                  (click)="rsvp(item._id)"
                  [class.bg-emerald-600]="isAttending(item)"
                  [class.hover:bg-emerald-700]="isAttending(item)"
                  [class.bg-indigo-600]="!isAttending(item)"
                  [class.hover:bg-indigo-700]="!isAttending(item)"
                  class="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span class="material-icons text-base">{{ isAttending(item) ? 'check_circle' : 'how_to_reg' }}</span>
                  <span>{{ isAttending(item) ? 'You are Attending (Cancel)' : 'RSVP for Event' }}</span>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Host Event Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              (click)="showCreateModal.set(false)"
              class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span class="material-icons">close</span>
            </button>

            <h2 class="text-xl font-bold text-slate-900 mb-1">Host an Alumni Event</h2>
            <p class="text-xs text-slate-500 mb-6">Create a meetup or virtual event for fellow graduates.</p>

            <form [formGroup]="eventForm" (ngSubmit)="onCreateEvent()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Event Title *</label>
                <input
                  type="text"
                  formControlName="title"
                  placeholder="e.g. Annual Bay Area Tech Mixer"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Date & Time *</label>
                  <input
                    type="datetime-local"
                    formControlName="date"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Format *</label>
                  <select
                    formControlName="type"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="offline">In-Person (Offline)</option>
                    <option value="online">Online (Zoom/Meet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Location / Meeting URL *</label>
                <input
                  type="text"
                  formControlName="location"
                  placeholder="Campus Hall A / Google Meet link"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description *</label>
                <textarea
                  rows="3"
                  formControlName="description"
                  placeholder="Describe the agenda, speakers, and instructions for attendees..."
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
                  [disabled]="eventForm.invalid || isSubmitting()"
                  class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
                >
                  @if (isSubmitting()) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  } @else {
                    <span>Publish Event</span>
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
export class EventsComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  events = signal<AlumniEvent[]>([]);
  loading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);
  filterType = signal<'all' | 'online' | 'offline'>('all');

  eventForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    type: ['offline', Validators.required]
  });

  filteredEvents = () => {
    const type = this.filterType();
    if (type === 'all') return this.events();
    return this.events().filter((e) => e.type === type);
  };

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.apiService.getEvents().subscribe({
      next: (res) => {
        this.events.set(res.events || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  isAttending(event: AlumniEvent): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId || !event.attendees) return false;
    return event.attendees.some((a) => (typeof a === 'string' ? a === currentUserId : a._id === currentUserId));
  }

  rsvp(eventId: string): void {
    this.apiService.rsvpEvent(eventId).subscribe({
      next: (res) => {
        // Update event locally
        this.events.update((evList) =>
          evList.map((e) => (e._id === eventId ? res.event : e))
        );
      }
    });
  }

  onCreateEvent(): void {
    if (this.eventForm.invalid) return;

    this.isSubmitting.set(true);
    const formVal = this.eventForm.value;

    this.apiService.createEvent(formVal as Partial<AlumniEvent>).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.showCreateModal.set(false);
        this.eventForm.reset({ type: 'offline' });
        this.events.update((evList) => [res.event, ...evList]);
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
