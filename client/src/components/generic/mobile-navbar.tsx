import { MapPin, Bookmark, CopyCheck, Plus, LogIn } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { useAuthContext } from '@/context/auth-context';
import { useUserReports } from '@/hooks/useUserReports';
import Image from 'next/image';

interface NavigationBarProps {
  onCreateReport?: () => void;
  onSavedReports?: () => void;
  onMyReports?: () => void;
}

export function MobileNavbar({ onCreateReport, onSavedReports, onMyReports }: NavigationBarProps) {
  // Keep the same function name for backwards compatibility, but this now works on all screen sizes
  const { state: { user } } = useUserContext();
  const { state: authState } = useAuthContext();
  const { reportCount, isLoading } = useUserReports();
  const router = useRouter();
  const currentPath = usePathname();

  // Don't render until auth check is complete
  if (!authState.initialAuthCheckComplete) {
    return null;
  }

  const navigateToHome = () => {
    if (currentPath === '/home') return;
    router.push('/home');
  }

  const navigateToSaveReports = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    
    // Always use the overlay system via callback
    if (onSavedReports) {
      onSavedReports();
    }
  }

  const navigateToCreateReport = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    
    // If onCreateReport is provided (from home page), use it instead of navigation
    if (onCreateReport) {
      onCreateReport();
      return;
    }
    
    // Otherwise, navigate to create-report page (for other pages)
    if (currentPath === '/create-report') return;
    router.push('/create-report');
  }

  const navigateToMyReports = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    
    // Always use the overlay system via callback
    if (onMyReports) {
      onMyReports();
    }
  }

  const navigateToAccount = () => {
    if (!user) {
      // Redirect to login for guest users
      router.push('/login');
      return;
    }
    if (currentPath === `/${user?.username}/account`) return;
    router.push(`/${user?.username}/account`);
  }

  const navigateToLogin = () => {
    router.push('/login');
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-35 w-full max-w-md md:max-w-lg px-4"> {/* Increased max-width for desktop */}
      <div className="relative flex items-center justify-between h-14 md:h-16 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-100 dark:border-gray-800"> {/* Slightly taller on desktop */}
        {/* Map/Home button - always available */}
        <button
          className="flex-1 flex justify-center p-2 md:p-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          onClick={navigateToHome}
          title="Home"
        >
          <MapPin className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        {/* Saved Reports - shows login hint for guests */}
        <button
          className="flex-1 flex justify-center p-2 md:p-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          onClick={navigateToSaveReports}
          title={!user ? "Login to save reports" : "Saved Reports"}
        >
          <Bookmark className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        {/* Create Report - shows login hint for guests */}
        <button
          className="flex-1 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary shadow-md hover:bg-accent text-white transition-colors"
          onClick={navigateToCreateReport}
          title={!user ? "Login to create reports" : "Create Report"}
        >
          <Plus className="w-6 h-6 md:w-7 md:h-7" />
        </button>
        
        {/* My Reports - shows login hint for guests */}
        <button
          className="flex-1 flex justify-center p-2 md:p-3 text-gray-500 dark:text-gray-400 hover:text-primary relative transition-colors"
          onClick={navigateToMyReports}
          title={!user ? "Login to view your reports" : "My Reports"}
        >
          <CopyCheck className="w-5 h-5 md:w-6 md:h-6" />
          {user && reportCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center min-w-[20px] md:min-w-[24px] font-medium">
              {reportCount > 99 ? '99+' : reportCount}
            </span>
          )}
        </button>
        
        {/* Account/Login button */}
        <button
          className="flex-1 flex justify-center p-2 md:p-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          onClick={user ? navigateToAccount : navigateToLogin}
          title={user ? "Account" : "Login"}
        >
          {user ? (
            <div className="h-5 w-5 md:h-7 md:w-7 overflow-hidden rounded-full">
              <Image
                src={user?.profilePicture || '/img/avatar.png'}
                alt="Profile"
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
          ) : (
            <LogIn className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      </div>
    </div>
  );
}