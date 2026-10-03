export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  role?: string;
  isAnonymous?: boolean;
  firstName?: string;
  lastName?: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  banned?: boolean | null;
  banReason?: string | null;
}
