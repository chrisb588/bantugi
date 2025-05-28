
import Location from "./location";
import Comment from "./comment";
import User from "./user";

export interface Report {
  id: String;
  title: string;
  category: string;
  location: Location;
  status: "Unresolved" | "In Progress" | "Resolved";
  urgency: "Low" | "Medium" | "High";
  description: string;
  images: string[];
  datePosted: string;
  author: User;
  comments: Comment[];
}