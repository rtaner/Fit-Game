import { createClient } from '@/lib/supabase/client';
import type { QuestionItem } from '@/types/database.types';

export interface ProductImage {
  url: string;
  color: string;
  isPrimary: boolean;
}

export interface QuestionCreateInput {
  category_id: string;
  name: string;
  image_url: string;
  cloudinary_public_id?: string;
  images?: ProductImage[];
  description: string;
  explanation?: string;
  tags: string[];
  gender?: 'Kadın' | 'Erkek';
  fit_category?: string;
  is_active?: boolean;
}

export interface QuestionUpdateInput {
  name?: string;
  image_url?: string;
  cloudinary_public_id?: string;
  images?: ProductImage[];
  description?: string;
  explanation?: string;
  tags?: string[];
  gender?: 'Kadın' | 'Erkek';
  fit_category?: string;
  is_active?: boolean;
}

export const questionService = {
  /**
   * Get all questions
   */
  async getAllQuestions(): Promise<QuestionItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get questions by category
   */
  async getQuestionsByCategory(categoryId: string): Promise<QuestionItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_items')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get active questions by category
   */
  async getActiveQuestionsByCategory(categoryId: string): Promise<QuestionItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get question by ID
   */
  async getQuestionById(id: string): Promise<QuestionItem | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create new question
   */
  async createQuestion(input: QuestionCreateInput): Promise<QuestionItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_items')
      .insert({
        category_id: input.category_id,
        name: input.name,
        image_url: input.image_url,
        cloudinary_public_id: input.cloudinary_public_id || null,
        images: input.images || [],
        description: input.description,
        explanation: input.explanation || null,
        tags: input.tags,
        gender: input.gender || null,
        fit_category: input.fit_category || null,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update question
   */
  async updateQuestion(id: string, input: QuestionUpdateInput): Promise<QuestionItem> {
    const supabase = createClient();
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.cloudinary_public_id !== undefined) updateData.cloudinary_public_id = input.cloudinary_public_id;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.explanation !== undefined) updateData.explanation = input.explanation;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.fit_category !== undefined) updateData.fit_category = input.fit_category;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    
    const { data, error } = await supabase
      .from('question_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete question (soft delete)
   */
  async deleteQuestion(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('question_items')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Search questions
   */
  async searchQuestions(query: string, categoryId?: string): Promise<QuestionItem[]> {
    const supabase = createClient();
    let queryBuilder = supabase
      .from('question_items')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Filter questions by tags
   */
  async filterByTags(tags: string[], categoryId?: string): Promise<QuestionItem[]> {
    const supabase = createClient();
    let queryBuilder = supabase
      .from('question_items')
      .select('*')
      .contains('tags', tags);

    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
