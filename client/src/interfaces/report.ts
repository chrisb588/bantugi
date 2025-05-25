import ReportUrgency from "@/enums/report/urgency";
import ReportStatus from "@/enums/report/status";
import Location from "@/interfaces/location";

export default interface Report {
  id: number;
  title: string;
  description?: string;
  category: string;
  urgency: ReportUrgency;
  status: ReportStatus;
  images?: string[];
  location: Location;
}