import { createClient } from '@/lib/supabase/client';
import type { Store, StoreCreateInput, StoreUpdateInput } from '@/types/database.types';

export const storeService = {
  /**
   * Get all stores
   */
  async getAllStores(): Promise<Store[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('store_code', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get store by ID
   */
  async getStoreById(id: string): Promise<Store | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get store by code
   */
  async getStoreByCode(code: number): Promise<Store | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('store_code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create new store
   */
  async createStore(input: StoreCreateInput): Promise<Store> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('stores')
      .insert({
        store_code: input.store_code,
        store_name: input.store_name,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update store
   */
  async updateStore(id: string, input: StoreUpdateInput): Promise<Store> {
    const supabase = createClient();
    
    // Build update object with only defined fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (input.store_name !== undefined) {
      updateData.store_name = input.store_name;
    }
    
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }
    
    const { data, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete store (soft delete)
   */
  async deleteStore(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('stores')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Validate store code range
   */
  validateStoreCode(code: number): boolean {
    return code >= 1500 && code <= 1950;
  },

  /**
   * Check if store code exists
   */
  async storeCodeExists(code: number): Promise<boolean> {
    const store = await this.getStoreByCode(code);
    return store !== null;
  },
};
