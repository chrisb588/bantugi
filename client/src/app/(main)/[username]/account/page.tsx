'use client';

import React from "react";
import ProfileCard from "@/components/user/profile-card";

export default function MyReportsPage() {
  return (
    <div>
      {/* Content Area (Search Results or Main Content for Mobile) - This will be scrollable if needed */}
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden pointer-events-auto">
            <ProfileCard />
        </div>
    </div>
  );
} 