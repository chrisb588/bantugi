'use client';

import React from "react";
import ProfileCard from "@/components/user/profile-card";
import AuthGuard from "@/components/auth/auth-guard";

export default function AccountPage() {
  return (
    <AuthGuard>
      <div>
        {/* Content Area (Search Results or Main Content for Mobile) - This will be scrollable if needed */}
          <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
              <ProfileCard />
          </div>
      </div>
    </AuthGuard>
  );
} 