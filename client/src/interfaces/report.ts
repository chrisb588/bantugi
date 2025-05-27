import { Author } from "@/components/report/report-card";

export interface Report {
  id: number;
  title: string;
  category: string;
  location: string;
  status: "Unresolved" | "In Progress" | "Resolved";
  urgency: "Low" | "Medium" | "High";
  description: string;
  images: string[];
  datePosted: string;
  author: Author;
  comments: Comment[];
}