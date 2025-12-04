import { createClient } from '@/lib/supabase/client';
import type { QuizCategory } from '@/types/database.types';

export interface CategoryCreateInput {
  name: string;
  description?: string;
  icon_url?: string;
  display_order?: number;
  is_active?: boolean;
  is_quiz_active?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  icon_url?: string;
  display_order?: number;
  is_active?: boolean;
  is_quiz_active?: boolean;
}

export const categoryService = {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<QuizCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get active categories only (for homepage - playable categories)
   */
  async getActiveCategories(): Promise<QuizCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('is_quiz_active', true) // Only show playable categories on homepage
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<QuizCategory | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create new category
   */
  async createCategory(input: CategoryCreateInput): Promise<QuizCategory> {
    const supabase = createClient();
    
    // Get max display_order if not provided
    let displayOrder = input.display_order;
    if (displayOrder === undefined) {
      const { data: categories } = await supabase
        .from('quiz_categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      displayOrder = categories && categories.length > 0 
        ? categories[0].display_order + 1 
        : 0;
    }

    const { data, error } = await supabase
      .from('quiz_categories')
      .insert({
        name: input.name,
        description: input.description || null,
        icon_url: input.icon_url || null,
        display_order: displayOrder,
        is_active: input.is_active ?? true,
        is_quiz_active: input.is_quiz_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update category
   */
  async updateCategory(id: string, input: CategoryUpdateInput): Promise<QuizCategory> {
    const supabase = createClient();
    
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.icon_url !== undefined) updateData.icon_url = input.icon_url;
    if (input.display_order !== undefined) updateData.display_order = input.display_order;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.is_quiz_active !== undefined) updateData.is_quiz_active = input.is_quiz_active;
    
    console.log('🔄 Updating category:', id, 'with data:', updateData);
    
    const { data, error } = await supabase
      .from('quiz_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Category updated successfully:', data);
    return data;
  },

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('quiz_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle category active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<QuizCategory> {
    return this.updateCategory(id, { is_active: isActive });
  },
};
