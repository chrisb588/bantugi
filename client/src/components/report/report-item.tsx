import { Trash2, Bookmark, MapPin, Pencil } from 'lucide-react';

import { cn, formatArea } from '@/lib/utils';
import urgencyIcon from '@/constants/urgency-icon';
import Report from '@/interfaces/report';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';

interface ReportItemProps {
  report: Report;
  isSaved?: boolean;
  deletable?: boolean;
  editable?: boolean;
}

export default function ReportItem({ 
  report, 
  isSaved = false, 
  deletable = false, 
  editable = false 
}: ReportItemProps) {
  const router = useRouter();
  
  // Darker shadow color 
  const shadowColor = 'rgba(160, 150, 130, 0.95)'; // Much darker shadow with higher opacity

  const handleEdit = () => {
    // Handle edit functionality - can be implemented later
    router.push(`/report/${report.id}/edit`);
  };

  const handleDelete = () => {
    // Handle delete functionality - can be implemented later
    console.log("Delete report:", report.id);
  };

  const handleClick = () => {
    router.push(`/report/${report.id}`)
  }

  const handleAction = (e: React.MouseEvent) => {
    const action = (e.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action');
    
    switch (action) {
      case 'edit':
        handleEdit();
        break;
      case 'delete':
        break;
      case 'view':
        handleClick();;
        break;
    }
  };
                     
  return (
    <div className="w-full mb-3 mx-2 py-3 px-4 flex flex-col gap-2 items-start space-x-3 rounded-lg bg-background hover:shadow-md transition-shadow duration-200 ease-in-out" 
         style={{ 
           boxShadow: `0 2px 3px ${shadowColor}`
         }}
         onClick={handleAction}
         data-action="view"
         >
      <div className="flex justify-between w-full">
        <div className="flex gap-2">
          <div className={cn(
            "p-2 rounded-full self-start mt-1"
          )}>
            {urgencyIcon[report.urgency]}
          </div>
          <div className="flex flex-col justify-center align-center gap-1">
            <div className="font-semibold text-sm text-slate-800 tracking-tight">{report.title}</div>
          </div>
        </div>
        {deletable ? (
          <div className="flex items-center gap-1">
            {editable && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-slate-800 hover:text-primary transition-colors duration-150 ease-in-out"
                onClick={handleAction}
                data-action="edit"
              >
                <Pencil size={14} />
              </Button>
            )}
            <DeleteConfirmationDialog
              title="Are you sure you want to delete this report?"
              trigger={
                <button 
                  className="text-primary hover:text-accent transition-colors duration-150 ease-in-out p-1 flex-shrink-0"
                  onClick={handleAction}
                  data-action="delete"
                >
                  <Trash2 size={20} />
                </button>
              }
              onConfirm={handleDelete}
            />
          </div>
        ) : (
          <button className={cn(
            "transition-colors duration-150 ease-in-out p-1 flex-shrink-0",
            isSaved ? "text-primary hover:text-accent" : "text-slate-400 hover:text-primary"
          )}>
            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      <div className="text-xs text-slate-500 flex items-center">
        <MapPin size={14} className="mr-1" />
        {formatArea(report.location.address)}
      </div>
      <div className="text-sm text-slate-600 leading-relaxed line-clamp-1 overflow-hidden">
        {report.description}
      </div>
      <div className="text-xs font-semibold text-slate-700 bg-muted px-3 py-1 rounded-full whitespace-nowrap">
        {report.category}
      </div>
    </div>
  );
};