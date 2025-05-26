'use client';

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner"; // Assuming you have toast installed

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryDropdownMenu } from "@/components/report/create-report-form/category-dropdown";
import { UrgencyDropdownMenu } from "@/components/report/create-report-form/urgency-dropdown";
import ImageUploader from "@/components/report/create-report-form/image-uploader";
import { Separator } from "@/components/ui/separator";

export function CreateReportForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "Other", // Default category
    description: "",
    images: [] as string[], // Will store uploaded image URLs
    urgency: "Medium" as "Low" | "Medium" | "High", // Default urgency
    
    // Location data
    latitude: 0,
    longitude: 0,
    locationAddressText: "",
    
    // Area data
    areaProvince: "",
    areaCity: "",
    areaMunicipality: "",
    areaBarangay: ""
  });

  // Event handlers for form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };
  
  const handleUrgencyChange = (urgency: "Low" | "Medium" | "High") => {
    setFormData(prev => ({ ...prev, urgency }));
  };
  
  const handleImageUpload = (imageUrls: string[]) => {
    setFormData(prev => ({ ...prev, images: ["/flood-image.png"] }));
  };
  
  const onLoginClick = () => {
    router.replace('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Add default status when submitting
      const reportData = {
        ...formData,
        status: "Unresolved" as "Unresolved" | "In Progress" | "Resolved"
      };
      
      // For demo purposes, if location isn't set, use default values
      if (reportData.latitude === 0 && reportData.longitude === 0) {
        // Demo values for Cebu City
        reportData.latitude = 10.3157;
        reportData.longitude = 123.8854;
        reportData.areaProvince = "Cebu";
        reportData.areaCity = "Cebu City";
        reportData.areaBarangay = "Lahug";
      }

      console.log(reportData)
      
      // Submit data to API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }
      
      const result = await response.json();
      
      toast.success("Report submitted successfully!");
      router.push(`/report/${result.id}`); // Navigate to the created report
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-12", className)} {...props}>
      <Card className="h-[85vh] min-h-[400px] max-h-[800px]">
        <ScrollArea className="h-full">
          <CardHeader className="text-left sticky top-0 bg-background z-10">
            <CardTitle className="text-2xl">Create a Report</CardTitle>
          </CardHeader>
          <div className="px-6">
            <Separator />
          </div>
          <CardContent className="flex flex-col items-center py-4">
            <form className="w-full max-w-full" onSubmit={handleSubmit}>
              <div className="w-full grid gap-6">
                <div className="w-full grid gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="title">Report Title</Label>
                    <Input 
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a title for your report"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-1">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the issue in detail"
                      required
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1">
                      <Label htmlFor="category">Category</Label>
                      <CategoryDropdownMenu onSelect={handleCategoryChange} />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="urgency">Urgency</Label>
                      <UrgencyDropdownMenu onSelect={handleUrgencyChange} />
                    </div>
                  </div>
                  
                  <div className="grid gap-1 mt-2">
                    <Label htmlFor="locationAddressText">Location</Label>
                    <Input 
                      id="locationAddressText"
                      name="locationAddressText"
                      value={formData.locationAddressText}
                      onChange={handleInputChange}
                      placeholder="Enter location description"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1">
                      <Label htmlFor="areaProvince">Province</Label>
                      <Input 
                        id="areaProvince"
                        name="areaProvince"
                        value={formData.areaProvince}
                        onChange={handleInputChange}
                        placeholder="Province"
                        required
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="areaBarangay">Barangay</Label>
                      <Input 
                        id="areaBarangay"
                        name="areaBarangay"
                        value={formData.areaBarangay}
                        onChange={handleInputChange}
                        placeholder="Barangay"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1">
                      <Label htmlFor="areaCity">City</Label>
                      <Input 
                        id="areaCity"
                        name="areaCity"
                        value={formData.areaCity}
                        onChange={handleInputChange}
                        placeholder="City (optional)"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="areaMunicipality">Municipality</Label>
                      <Input 
                        id="areaMunicipality"
                        name="areaMunicipality"
                        value={formData.areaMunicipality}
                        onChange={handleInputChange}
                        placeholder="Municipality (optional)"
                      />
                    </div>
                  </div>
                  
                  <ImageUploader onUpload={handleImageUpload} />
                </div>
                <Button 
                  type="submit" 
                  className="w-[70%] mx-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
            <Button 
              variant="outline" 
              className="w-[70%] mx-auto mt-4" 
              onClick={onLoginClick}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  );
}