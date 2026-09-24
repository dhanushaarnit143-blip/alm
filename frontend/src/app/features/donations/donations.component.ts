// frontend/src/app/features/donations/donations.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Donation, DonationStats } from '../../core/models/donation.model';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <!-- frontend/src/app/features/donations/donations.component.html -->
    <div class="space-y-8">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 max-w-2xl">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 mb-3 border border-emerald-400/30">
            <span class="material-icons text-sm">favorite</span>
            Alumni Giving & Endowment
          </span>
          <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">Support Future Generations</h1>
          <p class="text-emerald-200/90 text-sm sm:text-base mt-2">
            Your generous contributions directly fund student scholarships, research initiatives, and campus advancements.
          </p>
        </div>
      </div>

      <!-- Quick Stats Metrics -->
      @if (stats(); as s) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span class="material-icons text-2xl">paid</span>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400">Total Funds Raised</p>
              <h2 class="text-2xl font-extrabold text-slate-900">{{ s.totalAmount | currency: 'USD' : 'symbol' : '1.0-0' }}</h2>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <span class="material-icons text-2xl">volunteer_activism</span>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400">Total Contributions</p>
              <h2 class="text-2xl font-extrabold text-slate-900">{{ s.totalDonations }}</h2>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <span class="material-icons text-2xl">insights</span>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400">Average Gift</p>
              <h2 class="text-2xl font-extrabold text-slate-900">{{ s.avgDonation | currency: 'USD' : 'symbol' : '1.0-0' }}</h2>
            </div>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Donation Form (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-icons text-indigo-600 text-2xl">card_giftcard</span>
            <h2 class="text-xl font-bold text-slate-900">Make a Contribution</h2>
          </div>

          @if (successMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
              <span class="material-icons text-emerald-600 text-xl">check_circle</span>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <form [formGroup]="donateForm" (ngSubmit)="onDonate()" class="space-y-5">
            <!-- Preset Amount Buttons -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Select Donation Amount</label>
              <div class="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-3">
                @for (amt of presetAmounts; track amt) {
                  <button
                    type="button"
                    (click)="selectAmount(amt)"
                    [class.bg-indigo-600]="donateForm.get('amount')?.value === amt"
                    [class.text-white]="donateForm.get('amount')?.value === amt"
                    [class.border-indigo-600]="donateForm.get('amount')?.value === amt"
                    [class.bg-slate-50]="donateForm.get('amount')?.value !== amt"
                    [class.text-slate-700]="donateForm.get('amount')?.value !== amt"
                    class="py-3 px-2 rounded-xl text-sm font-bold border border-slate-200 hover:border-indigo-400 transition-all text-center"
                  >
                    \${{ amt }}
                  </button>
                }
              </div>

              <!-- Custom Amount Input -->
              <div class="relative">
                <span class="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="Or enter custom amount..."
                  class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <!-- Campaign Selector -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Designated Campaign *</label>
              <select
                formControlName="campaignName"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Alumni Endowed Scholarship Fund">Alumni Endowed Scholarship Fund</option>
                <option value="Student Emergency Hardship Relief">Student Emergency Hardship Relief</option>
                <option value="Campus AI & Innovation Labs">Campus AI & Innovation Labs</option>
                <option value="Athletics & Sports Complex Upgrade">Athletics & Sports Complex Upgrade</option>
                <option value="Annual General Educational Fund">Annual General Educational Fund</option>
              </select>
            </div>

            <!-- Message / Dedication -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Personal Note or Dedication (Optional)</label>
              <textarea
                rows="3"
                formControlName="message"
                placeholder="In honor of Class of 2022, or a personal message to current students..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              [disabled]="donateForm.invalid || isSubmitting()"
              class="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              @if (isSubmitting()) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Contribution...</span>
              } @else {
                <span class="material-icons text-xl">favorite</span>
                <span>Complete Contribution (\${{ donateForm.get('amount')?.value || 0 }})</span>
              }
            </button>
          </form>
        </div>

        <!-- Recent Donors & Impact Feed (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span class="material-icons text-emerald-600">history_edu</span>
              <span>Recent Contributors</span>
            </h2>

            @if (donations().length === 0) {
              <p class="text-xs text-slate-400 py-6 text-center">Be the first alumni to make a donation today!</p>
            } @else {
              <div class="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                @for (d of donations(); track d._id) {
                  <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <img
                      [src]="d.donor?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'"
                      alt="Donor"
                      class="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-xs font-bold text-slate-900 truncate">{{ d.donor?.name || 'Anonymous Alumnus' }}</p>
                        <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                          \${{ d.amount }}
                        </span>
                      </div>
                      <p class="text-xs text-indigo-600 font-medium truncate mt-0.5">{{ d.campaignName }}</p>
                      @if (d.message) {
                        <p class="text-xs text-slate-600 mt-1 italic">"{{ d.message }}"</p>
                      }
                      <p class="text-[10px] text-slate-400 mt-1">{{ d.createdAt | date: 'mediumDate' }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DonationsComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  stats = signal<DonationStats | null>(null);
  donations = signal<Donation[]>([]);
  isSubmitting = signal<boolean>(false);
  successMessage = signal<string>('');

  presetAmounts = [25, 50, 100, 250, 500];

  donateForm = this.fb.group({
    amount: [100, [Validators.required, Validators.min(1)]],
    campaignName: ['Alumni Endowed Scholarship Fund', Validators.required],
    message: ['']
  });

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.apiService.getDonations().subscribe({
      next: (res) => {
        this.stats.set(res.stats);
        this.donations.set(res.donations || []);
      }
    });
  }

  selectAmount(amt: number): void {
    this.donateForm.patchValue({ amount: amt });
  }

  onDonate(): void {
    if (this.donateForm.invalid) return;

    this.isSubmitting.set(true);
    this.successMessage.set('');
    const { amount, campaignName, message } = this.donateForm.value;

    this.apiService.createDonation({
      amount: Number(amount),
      campaignName: campaignName!,
      message: message || undefined
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Thank you! Your donation was recorded successfully.');
        this.donateForm.patchValue({ amount: 100, message: '' });
        this.loadDonations();
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
