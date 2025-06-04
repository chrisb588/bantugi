import React from 'react';
import { Search, MapPin, BookMarked, FileText, LogOut, UserCircle, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MainSidebar() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const handleCreateReport = () => {
    router.push('/create-report');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  return (
    <Sidebar className="border-r flex flex-col h-full">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl font-semibold">● placeHolder</span>
        </div>
        <div className="relative">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 flex-grow">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={true}>
              <MapPin className="h-4 w-4" />
              <span>Map View</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <BookMarked className="h-4 w-4" />
              <span>Saved Reports</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <FileText className="h-4 w-4" />
              <span>My Reports</span>
            </SidebarMenuButton>
            <Button
              variant="ghost"
              className="w-full justify-start mt-2"
              onClick={handleCreateReport}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>Create New Report</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Radius (km)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Min" />
                <Input type="number" placeholder="Max" />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Location</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region1">Region 1</SelectItem>
                <SelectItem value="region2">Region 2</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="province1">Province 1</SelectItem>
                <SelectItem value="province2">Province 2</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city1">City 1</SelectItem>
                <SelectItem value="city2">City 2</SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start mb-2"
          onClick={handleViewProfile}
        >
          <UserCircle className="h-4 w-4 mr-2" />
          <span>See Account</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
