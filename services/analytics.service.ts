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
        correct_answer:question_items!answer_analytics_correct_answer_id_fkey(id, name, fit_category),
        selected_answer:question_items!answer_analytics_selected_answer_id_fkey(id, name),
        user:users!answer_analytics_user_id_fkey(id, username, store_code)
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
      query = query.eq('user.store_code', filters.storeId);
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

  // NEW: Get most confused fits (fit pairs that are confused with each other)
  async getMostConfusedFits(filters: AnalyticsFilter = {}) {
    const analytics = await this.getAnalytics(filters);

    if (!analytics) return [];

    // Group by correct answer (fit) and selected answer (confused fit)
    const confusionMap = new Map<
      string,
      {
        correctFit: string;
        confusedWithFit: string;
        count: number;
        percentage: number;
      }
    >();

    analytics
      .filter((a) => !a.is_correct)
      .forEach((item) => {
        const key = `${item.correct_answer?.name}-${item.selected_answer?.name}`;

        if (confusionMap.has(key)) {
          const existing = confusionMap.get(key)!;
          existing.count += 1;
        } else {
          confusionMap.set(key, {
            correctFit: item.correct_answer?.name || 'Unknown',
            confusedWithFit: item.selected_answer?.name || 'Unknown',
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

  // NEW: Get most failed fits (fits with highest error rate)
  async getMostFailedFits(filters: AnalyticsFilter = {}) {
    const analytics = await this.getAnalytics(filters);

    if (!analytics) return [];

    // Group by correct answer (the fit that should have been selected)
    const fitMap = new Map<
      string,
      {
        fitName: string;
        totalAsked: number;
        totalWrong: number;
        errorRate: number;
      }
    >();

    analytics.forEach((item) => {
      const fitName = item.correct_answer?.name || 'Unknown';

      if (fitMap.has(fitName)) {
        const existing = fitMap.get(fitName)!;
        existing.totalAsked += 1;
        if (!item.is_correct) existing.totalWrong += 1;
      } else {
        fitMap.set(fitName, {
          fitName,
          totalAsked: 1,
          totalWrong: item.is_correct ? 0 : 1,
          errorRate: 0,
        });
      }
    });

    // Calculate error rates
    const fitArray = Array.from(fitMap.values());
    fitArray.forEach((item) => {
      item.errorRate = item.totalAsked > 0 ? (item.totalWrong / item.totalAsked) * 100 : 0;
    });

    // Sort by error rate descending
    return fitArray.sort((a, b) => b.errorRate - a.errorRate);
  },

  // NEW: Get category training needs (categories with low performance)
  async getCategoryTrainingNeeds(filters: AnalyticsFilter = {}) {
    const analytics = await this.getAnalytics(filters);

    if (!analytics) return [];

    // Group by fit_category
    const categoryMap = new Map<
      string,
      { category: string; total: number; correct: number; accuracy: number }
    >();

    analytics.forEach((item) => {
      // Get fit_category from correct_answer
      const fitCategory = item.correct_answer?.fit_category || 'Diğer';

      if (categoryMap.has(fitCategory)) {
        const existing = categoryMap.get(fitCategory)!;
        existing.total += 1;
        if (item.is_correct) existing.correct += 1;
      } else {
        categoryMap.set(fitCategory, {
          category: fitCategory,
          total: 1,
          correct: item.is_correct ? 1 : 0,
          accuracy: 0,
        });
      }
    });

    // Calculate accuracy
    const categoryArray = Array.from(categoryMap.values());
    categoryArray.forEach((item) => {
      item.accuracy = item.total > 0 ? (item.correct / item.total) * 100 : 0;
    });

    // Sort by accuracy ascending (worst first)
    return categoryArray
      .map((cat) => ({
        category: cat.category,
        accuracy: cat.accuracy,
        total: cat.total,
        correct: cat.correct,
        wrong: cat.total - cat.correct,
        trainingPriority:
          cat.accuracy < 60 ? 'high' : cat.accuracy < 80 ? 'medium' : 'low',
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  },

  // NEW: Get user-specific weak points
  async getUserWeakPoints(userId: string, filters: AnalyticsFilter = {}) {
    const userFilters = { ...filters, userId };
    const analytics = await this.getAnalytics(userFilters);

    if (!analytics) return null;

    const tagPerformance = await this.getTagPerformance(userFilters);
    const confusedFits = await this.getMostConfusedFits(userFilters);
    const failedFits = await this.getMostFailedFits(userFilters);

    return {
      weakCategories: tagPerformance.filter((t) => t.accuracy < 70).slice(0, 5),
      mostConfusedFits: confusedFits.slice(0, 5),
      mostFailedFits: failedFits.slice(0, 5),
      totalAnswers: analytics.length,
      overallAccuracy:
        analytics.length > 0
          ? (analytics.filter((a) => a.is_correct).length / analytics.length) * 100
          : 0,
    };
  },

  // NEW: Get store comparison
  async getStoreComparison(filters: AnalyticsFilter = {}) {
    const analytics = await this.getAnalytics(filters);

    if (!analytics) return [];

    // Group by store
    const storeMap = new Map<
      number,
      {
        storeCode: number;
        totalAnswers: number;
        correctAnswers: number;
        accuracy: number;
      }
    >();

    analytics.forEach((item) => {
      const storeCode = item.user?.store_code || 0;

      if (storeMap.has(storeCode)) {
        const existing = storeMap.get(storeCode)!;
        existing.totalAnswers += 1;
        if (item.is_correct) existing.correctAnswers += 1;
      } else {
        storeMap.set(storeCode, {
          storeCode,
          totalAnswers: 1,
          correctAnswers: item.is_correct ? 1 : 0,
          accuracy: 0,
        });
      }
    });

    // Calculate accuracy
    const storeArray = Array.from(storeMap.values());
    storeArray.forEach((item) => {
      item.accuracy =
        item.totalAnswers > 0 ? (item.correctAnswers / item.totalAnswers) * 100 : 0;
    });

    // Sort by accuracy ascending (worst first)
    return storeArray.sort((a, b) => a.accuracy - b.accuracy);
  },
};
