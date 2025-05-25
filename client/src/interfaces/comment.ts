import User from './user';

export default interface Comment {
  id: number;
  creator: User;
  content: string;
  createdAt: Date;
}