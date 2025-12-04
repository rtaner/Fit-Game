import { createClient } from '@/lib/supabase/client';

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  storeId?: string;
  userId?: string;
  categoryId?: string;
  tags?: string[];
}

export interface ConfusionMatrixItem {
  questionId: string;
  questionName: string;
  correctAnswerId: string;
  selectedAnswerId: string;
  selectedAnswerName: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  lifeline50Used: number;
  lifelineSkipUsed: number;
}

export const analyticsService = {
  async getAnalytics(filters: AnalyticsFilter = {}) {
    const supabase = createClient();

    let query = supabase
      .from('answer_analytics')
      .select(`
        *,
        question:question_items!answer_analytics_question_id_fkey(id, name, tags),
        correct_answer:question_items!answer_analytics_correct_answer_id_fkey(id, name),
        selected_answer:question_items!answer_analytics_selected_answer_id_fkey(id, name),
        user:users!answer_analytics_user_id_fkey(id, username, store_id)
      `);

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.storeId) {
      query = query.eq('user.store_id', filters.storeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }

    return data;
  },

  async getConfusionMatrix(filters: AnalyticsFilter = {}): Promise<ConfusionMatrixItem[]> {
    const analytics = await this.getAnalytics(filters);

    if (!analytics) return [];

    // Group by question and selected answer
    const confusionMap = new Map<string, ConfusionMatrixItem>();

    analytics
      .filter((a) => !a.is_correct)
      .forEach((item) => {
        const key = `${item.question_id}-${item.selected_answer_id}`;

        if (confusionMap.has(key)) {
          const existing = confusionMap.get(key)!;
          existing.count += 1;
        } else {
          confusionMap.set(key, {
            questionId: item.question_id,
            questionName: item.question?.name || 'Unknown',
            correctAnswerId: item.correct_answer_id,
            selectedAnswerId: item.selected_answer_id,
            selectedAnswerName: item.selected_answer?.name || 'Unknown',
            count: 1,
            percentage: 0,
          });
        }
      });

    // Calculate percentages
    const totalIncorrect = analytics.filter((a) => !a.is_correct).length;
    const confusionArray = Array.from(confusionMap.values());

    confusionArray.forEach((item) => {
      item.percentage = totalIncorrect > 0 ? (item.count / totalIncorrect) * 100 : 0;
    });

    // Sort by count descending
    return confusionArray.sort((a, b) => b.count - a.count);
  },

  async getSummary(filters: AnalyticsFilter = {}): Promise<AnalyticsSummary | null> {
    const analytics = await this.getAnalytics(filters);

    if (!analytics || analytics.length === 0) {
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        averageResponseTime: 0,
        lifeline50Used: 0,
        lifelineSkipUsed: 0,
      };
    }

    const correctAnswers = analytics.filter((a) => a.is_correct).length;
    const incorrectAnswers = analytics.length - correctAnswers;
    const totalResponseTime = analytics.reduce((sum, a) => sum + (a.response_time_ms || 0), 0);
    const lifeline50Used = analytics.filter((a) => a.lifeline_used === '50-50').length;
    const lifelineSkipUsed = analytics.filter((a) => a.lifeline_used === 'skip').length;

    return {
      totalAnswers: analytics.length,
      correctAnswers,
      incorrectAnswers,
      accuracy: (correctAnswers / analytics.length) * 100,
      averageResponseTime: totalResponseTime / analytics.length,
      lifeline50Used,
      lifelineSkipUsed,
    };
  },

  async getTagPerformance(filters: AnalyticsFilter = {}) {
    const analytics = await this.getAnalytics(filters);

    if (!analytics) return [];

    // Group by tag
    const tagMap = new Map<
      string,
      { tag: string; total: number; correct: number; accuracy: number }
    >();

    analytics.forEach((item) => {
      const tags = item.question?.tags || [];

      tags.forEach((tag: string) => {
        if (tagMap.has(tag)) {
          const existing = tagMap.get(tag)!;
          existing.total += 1;
          if (item.is_correct) existing.correct += 1;
        } else {
          tagMap.set(tag, {
            tag,
            total: 1,
            correct: item.is_correct ? 1 : 0,
            accuracy: 0,
          });
        }
      });
    });

    // Calculate accuracy
    const tagArray = Array.from(tagMap.values());
    tagArray.forEach((item) => {
      item.accuracy = item.total > 0 ? (item.correct / item.total) * 100 : 0;
    });

    // Sort by total descending
    return tagArray.sort((a, b) => b.total - a.total);
  },

  async exportForAI(filters: AnalyticsFilter = {}) {
    const analytics = await this.getAnalytics(filters);

    if (!analytics) return null;

    // Limit to last 1000 records for AI processing
    const limitedData = analytics.slice(0, 1000);

    return limitedData.map((item) => ({
      timestamp: item.created_at,
      userId: item.user_id,
      questionId: item.question_id,
      questionName: item.question?.name,
      questionTags: item.question?.tags,
      correctAnswerId: item.correct_answer_id,
      correctAnswerName: item.correct_answer?.name,
      selectedAnswerId: item.selected_answer_id,
      selectedAnswerName: item.selected_answer?.name,
      isCorrect: item.is_correct,
      responseTimeMs: item.response_time_ms,
      lifelineUsed: item.lifeline_used,
    }));
  },
};
