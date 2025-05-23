import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Please make sure environment variables are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Deal = {
  id: string;
  title: string;
  description: string;
  price: string;
  original_price?: string;
  discount_percentage?: number;
  url: string;
  image_url: string;
  store_id: string;
  category_id: string;
  is_featured: boolean;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  slug: string;
};

export type Store = {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  slug: string;
};

export type User = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Auth helper functions
export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'editor';
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata?: { username?: string }
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) return null;

    // Get user profile from the database to include role and other metadata
    const { data: profile } = await supabase
      .from('users')
      .select('username, avatar_url, role')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email || '',
      username: profile?.username || data.user.user_metadata?.username,
      avatar_url: profile?.avatar_url,
      role: profile?.role
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: {
  username?: string;
  avatar_url?: string;
}) => {
  try {
    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { username: updates.username }
    });

    if (authError) throw authError;

    // Update profile in the database
    const { error: profileError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (profileError) throw profileError;

    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Database helper functions
export async function fetchDeals(options?: {
  limit?: number;
  category?: string;
  store?: string;
  featured?: boolean;
}) {
  try {
    let query = supabase.from('deals').select('*, stores(*), categories(*)').eq('is_active', true);

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.category) {
      query = query.eq('categories.slug', options.category);
    }

    if (options?.store) {
      query = query.eq('stores.slug', options.store);
    }

    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
}

export async function fetchStores(options?: {
  limit?: number;
  featured?: boolean;
}) {
  try {
    let query = supabase.from('stores').select('*').eq('is_active', true);

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}

export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchDealBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*, stores(*), categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching deal with slug ${slug}:`, error);
    return null;
  }
}

export async function fetchStoreBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching store with slug ${slug}:`, error);
    return null;
  }
}

export async function fetchStoreDeals(storeId: string, limit?: number) {
  try {
    let query = supabase
      .from('deals')
      .select('*, stores(*), categories(*)')
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching deals for store ${storeId}:`, error);
    return [];
  }
}

// Admin dashboard helper functions
export async function fetchAllDeals(options?: {
  limit?: number;
  offset?: number;
  status?: 'active' | 'inactive' | 'all';
  featured?: boolean;
  store?: string;
  category?: string;
  searchQuery?: string;
}) {
  try {
    let query = supabase
      .from('deals')
      .select('*, stores(*), categories(*)', { count: 'exact' });

    // Apply filters
    if (options?.status === 'active') {
      query = query.eq('is_active', true);
    } else if (options?.status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }

    if (options?.store) {
      query = query.eq('store_id', options.store);
    }

    if (options?.category) {
      query = query.eq('category_id', options.category);
    }

    if (options?.searchQuery) {
      query = query.ilike('title', `%${options.searchQuery}%`);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  } catch (error) {
    console.error('Error fetching all deals:', error);
    return { data: [], count: 0 };
  }
}

export async function fetchDealById(id: string) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*, stores(*), categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching deal with id ${id}:`, error);
    return null;
  }
}

export async function createDeal(dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Create a timestamp for created_at and updated_at
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('deals')
      .insert([{ ...dealData, created_at: now, updated_at: now }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
}

export async function updateDeal(id: string, dealData: Partial<Omit<Deal, 'id' | 'created_at'>>) {
  try {
    // Update the updated_at timestamp
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('deals')
      .update({ ...dealData, updated_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating deal with id ${id}:`, error);
    throw error;
  }
}

export async function deleteDeal(id: string) {
  try {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting deal with id ${id}:`, error);
    throw error;
  }
}

export async function toggleDealStatus(id: string, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error toggling status for deal with id ${id}:`, error);
    throw error;
  }
}

export async function toggleDealFeatured(id: string, isFeatured: boolean) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error toggling featured status for deal with id ${id}:`, error);
    throw error;
  }
}

export async function bulkDeleteDeals(ids: string[]) {
  try {
    const { error } = await supabase
      .from('deals')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error bulk deleting deals:`, error);
    throw error;
  }
}

export async function bulkUpdateDeals(ids: string[], updates: Partial<Deal>) {
  try {
    // Update the updated_at timestamp
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('deals')
      .update({ ...updates, updated_at: now })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error bulk updating deals:`, error);
    throw error;
  }
}

// Admin store management functions - we'll need these for the deal management interface
export async function fetchAllStores(options?: {
  limit?: number;
  offset?: number;
  active?: boolean;
  featured?: boolean;
  searchQuery?: string;
}) {
  try {
    let query = supabase
      .from('stores')
      .select('*', { count: 'exact' });

    if (options?.active !== undefined) {
      query = query.eq('is_active', options.active);
    }

    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }

    if (options?.searchQuery) {
      query = query.ilike('name', `%${options.searchQuery}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query.order('name');

    if (error) throw error;
    return { data, count };
  } catch (error) {
    console.error('Error fetching all stores:', error);
    return { data: [], count: 0 };
  }
}

// Admin category management functions
export async function fetchAllCategories(options?: {
  limit?: number;
  offset?: number;
  active?: boolean;
  searchQuery?: string;
}) {
  try {
    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' });

    if (options?.active !== undefined) {
      query = query.eq('is_active', options.active);
    }

    if (options?.searchQuery) {
      query = query.ilike('name', `%${options.searchQuery}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query.order('name');

    if (error) throw error;
    return { data, count };
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return { data: [], count: 0 };
  }
}
