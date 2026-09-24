// frontend/src/app/core/models/job.model.ts
import { User } from './user.model';

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  jobType: 'full-time' | 'part-time';
  salaryRange?: string;
  postedBy: User;
  applicants: User[];
  createdAt?: string;
  updatedAt?: string;
}
