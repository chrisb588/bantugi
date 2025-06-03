import { MapPin, Bookmark, CopyCheck, Plus, LogIn } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { useAuthContext } from '@/context/auth-context';
import Image from 'next/image';

interface MobileNavbarProps {
  onCreateReport?: () => void;
}

export function MobileNavbar({ onCreateReport }: MobileNavbarProps) {
  const { state: { user } } = useUserContext();
  const { state: authState } = useAuthContext();
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
    if (currentPath === `/${user?.username}/saved-reports`) return; 
    router.push(`/${user?.username}/saved-reports`);
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
    if (currentPath === `/${user?.username}/my-reports`) return;
    router.push(`/${user?.username}/my-reports`);
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-35 w-full max-w-md px-4 md:hidden"> {/* Changed z-50 to z-35 */}
      <div className="relative flex items-center justify-between h-14 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-100 dark:border-gray-800">
        {/* Map/Home button - always available */}
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400"
          onClick={navigateToHome}
        >
          <MapPin className="w-5 h-5" />
        </button>
        
        {/* Saved Reports - shows login hint for guests */}
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-primary"
          onClick={navigateToSaveReports}
          title={!user ? "Login to save reports" : "Saved Reports"}
        >
          <Bookmark className="w-5 h-5" />
        </button>
        
        {/* Create Report - shows login hint for guests */}
        <button
          className="flex-1 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-md hover:bg-accent text-white"
          onClick={navigateToCreateReport}
          title={!user ? "Login to create reports" : "Create Report"}
        >
          <Plus className="w-6 h-6" />
        </button>
        
        {/* My Reports - shows login hint for guests */}
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-primary"
          onClick={navigateToMyReports}
          title={!user ? "Login to view your reports" : "My Reports"}
        >
          <CopyCheck className="w-5 h-5" />
        </button>
        
        {/* Account/Login button */}
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-primary"
          onClick={user ? navigateToAccount : navigateToLogin}
          title={user ? "Account" : "Login"}
        >
          {user ? (
            <div className="h-5 w-5 overflow-hidden rounded-full">
              <Image
                src={user?.profilePicture || '/img/avatar.png'}
                alt="Profile"
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
          ) : (
            <LogIn className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}