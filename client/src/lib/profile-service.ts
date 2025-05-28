import { supabase } from './supabase';
import { UserProfile, Report, SavedReport } from '@/types/profile';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  await updateProfile(userId, { avatar_url: publicUrl });
  return publicUrl;
}

export async function getUserReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSavedReports(userId: string): Promise<SavedReport[]> {
  const { data, error } = await supabase
    .from('saved_reports')
    .select(`
      *,
      report:reports(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveReport(userId: string, reportId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_reports')
    .insert({ user_id: userId, report_id: reportId });

  if (error) throw error;
}

export async function unsaveReport(userId: string, reportId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_reports')
    .delete()
    .eq('user_id', userId)
    .eq('report_id', reportId);

  if (error) throw error;
}
