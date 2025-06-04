'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Settings, BookMarked, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { SavedReports } from '@/components/profile/saved-reports';
import { UserReports } from '@/components/profile/user-reports';

export default function ProfilePage() {
  const { user, supabase } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    };

    fetchProfile();
  }, [user, supabase]);

  if (!user || !profile) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">{profile.full_name?.[0] || user.email?.[0]}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name || 'User'}</h2>
              <p className="text-gray-500">{profile.location || 'No location set'}</p>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Account Settings
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center">
            <BookMarked className="w-4 h-4 mr-2" />
            Saved Reports
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            My Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <ProfileSettings user={user} profile={profile} />
        </TabsContent>
        <TabsContent value="saved">
          <SavedReports userId={user.id} />
        </TabsContent>
        <TabsContent value="reports">
          <UserReports userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
