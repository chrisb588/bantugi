export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  status: 'pending' | 'in_progress' | 'resolved';
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedReport {
  id: string;
  user_id: string;
  report_id: string;
  created_at: string;
  report: Report;
}
