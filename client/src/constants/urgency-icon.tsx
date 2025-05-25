import { AlertTriangle, CircleAlert } from "lucide-react";
import React from "react";

export const urgencyIcon: { [key: string]: React.ReactNode } = {
  "Low": <CircleAlert className="text-accent2" />, // FIXED: should now be yellow
  "Medium": <CircleAlert className="text-accent" />,
  "High": <AlertTriangle className="text-primary" />,
};

export default urgencyIcon;