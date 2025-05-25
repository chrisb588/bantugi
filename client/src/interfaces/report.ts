import Location from "@/interfaces/location";

export default interface Report {
  id: number;
  title: string;
  description?: string;
  category: string;
  urgency: "Low" | "Medium" | "High";
  status: "Unresolved" | "Being Addressed" | "Resolved";
  images?: string[];
  location: Location;
  createdAt: Date;
}