'use client';

import React from "react";
import ProfileCard from "@/components/user/profile-card";

export default function MyReportsPage() {
  return (
    <div>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
            <ProfileCard edit={true} />
        </div>
    </div>
  );
} 