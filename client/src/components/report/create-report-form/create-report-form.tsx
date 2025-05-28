'use client';

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area"; // Make sure to import the proper ScrollArea
import { CategoryDropdownMenu } from "@/components/report/create-report-form/category-dropdown";
import { UrgencyDropdownMenu } from "@/components/report/create-report-form/urgency-dropdown";
import ImageUploader from "@/components/report/create-report-form/image-uploader";
import { Separator } from "@/components/ui/separator";

export function CreateReportForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  
  const onLoginClick = () => {
    router.replace('/login')
  };

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-12", className)} {...props}>
      <Card className="h-[85vh] min-h-[400px] max-h-[800px]"> {/* Set fixed height here */}
        <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
          <CardHeader className="text-left sticky top-0 bg-background z-10">
            <CardTitle className="text-2xl">Create a Report</CardTitle>
          </CardHeader>
          <div className="px-6">
            <Separator />
          </div>
          <CardContent className="flex flex-col items-center py-4">
            <form className="w-full max-w-full">
              <div className="w-full grid gap-6"> {/* Reduced gap from 10 to 6 */}
                <div className="w-full grid gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <div className="flex items-center">
                      <Label htmlFor="description">Description</Label>
                    </div>
                    <Textarea id="description" className="min-h-[100px]" />
                  </div>
                  <div className="flex items-center justify-between gap-4"> {/* Reduced gap from 6 to 4 */}
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="category">Category</Label>
                      <CategoryDropdownMenu />
                    </div>
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="urgency">Urgency</Label>
                      <UrgencyDropdownMenu />
                    </div>
                  </div>
                  <ImageUploader />
                </div>
                <Button type="submit" className="w-[70%] mx-auto">
                  Submit
                </Button>
              </div>
            </form>
            <Button variant="outline" className="w-[70%] mx-auto mt-4" onClick={onLoginClick}>
              Cancel
            </Button>
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  )
}