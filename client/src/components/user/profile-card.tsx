'use client';

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import Image from "next/image";
import { MapPin, Settings2, Trash, ArrowLeftFromLine } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"; // Make sure to import the proper ScrollArea
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface ProfileCardProps extends React.ComponentProps<"div"> {
  edit?: boolean;
}

export default function ProfileCard({
  className,
  edit = false,
  ...props
}: ProfileCardProps) {
  const router = useRouter();

  const navigateToEditProfile = () => {
    router.push('[username]/account/edit');
  };

  const handleDeleteAccount = () => {
    alert('Delete Account clicked');
  };

  const handleLogout = () => {
    alert('Logout clicked');
  };

  return (
    <div className={cn("w-full max-w-lg flex flex-col gap-4 -mt-12", className)} {...props}>
      <Card className="h-[85vh] min-h-[400px] max-h-[800px]"> {/* Set fixed height here */}
        <ScrollArea className="h-full"> {/* Make ScrollArea full height of card */}
          <CardHeader className="text-center sticky top-0 bg-background z-10">
            <CardTitle className="text-2xl">YOUR PROFILE</CardTitle>
          </CardHeader>
          {edit && (
            <div className="px-6">
              <Separator />
            </div>
          )}
          <CardContent className="flex flex-col items-center py-4 gap-2">
            {edit && (
              <div className="text-lg font-bold text-foreground">
                Edit Account
              </div>
            )}
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted">
              <Image
                src="/img/avatar.jpg"
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="font-bold text-lg text-foreground">username</div>
              <div className="flex items-center gap-1 text-foreground">
                  <MapPin size={16} />
                <div className="font-bold text-sm ">
                  Jagobiao, Mandaue City, Cebu
                </div>
              </div>
            </div>
          </CardContent>
          {edit && (
            <div className="px-6">
              <Separator />
            </div>
          )}
          <CardContent className="flex flex-col items-center py-4 gap-2">
            {edit ? (
              <div className="flex flex-col items-center gap-2">
                <Button variant="ghost" onClick={handleDeleteAccount}>
                  <div className="flex items-center gap-1 text-primary mt-4">
                    <Trash size={16} />
                    <div className="font-bold text-sm">
                      Delete Account
                    </div>
                  </div>
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <div className="flex items-center gap-1 text-accent mt-4">
                    <ArrowLeftFromLine size={16} />
                    <div className="font-bold text-sm">
                      Logout
                    </div>
                  </div>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={navigateToEditProfile}>
                <div className="flex items-center gap-1 text-accent mt-4">
                  <Settings2 size={16} />
                  <div className="font-bold text-sm">
                    Account Settings
                  </div>
                </div>
              </Button>
            )}
          </CardContent>
        </ScrollArea> 
      </Card>
    </div>
  )
}