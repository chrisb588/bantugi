"use client";

import Provider from "@/provider/provider";
import { MapProvider } from "@/context/map-context";
import { MobileNavbar } from "@/components/generic/mobile-navbar";
import { CreateReportOverlay } from "@/components/report/create-report-overlay";
import { SavedReportsOverlay } from "@/components/report/saved-reports-overlay";
import { CreatedReportsOverlay } from "@/components/report/created-reports-overlay";
import { useState } from "react";
import { useUserContext } from "@/context/user-context";
import { useRouter } from "next/navigation"; // Remove unused usePathname
// import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-satoshi">
      <Provider>
        <MapProvider>
          <MainLayoutContentInner>
            {children}
          </MainLayoutContentInner>
        </MapProvider>
      </Provider>
    </div>
  );
}

function MainLayoutContentInner({ children }: { children: React.ReactNode }) {
  const [isCreateReportVisible, setIsCreateReportVisible] = useState(false);
  const [isSavedReportsVisible, setIsSavedReportsVisible] = useState(false);
  const [isCreatedReportsVisible, setIsCreatedReportsVisible] = useState(false);
  const { state: { user } } = useUserContext();
  const router = useRouter();
  // Remove unused variable
  // const pathname = usePathname();

  // Only show overlay callbacks on the home page
  // const isHomePage = pathname === '/home'; // Not used in current implementation

  const openCreateReport = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    setIsCreateReportVisible(true);
  };

  const closeCreateReport = () => {
    setIsCreateReportVisible(false);
  };

  const openSavedReports = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    setIsSavedReportsVisible(true);
  };

  const closeSavedReports = () => {
    setIsSavedReportsVisible(false);
  };

  const openMyReports = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    setIsCreatedReportsVisible(true);
  };

  const closeMyReports = () => {
    setIsCreatedReportsVisible(false);
  };

  return (
    <>
      <MobileNavbar 
        onCreateReport={openCreateReport}
        onSavedReports={openSavedReports}
        onMyReports={openMyReports}
      />
      <div className="fixed inset-0">
        {children}
      </div>
      {/* Create Report Overlay */}
      {isCreateReportVisible && <CreateReportOverlay onClose={closeCreateReport} />}
      
      {/* Saved Reports Overlay */}
      {isSavedReportsVisible && <SavedReportsOverlay onClose={closeSavedReports} />}
      
      {/* Created Reports Overlay */}
      {isCreatedReportsVisible && <CreatedReportsOverlay isVisible={true} onClose={closeMyReports} />}
    </>
  );
}
