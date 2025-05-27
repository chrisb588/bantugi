import Location from "@/interfaces/location";
import Comment from "@/interfaces/comment";
import User from "@/interfaces/user";

export default interface Report {
  id: number;
  title: string;
  description?: string;
  category: string;
  urgency: "Low" | "Medium" | "High";
  status: "Unresolved" | "Being Addressed" | "Resolved";
  images?: string[];
  location?: Location;
  createdAt: Date;
  creator: User;
  comments?: Comment[];
}