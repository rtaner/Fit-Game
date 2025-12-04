import { createClient } from '@/lib/supabase/client';

export interface ErrorReport {
  id: string;
  user_id: string;
  question_id: string;
  report_text: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export const errorReportService = {
  async createReport(userId: string, questionId: string, reportText: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('error_reports')
      .insert({
        user_id: userId,
        question_id: questionId,
        report_text: reportText,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return null;
    }

    return data;
  },

  async getReports(status?: string) {
    const supabase = createClient();

    let query = supabase
      .from('error_reports')
      .select(`
        *,
        user:users!error_reports_user_id_fkey(username),
        question:question_items!error_reports_question_id_fkey(name, image_url)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return data;
  },

  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
    adminNotes?: string
  ) {
    const supabase = createClient();

    const updateData: any = { status };
    if (adminNotes) updateData.admin_notes = adminNotes;
    if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('error_reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('Error updating report:', error);
      return null;
    }

    return data;
  },
};
