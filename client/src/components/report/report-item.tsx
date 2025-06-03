import { Trash2, Bookmark, MapPin, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { cn, formatArea } from '@/lib/utils';
import urgencyIcon from '@/constants/urgency-icon';
import Report from '@/interfaces/report';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import useIsReportSaved from '@/hooks/useIsReportSaved';
import { useMapContext } from '@/context/map-context';

interface ReportItemProps {
  report: Report;
  className?: string;
  isSaved?: boolean;
  deletable?: boolean;
  editable?: boolean;
  showSaveButton?: boolean; // Whether to show save/unsave functionality
  onDelete?: (reportId: string) => void;
  onUpdate?: (reportId: string, updatedReport: Report) => void;
  onEdit?: (report: Report) => void;
  onReportClick?: (report: Report) => void;
  onSaveToggle?: (reportId: string, isSaved: boolean) => void;
}

export default function ReportItem({ 
  report, 
  className,
  isSaved = false, 
  deletable = false, 
  editable = false,
  showSaveButton = true,
  onDelete,
  onUpdate,
  onEdit,
  onReportClick,
  onSaveToggle
}: ReportItemProps) {
  const router = useRouter();
  const { mapInstanceRef } = useMapContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use the hook to get real-time save status
  const { 
    isSaved: actualIsSaved, 
    isLoading: isSaveStatusLoading, 
    refetch: refetchSaveStatus 
  } = useIsReportSaved(report.id);
  
  // Use actual save status from hook, fallback to prop if loading
  const reportSaved = isSaveStatusLoading ? isSaved : actualIsSaved;
  
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

  // const handleUpdate = async (updateData: Record<string, unknown>) => {
  //   if (isUpdating) return; // Prevent multiple update requests
  //   
  //   setIsUpdating(true);
  //   
  //   try {
  //     console.log("Updating report:", report.id, updateData);
  //     
  //     const response = await fetch(`/api/reports/${report.id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include', // Include cookies for authentication
  //       body: JSON.stringify(updateData),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.error || `Failed to update report: ${response.status}`);
  //     }

  //     const result = await response.json();
  //     console.log("Update response:", result);
  //     
  //     // Show success toast
  //     toast.success("Report updated successfully");
  //     
  //     // Call the onUpdate callback to refresh the list with updated data
  //     if (onUpdate && result.data) {
  //       onUpdate(report.id, result.data);
  //     }
  //     
  //   } catch (error) {
  //     console.error("Error updating report:", error);
  //     const errorMessage = error instanceof Error ? error.message : "Failed to update report";
  //     toast.error(errorMessage);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

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
      
    } catch (error) {
      console.error("Error deleting report:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete report";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (isSaving) return; // Prevent multiple save requests
    
    setIsSaving(true);
    
    try {
      const endpoint = '/api/reports/save';
      const method = reportSaved ? 'DELETE' : 'POST';
      
      console.log(`${reportSaved ? 'Unsaving' : 'Saving'} report:`, report.id);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reportId: report.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${reportSaved ? 'unsave' : 'save'} report: ${response.status}`);
      }

      const result = await response.json();
      console.log(`${reportSaved ? 'Unsave' : 'Save'} response:`, result);
      
      // Refetch save status to get updated state
      refetchSaveStatus();
      
      // Show success toast
      toast.success(`Report ${reportSaved ? 'unsaved' : 'saved'} successfully`);
      
      // Call the onSaveToggle callback if provided
      if (onSaveToggle) {
        onSaveToggle(report.id, !reportSaved);
      }
      
    } catch (error) {
      console.error(`Error ${reportSaved ? 'unsaving' : 'saving'} report:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${reportSaved ? 'unsave' : 'save'} report`;
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClick = () => {
    // First navigate to the map location if coordinates are available
    if (report.location?.coordinates) {
      const { lat, lng } = report.location.coordinates;
      
      // If we're on the home page (have access to map), navigate to location first
      if (mapInstanceRef.current) {
        // Fly to the report location on the map
        mapInstanceRef.current.flyTo([lat, lng], 18);
        
        // If onReportClick is provided, use it to show the report overlay (like pin clicks)
        if (onReportClick) {
          onReportClick(report);
          return;
        }
        
        // Small delay to let the map animation start, then navigate to report page
        setTimeout(() => {
          router.push(`/reports/${report.id}`);
        }, 300);
        
        return;
      }
      
      // If not on home page but have coordinates, navigate to home with coordinates
      router.push(`/home?lat=${lat}&lng=${lng}&zoom=18&reportId=${report.id}`);
      return;
    }
    
    // Fallback behavior for reports without location
    if (onReportClick) {
      onReportClick(report);
    } else {
      router.push(`/reports/${report.id}`);
    }
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
      case 'save':
        e.stopPropagation(); // Prevent bubbling
        handleSaveToggle(e);
        break;
      case 'view':
        handleClick();
        break;
    }
  };
                     
  return (
    <div className={cn(
           "w-full py-3 px-4 flex flex-col gap-2 items-start rounded-lg bg-background hover:shadow-md transition-shadow duration-200 ease-in-out",
           className
         )} 
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
        ) : showSaveButton ? (
          <button 
            className={cn(
              "transition-colors duration-150 ease-in-out p-1 flex-shrink-0",
              reportSaved ? "text-primary hover:text-accent" : "text-slate-400 hover:text-primary",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleAction}
            data-action="save"
            disabled={isSaving}
          >
            <Bookmark size={20} fill={reportSaved ? "currentColor" : "none"} />
          </button>
        ) : null}
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