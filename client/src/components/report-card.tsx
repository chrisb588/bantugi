'use client';

import { Report } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';

interface ReportCardProps {
  report: Report;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {report.images && report.images.length > 0 && (
        <div className="relative w-full h-48">
          <Image
            src={report.images[0]}
            alt={report.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{report.title}</CardTitle>
            <CardDescription>📍 {report.location}</CardDescription>
          </div>
          <Badge className={statusColors[report.status]}>
            {report.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Reported on {format(new Date(report.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
