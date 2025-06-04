'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, ExternalLink, Trash2 } from 'lucide-react';

interface SavedReportsProps {
  userId: string;
}

interface SavedReport {
  id: string;
  title: string;
  description: string;
  created_at: string;
  location: string;
}

export function SavedReports({ userId }: SavedReportsProps) {
  const { supabase } = useAuth();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching saved reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId);

      if (error) throw error;
      setReports(reports.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error removing saved report:', error);
    }
  };

  if (loading) {
    return <div>Loading saved reports...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No saved reports yet
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{report.title}</h3>
                  <p className="text-sm text-gray-500">{report.location}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/reports/${report.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSaved(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
