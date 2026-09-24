// frontend/src/app/features/profile/profile.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- frontend/src/app/features/profile/profile.component.html -->
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Profile Header Card -->
      <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div class="h-32 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800"></div>

        <div class="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-14 mb-6 gap-4">
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <img
              [src]="user()?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
              alt="Avatar"
              class="w-28 h-28 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
            />
            <div class="sm:mb-2">
              <div class="flex items-center gap-2.5 justify-center sm:justify-start">
                <h1 class="text-2xl font-extrabold text-slate-900">{{ user()?.name }}</h1>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {{ user()?.role }}
                </span>
              </div>
              <p class="text-slate-600 font-medium text-sm mt-0.5">
                {{ user()?.jobTitle || 'Alumni Member' }}
                @if (user()?.currentCompany) {
                  <span class="text-slate-500">at {{ user()?.currentCompany }}</span>
                }
              </p>
              <p class="text-xs text-slate-400 mt-1">Class of {{ user()?.graduationYear || '—' }} • {{ user()?.degree || '—' }}</p>
            </div>
          </div>

          <button
            (click)="toggleEdit()"
            class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <span class="material-icons text-base">{{ isEditing() ? 'close' : 'edit' }}</span>
            <span>{{ isEditing() ? 'Cancel Edit' : 'Edit Profile' }}</span>
          </button>
        </div>

        @if (successMessage()) {
          <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
            <span class="material-icons text-emerald-600 text-xl">check_circle</span>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <!-- VIEW PROFILE MODE -->
        @if (!isEditing()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About Me</h2>
              <p class="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {{ user()?.bio || 'No biography provided yet. Click "Edit Profile" to tell your fellow alumni about your journey!' }}
              </p>
            </div>

            <div class="space-y-4">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Professional & Contact Details</h2>
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Email Address</span>
                  <span class="font-medium text-slate-800">{{ user()?.email }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Location</span>
                  <span class="font-medium text-slate-800">{{ user()?.location || 'Not set' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">LinkedIn Profile</span>
                  @if (user()?.linkedinUrl) {
                    <a [href]="user()?.linkedinUrl" target="_blank" class="text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                      <span>View Profile</span>
                      <span class="material-icons text-sm">open_in_new</span>
                    </a>
                  } @else {
                    <span class="text-slate-400">Not linked</span>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else {
          <!-- EDIT PROFILE FORM -->
          <form [formGroup]="profileForm" (ngSubmit)="onSave()" class="space-y-5 pt-4 border-t border-slate-100">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Profile Picture URL</label>
                <input
                  type="text"
                  formControlName="profilePic"
                  placeholder="https://..."
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Graduation Year</label>
                <input
                  type="number"
                  formControlName="graduationYear"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Degree / Major</label>
                <input
                  type="text"
                  formControlName="degree"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Current Company</label>
                <input
                  type="text"
                  formControlName="currentCompany"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Title</label>
                <input
                  type="text"
                  formControlName="jobTitle"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Location</label>
                <input
                  type="text"
                  formControlName="location"
                  placeholder="City, Country"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">LinkedIn Profile URL</label>
                <input
                  type="text"
                  formControlName="linkedinUrl"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Biography</label>
              <textarea
                rows="4"
                formControlName="bio"
                placeholder="Share your journey, current projects, and mentorship interests..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button
                type="button"
                (click)="toggleEdit()"
                class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="profileForm.invalid || saving()"
                class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
              >
                @if (saving()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                } @else {
                  <span>Save Changes</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  user = this.authService.currentUser;
  isEditing = signal<boolean>(false);
  saving = signal<boolean>(false);
  successMessage = signal<string>('');

  profileForm = this.fb.group({
    name: ['', Validators.required],
    graduationYear: [2022],
    degree: [''],
    currentCompany: [''],
    jobTitle: [''],
    location: [''],
    bio: [''],
    profilePic: [''],
    linkedinUrl: ['']
  });

  ngOnInit(): void {
    const current = this.user();
    if (current) {
      this.populateForm(current);
    }
  }

  populateForm(u: User): void {
    this.profileForm.patchValue({
      name: u.name,
      graduationYear: u.graduationYear || undefined,
      degree: u.degree || '',
      currentCompany: u.currentCompany || '',
      jobTitle: u.jobTitle || '',
      location: u.location || '',
      bio: u.bio || '',
      profilePic: u.profilePic || '',
      linkedinUrl: u.linkedinUrl || ''
    });
  }

  toggleEdit(): void {
    this.isEditing.update((val) => !val);
    this.successMessage.set('');
    if (this.isEditing() && this.user()) {
      this.populateForm(this.user()!);
    }
  }

  onSave(): void {
    if (this.profileForm.invalid || !this.user()) return;

    this.saving.set(true);
    const userId = this.user()!._id;
    const formVal = this.profileForm.value;

    this.apiService.updateUser(userId, formVal as Partial<User>).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.authService.currentUser.set(res.user);
        this.isEditing.set(false);
        this.successMessage.set('Profile successfully updated!');
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
