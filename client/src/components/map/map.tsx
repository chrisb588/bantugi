'use client';

import React, { useEffect, useState } from 'react';
import type LType from 'leaflet';
import { MapContainer, TileLayer, Popup, useMapEvents, useMap as useLeafletMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createPortal } from 'react-dom';

import Report from '@/interfaces/report';
import { useFetchPins } from '@/hooks/useFetchPins';
import { useDrawPins } from '@/hooks/useDrawPins';
import { useMapContext } from '@/context/map-context';
import { ReportCard } from '@/components/report/report-card';

interface MapProps {
  className?: string;
  centerOnUser?: boolean;
  center?: [number, number];
  zoom?: number;
}

function MapController({ centerOnUser = true }) {
  const map = useLeafletMap(); // This gets the map instance from the parent <MapContainer>
  useEffect(() => {
    if (centerOnUser && map) { // Added map null check for robustness
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo(
            [position.coords.latitude, position.coords.longitude],
            map.getZoom() || 15
          );
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [centerOnUser, map]);
  return null;
}

function LocationMarker({ showUserLocation = true }: { showUserLocation?: boolean }) {
  const [position, setPosition] = useState<LType.LatLng | null>(null);
  const { L } = useMapContext(); // Get L from the main MapProvider

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      // Explicitly fly to the location with a desired zoom level (e.g., 16)
      map.flyTo(e.latlng, 11, { // Optional: animate the flyTo for a smoother transition
        animate: true, // Optional: enable animation
      }); 
    },
    locationerror(e) {
      console.error("Location error:", e.message);
      // You could add a user notification here if desired
    }
  });

  useEffect(() => {
    if (showUserLocation && map) {
      // Call locate without setView: true. Let the locationfound handler manage flying.
      map.locate({ maxZoom: 11, watch: false, enableHighAccuracy: true }); 
    } else if (!showUserLocation && map && (map as any).stopLocate) { // Check if map can stopLocate
      (map as any).stopLocate();
      setPosition(null); // Clear the marker position
    }
  }, [map, showUserLocation]);

  // Only render the marker if L is available, position is set, and showUserLocation is true
  if (!L || position === null || !showUserLocation) {
    return null;
  }

  // Use L.Icon.Default, assuming it's correctly configured in the main MapProvider
  // Or create a specific icon using L.icon(...) if needed
  const userIcon = new L.Icon.Default();

  return (
    <Marker position={position} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function MapFeaturesLoader() {
  const reactLeafletMapInstance = useLeafletMap();
  const { setMapInstance, mapInstanceRef: contextMapRef, L, isMapReady } = useMapContext();
  // State for the selected report and loading state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);

  useEffect(() => {
    if (!L) return;
    if (reactLeafletMapInstance && contextMapRef.current !== reactLeafletMapInstance) {
      setMapInstance(reactLeafletMapInstance);
    }

    return () => {
      if (contextMapRef.current === reactLeafletMapInstance) {
        setMapInstance(null);
      }
    };
  }, [reactLeafletMapInstance, setMapInstance, contextMapRef, L]);

  // Function to fetch report details
  const fetchReportDetails = async (reportId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }
      const data = await response.json();
      setSelectedReport(data);
      setShowReportCard(true);
    } catch (error) {
      console.error("Error fetching report details:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Close the report card
  const handleCloseReportCard = () => {
    setShowReportCard(false);
    setSelectedReport(null);
  };

  // Function to center the map on the report's location
  const handleViewMap = () => {
    if (selectedReport?.location?.coordinates && contextMapRef.current) {
      const { lat, lng } = selectedReport.location.coordinates;
      contextMapRef.current.flyTo([lat, lng], 18);
    }
    setShowReportCard(false);
  };

  const { pins, isLoading: isLoadingPins, error: fetchPinsError } = useFetchPins();

  // You might want to display loading/error states to the user
  if (isLoadingPins) { /* show loading indicator */ }
  if (fetchPinsError) { /* show error message */ }

  // Define your marker click handler
  const handleMarkerClick = (reportId: string) => {
    // Fetch report details or navigate, etc.
    console.log("Marker clicked:", reportId);
    // fetchReportDetails(reportId); // (your existing function)
  };

  useDrawPins(pins, handleMarkerClick);

  // Create portal for the ReportCard to ensure it appears above the map
  return (
    <>
      {showReportCard && selectedReport && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <ReportCard 
            report={selectedReport} 
            onBack={handleCloseReportCard}
            onViewMap={handleViewMap}
          />
        </div>,
        document.body
      )}
      {isLoading && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Loading report...</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// This is the component that will be dynamically imported.
// It no longer loads Leaflet or renders its own MapProvider.
export default function MapContents({
  center = [10.32256745, 123.898804407153],
  zoom = 17,
  className = '',
  centerOnUser = false,
}: MapProps) {
  const { L: LFromContext, isMapReady } = useMapContext();

  if (!LFromContext) {
    return (
      <div className={`w-full h-screen flex items-center justify-center bg-background ${className}`}>
        Loading Map Library...
      </div>
    );
  }

  // console.log("[MapContents] Rendering. isMapReady from context:", isMapReady);

  return (
    <div
      className={`w-full h-screen ${className}`}
      style={{ position: 'relative', zIndex: 0 }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100vh', width: '100%', zIndex: 1 }}
        zoomControl={true}
        // whenCreated={(mapInstance) => { /* Alternative way to get map instance */ }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Components that need the map instance from react-leaflet context */}
        <MapController centerOnUser={centerOnUser} />
        <LocationMarker showUserLocation={true} />
        <MapFeaturesLoader /> {/* This component links react-leaflet map to your MapContext */}
        
        {/* Example of a component that might use your custom context's isMapReady */}
        {/* {isMapReady ? <SomeOtherMapOverlay /> : null} */}
      </MapContainer>
    </div>
  );
}

// Ensure MapController and LocationMarker are defined as before