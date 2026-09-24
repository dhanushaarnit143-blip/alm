// frontend/src/app/core/models/event.model.ts
import { User } from './user.model';

export interface AlumniEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'online' | 'offline';
  organizer: User;
  attendees: User[];
  createdAt?: string;
  updatedAt?: string;
}
