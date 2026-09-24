// frontend/src/app/core/models/donation.model.ts
import { User } from './user.model';

export interface Donation {
  _id: string;
  amount: number;
  campaignName: string;
  message?: string;
  donor: User;
  createdAt: string;
}

export interface CampaignSummary {
  campaignName: string;
  totalRaised: number;
  donorCount: number;
}

export interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  avgDonation: number;
  campaigns: CampaignSummary[];
}
