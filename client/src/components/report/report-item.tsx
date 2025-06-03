import { Trash2, Bookmark, MapPin, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
  onDelete?: (reportId: string) => void;
  onUpdate?: (reportId: string, updatedReport: Report) => void;
  onEdit?: (report: Report) => void;
}

export default function ReportItem({ 
  report, 
  isSaved = false, 
  deletable = false, 
  editable = false,
  onDelete,
  onUpdate,
  onEdit
}: ReportItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Darker shadow color 
  const shadowColor = 'rgba(160, 150, 130, 0.95)'; // Much darker shadow with higher opacity

  const handleEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
    
    if (onEdit) {
      // Use the callback for overlay mode
      onEdit(report);
    } else {
      // Fallback to navigation for page mode
      router.push(`/reports/${report.id}/edit`);
    }
  };

  const handleUpdate = async (updateData: any) => {
    if (isUpdating) return; // Prevent multiple update requests
    
    setIsUpdating(true);
    
    try {
      console.log("Updating report:", report.id, updateData);
      
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update report: ${response.status}`);
      }

      const result = await response.json();
      console.log("Update response:", result);
      
      // Show success toast
      toast.success("Report updated successfully");
      
      // Call the onUpdate callback to refresh the list with updated data
      if (onUpdate && result.data) {
        onUpdate(report.id, result.data);
      }
      
    } catch (error: any) {
      console.error("Error updating report:", error);
      toast.error(error.message || "Failed to update report");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return; // Prevent multiple delete requests
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting report:", report.id);
      
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete report: ${response.status}`);
      }

      const result = await response.json();
      console.log("Delete response:", result);
      
      // Show success toast
      toast.success("Report deleted successfully");
      
      // Call the onDelete callback to refresh the list
      if (onDelete) {
        onDelete(report.id);
      }
      
    } catch (error: any) {
      console.error("Error deleting report:", error);
      toast.error(error.message || "Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    router.push(`/reports/${report.id}`)
  }

  const handleAction = (e: React.MouseEvent) => {
    const action = (e.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action');
    
    switch (action) {
      case 'edit':
        e.stopPropagation(); // Prevent bubbling
        handleEdit(e);
        break;
      case 'delete':
        e.stopPropagation(); // Prevent bubbling
        break;
      case 'view':
        handleClick();
        break;
    }
  };
                     
  return (
    <div className="w-full py-3 px-4 flex flex-col gap-2 items-start rounded-lg bg-background hover:shadow-md transition-shadow duration-200 ease-in-out" 
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(e);
                }}
              >
                <Pencil size={14} />
              </Button>
            )}
            <DeleteConfirmationDialog
              title="Are you sure you want to delete this report?"
              trigger={
                <button 
                  className={cn(
                    "text-primary hover:text-accent transition-colors duration-150 ease-in-out p-1 flex-shrink-0",
                    isDeleting && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={handleAction}
                  data-action="delete"
                  disabled={isDeleting}
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
        {report.location ? formatArea(report.location.address) : "Unknown Location"}
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