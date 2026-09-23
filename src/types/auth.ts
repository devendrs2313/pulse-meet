import { FormatType } from './event';

export type UserRole = 
  | 'Product Manager'
  | 'Software Engineer'
  | 'AI / ML Practitioner'
  | 'Engineering Leader'
  | 'Designer / UI-UX'
  | 'Founder / Entrepreneur'
  | 'Student / Learner'
  | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  headline?: string;
  city: string; // e.g. 'delhi-ncr', 'bengaluru'
  formats: FormatType[]; // ['offline'], ['online'], or ['offline', 'online']
  categories: string[];
  emailAlerts: boolean;
  isAdmin: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt?: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  city: string;
  formats: FormatType[];
  categories: string[];
  emailAlerts?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name: string;
  role: UserRole;
  headline?: string;
  city: string;
  formats: FormatType[];
  categories: string[];
  emailAlerts?: boolean;
}
