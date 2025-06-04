import { AlertTriangle, CircleAlert } from "lucide-react";
import React from "react";

export const urgencyIcon: { [key: string]: React.ReactNode } = {
  "Low": <CircleAlert className="text-urgency-low" />,
  "Medium": <CircleAlert className="text-urgency-medium" />,
  "High": <AlertTriangle className="text-urgency-high" />,
};

export default urgencyIcon;