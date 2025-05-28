import User from './user';

export default interface Comment {
  id: string;
  creator: User;
  content: string;
  createdAt: Date;
}