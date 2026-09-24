// frontend/src/app/core/models/user.model.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'alumni';
  graduationYear?: number;
  degree?: string;
  currentCompany?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  profilePic?: string;
  linkedinUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}
