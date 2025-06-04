import Location from './location';

export default interface User {
  username: string;
  profilePicture?: string;
  location?: Location;
}