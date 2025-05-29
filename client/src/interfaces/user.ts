import Location from './location';

export default interface User {
  username: string;
  profilePicture?: string;
  location?: Location; // Optional, based on previous structure
  emailConfirmedAt?: Date | string | null; // Added for email verification status
}