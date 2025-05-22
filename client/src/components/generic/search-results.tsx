import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, CircleAlert, Bookmark, MapPin } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SearchResultItemProps {
  icon: React.ReactNode;
  iconColorClass: string;
  title: string;
  location: string;
  description: string;
  category: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ icon, iconColorClass, title, location, description, category }) => {
  // Darker shadow color 
  const shadowColor = 'rgba(160, 150, 130, 0.95)'; // Much darker shadow with higher opacity
                     
  return (
    <div className="mb-3 mx-2 py-3 px-4 flex items-start space-x-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 ease-in-out" 
         style={{ 
           background: '#FAF9F5', // Lighter than bg-background
           boxShadow: `0 2px 3px ${shadowColor}`
         }}>
      <div className={`p-2 rounded-full ${iconColorClass} self-start mt-1`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-slate-800 text-base tracking-tight">{title}</h3>
          <span className="text-xs font-semibold text-slate-700 bg-muted px-3 py-1 rounded-full whitespace-nowrap ml-2">{category}</span>
        </div>
        <p className="text-sm text-slate-500 mb-1 flex items-center">
          <MapPin size={14} className="mr-1" />
          {location}
        </p>
        <div className="relative">
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-1 overflow-hidden">{description}</p>
        </div>
      </div>
      <button className="text-slate-400 hover:text-primary transition-colors duration-150 ease-in-out p-1 flex-shrink-0">
        <Bookmark size={20} />
      </button>
    </div>
  );
};

interface SearchResultsProps {
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ onClose: parentOnClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    function handleClickOutside(event: MouseEvent) {
      if (resultsContainerRef.current && !resultsContainerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      parentOnClose();
    }, 300);
  };

  const sampleResults: SearchResultItemProps[] = [
    {
      icon: <AlertTriangle size={28} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'MAJOR FLOODING DOWNTOWN',
      location: 'Main St & Central Ave, Cebu City',
      description: 'Severe flooding reported, roads impassable. Avoid area. Emergency services dispatched.',
      category: 'Flood Alert'
    },
    {
      icon: <CircleAlert size={28} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Power Maintenance Scheduled',
      location: 'Banilad Area, Mandaue City',
      description: 'Power outage expected from 1 PM to 5 PM today for urgent maintenance work. Please prepare accordingly.',
      category: 'Utility Work'
    },
    {
      icon: <AlertTriangle size={28} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'Landslide Warning: Mountain View',
      location: 'Busay Hills, Cebu Transcentral Hwy',
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard'
    },
    {
      icon: <CircleAlert size={28} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Road Closure: Mango Avenue',
      location: 'Mango Avenue (near Fuente Osmeña)',
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic'
    },
    {
      icon: <AlertTriangle size={28} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'Landslide Warning: Mountain View',
      location: 'Busay Hills, Cebu Transcentral Hwy',
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard'
    },
    {
      icon: <CircleAlert size={28} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Road Closure: Mango Avenue',
      location: 'Mango Avenue (near Fuente Osmeña)',
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic'
    },
  ];

  return (
    <div
      ref={resultsContainerRef}
      className={cn(
        "flex flex-col rounded-xl shadow-lg overflow-hidden border border-gray-100",
        "transition-all duration-300 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
      )}
      style={{ background: '#FAF9F5' }} // Lighter than bg-background
    >
      {/* Sticky Header */}
      <div className="sticky top-0 backdrop-blur-md z-10 px-6 pt-6 pb-2 flex items-center justify-between"
           style={{ background: 'rgba(250, 249, 245, 0.95)' }}> {/* Lighter with transparency */}
        <h2 className="font-bold text-xl text-primary">Search Results</h2>
      </div>
      <div className="px-8 -mt-1">
        <Separator className="bg-accent h-[2px]" />
      </div>

      <ScrollArea className="flex-1 min-h-0 pt-2">
        {sampleResults.map((result, index) => (
          <SearchResultItem
            key={index}
            icon={result.icon}
            iconColorClass={result.iconColorClass}
            title={result.title}
            location={result.location}
            description={result.description}
            category={result.category}
          />
        ))}
      </ScrollArea>
    </div>
  );
};

export default SearchResults; 