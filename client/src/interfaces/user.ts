import Location from './location';

export default interface User {
  id?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  address?: string; // New field from schema
  location?: Location; // Optional, based on previous structure
  emailConfirmedAt?: Date | string | null; // Added for email verification status
}