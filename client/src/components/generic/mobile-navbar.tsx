import { MapPin, Bookmark, CopyCheck, Plus } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function MobileNavbar() {
  const router = useRouter();
  const currentPath = usePathname();

  const navigateToHome = () => {
    if (currentPath === '/home') return;
    router.push('/home');
  }

  const navigateToSaveReports = () => {
    if (currentPath === '/saved') return; 
    router.push('/saved');
  }

  const navigateToCreateReport = () => {
    if (currentPath === '/create-report') return;
    router.push('/create-report');
  }

  const navigateToMyReports = () => {
    if (currentPath === '/my-reports') return;
    router.push('/my-reports');
  }

  const navigateToAccount = () => {
    if (currentPath === '/account') return;
    router.push('/account');
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 md:hidden">
      <div className="relative flex items-center justify- h-14 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-100 dark:border-gray-800">
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400"
          onClick={navigateToHome}
        >
          <MapPin className="w-5 h-5" />
        </button>
        
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-primary"
          onClick={navigateToSaveReports}
        >
          <Bookmark className="w-5 h-5" />
        </button>
        
        <button
          className="flex-1 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-md hover:bg-accent text-white"
          onClick={navigateToCreateReport}
        >
          <Plus className="w-6 h-6" />
        </button>
        
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-primary"
          onClick={navigateToMyReports}
        >
          <CopyCheck className="w-5 h-5" />
        </button>
        
        <button
          className="flex-1 flex justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-primary"
          onClick={navigateToAccount}
        >
          <div className="h-5 w-5 overflow-hidden rounded-full bg-primary"></div>
        </button>
      </div>
    </div>
  );
}