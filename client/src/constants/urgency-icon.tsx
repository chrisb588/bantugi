import { AlertTriangle, CircleAlert } from "lucide-react";

import ReportUrgency from "@/enums/report/urgency"

export const urgencyIcon = {
  [ReportUrgency.Low]: <CircleAlert className="text-yellow" />,
  [ReportUrgency.Medium]: <CircleAlert className="text-accent" />,
  [ReportUrgency.High]: <AlertTriangle className="text-primary" />,
};

export default urgencyIcon;