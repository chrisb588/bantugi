import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Info, Bookmark, X } from 'lucide-react'; // Added Bookmark and X icons
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SearchResultItemProps {
  icon: React.ReactNode;
  iconColorClass: string;
  title: string;
  location: string;
  description: string;
  category: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ icon, iconColorClass, title, location, description, category }) => {
  return (
    <div className="p-4 flex items-start space-x-3 hover:bg-slate-100/50 transition-colors duration-150 ease-in-out border-b border-slate-200">
      <div className={`p-2 rounded-full ${iconColorClass} mt-1`}> {/* Added mt-1 for alignment */}
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          {/* Pill Category */}
          <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium tracking-wide">{category}</span>
        </div>
        <p className="text-sm text-slate-500">{location}</p>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
      </div>
      <button className="text-slate-400 hover:text-primary transition-colors duration-150 ease-in-out p-1">
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
      icon: <AlertTriangle size={24} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'MAJOR FLOODING DOWNTOWN',
      location: 'Main St & Central Ave, Cebu City',
      description: 'Severe flooding reported, roads impassable. Avoid area. Emergency services dispatched.',
      category: 'Flood Alert'
    },
    {
      icon: <Info size={24} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Power Maintenance Scheduled',
      location: 'Banilad Area, Mandaue City',
      description: 'Power outage expected from 1 PM to 5 PM today for urgent maintenance work.',
      category: 'Utility Work'
    },
    {
      icon: <AlertTriangle size={24} className="text-primary" />,
      iconColorClass: 'bg-red-100',
      title: 'Landslide Warning: Mountain View',
      location: 'Busay Hills, Cebu Transcentral Hwy',
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground.',
      category: 'Geohazard'
    },
    {
      icon: <Info size={24} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Road Closure: Mango Avenue',
      location: 'Mango Avenue (near Fuente Osmeña)',
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes.',
      category: 'Traffic'
    },
        {
      icon: <Info size={24} className="text-accent" />,
      iconColorClass: 'bg-orange-100',
      title: 'Celebrity Spotted: Christian Brillos',
      location: 'Ayala Center Cebu',
      description: 'My Lodi Christian Brillos was spotted at Ayala Center Cebu today. He is in town for a private event.',
      category: 'Celebrity'
    },
  ];

  return (
    <div
      ref={resultsContainerRef}
      className={cn(
        "bg-background flex flex-col rounded-xl shadow-xl overflow-hidden border border-slate-200", // Using bg-background
        "transition-all duration-300 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
      )}
    >
      {/* Sticky Header - using bg-background with opacity for consistency */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 p-4 flex items-center justify-between border-b border-slate-200">
        <h2 className="font-semibold text-lg text-slate-800">Search Results</h2>
        <button
          onClick={handleClose}
          className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 p-1.5 rounded-full transition-colors duration-150 ease-in-out"
        >
          <X size={20} />
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0"> {/* min-h-0 helps flex-1 determine height for scrolling */}
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
        {/* No extra padding div needed if last item has bottom border or ScrollArea has its own padding */}
      </ScrollArea>
    </div>
  );
};

export default SearchResults; 