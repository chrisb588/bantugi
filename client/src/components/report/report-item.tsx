import { Trash2, Bookmark, MapPin, CircleAlert, AlertTriangle } from 'lucide-react';

import { cn, formatArea } from '@/lib/utils';
import urgencyIcon from '@/constants/urgency-icon';
import Report from '@/interfaces/report';

interface ReportItemProps {
  report: Report;
  deletable?: boolean;
}

export default function ReportItem({ report, deletable = false }: ReportItemProps) {
  // Darker shadow color 
  const shadowColor = 'rgba(160, 150, 130, 0.95)'; // Much darker shadow with higher opacity
                     
  return (
    <div className="w-full mb-3 mx-2 py-3 px-4 flex flex-col gap-2 items-start space-x-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 ease-in-out" 
         style={{ 
           background: '#FAF9F5', // Lighter than bg-background
           boxShadow: `0 2px 3px ${shadowColor}`
         }}>
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
          <button className="text-primary hover:text-accent transition-colors duration-150 ease-in-out p-1 flex-shrink-0">
            <Trash2 size={20} />
          </button>
        ) : (
          <button className="text-slate-400 hover:text-primary transition-colors duration-150 ease-in-out p-1 flex-shrink-0">
            <Bookmark size={20} />
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