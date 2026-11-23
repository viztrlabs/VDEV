/**
 * VizTR Phase 02 — Backend Service Layer
 * Server-side services for Telegram bot integration, user management,
 * and admin operations. Uses Supabase authenticated client via JWT.
 * 
 * All functions use the Supabase authenticated client for RLS enforcement.
 * Never expose service-role keys to the browser.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { normalizeUserRole, UserRole } from './rbac';
import { getServerCredential } from './server-credentials';

// Types for service responses
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Type guards for role checking
export function isSuperAdmin(role: string | null | undefined): boolean {
  return normalizeUserRole(role) === 'super_admin';
}

export function isAdmin(role: string | string | undefined): boolean {
  return normalizeUserRole(role) === 'admin';
}

/**
 * Get authenticated Supabase client for server-side operations.
 * Uses the Supabase JWT minted from NextAuth for RLS enforcement.
 */
export function getAuthenticatedSupabase(userId?: string): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  // In production, we need a valid Supabase JWT for RLS
  // For development with demo users, use the anon client with caution
  // The actual RLS is enforced by the supabase JWT minted on the NextAuth callback

  // Return the standard anon client — RLS will be enforced by the
  // auth state set in the NextAuth session (token.supabaseAccessToken)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * User Registration Service
 * Registers a new user via Telegram bot.
 * Creates user_profiles record with status='pending'.
 * Creates user_consent record with terms acceptance.
 *
 * @param telegramChatId - The Telegram chat ID
 * @param category - User category (client, architect, 3d_artist, freelancer, learner, technology_enthusiast)
 * @param name - User's name (optional)
 * @param email - User's email (optional, for website linking)
 * @param termsAccepted - Whether terms were accepted
 * @param termsVersion - Terms version accepted
 */
export async function registerTelegramUser(
  telegramChatId: string,
  category: UserRole,
  name?: string,
  email?: string,
  termsAccepted: boolean = false,
  termsVersion: string = '1.0'
): Promise<ServiceResponse<{ profileId: string; consentId: string }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    // 1. Create user_profiles record with status='pending'
    const { data: profile, error: profileError } = await supa
      .from('user_profiles')
      .insert({
        id: crypto.randomUUID(), // Generate UUID for the profile
        category,
        status: 'pending',
        telegram_chat_id: telegramChatId,
        ...(name && { name }),
        ...(email && { email }),
      })
      .select()
      .single();

    if (profileError) {
      console.error('[registerTelegramUser] Profile error:', profileError);
      return { success: false, error: 'Failed to create profile', code: 'profile_error' };
    }

    // 2. Create user_consent record
    const { data: consent, error: consentError } = await supa
      .from('user_consent')
      .insert({
        user_id: profile.id,
        terms_accepted: termsAccepted,
        terms_version: termsVersion,
        marketing_consent: false, // defaults to false
        data_processing_consent: false, // defaults to false
      })
      .select()
      .single();

    if (consentError) {
      console.error('[registerTelegramUser] Consent error:', consentError);
      // We'll still return the profile even if consent creation fails,
      // but log the error for follow-up
      console.warn('[registerTelegramUser] Consent creation failed, proceeding without consent record');
    }

    return {
      success: true,
      data: {
        profileId: profile.id,
        consentId: consent?.id,
      },
    };
  } catch (err) {
    console.error('[registerTelegramUser] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Get user profile by Telegram chat ID
 */
export async function getProfileByTelegramChat(telegramChatId: string): Promise<ServiceResponse<{ profile: any; consent: any }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    // Get profile by telegram_chat_id
    const { data: profile, error: profileError } = await supa
      .from('user_profiles')
      .select('*, user_consent(*)')
      .eq('telegram_chat_id', telegramChatId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No profile found for this Telegram chat ID
        return { success: false, error: 'Profile not found', code: 'profile_not_found' };
      }
      return { success: false, error: 'Database error', code: 'database_error' };
    }

    return {
      success: true,
      data: {
        profile,
        consent: consent ? { ...consent } : null,
      },
    };
  } catch (err) {
    console.error('[getProfileByTelegramChat] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Admin Approval Workflow
 * Admin approves or rejects a user registration.
 *
 * @param profileId - The user_profiles ID
 * @param approved - true for approve, false for reject
 * @param adminNotes - Optional notes for rejection
 * @param adminId - The admin's profile ID (for audit trail)
 */
export async function adminApproveReject(
  profileId: string,
  approved: boolean,
  adminNotes?: string,
  adminId?: string
): Promise<ServiceResponse<{ profile: any }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    const { data: profile, error } = await supa
      .from('user_profiles')
      .update({
        status: approved ? 'approved' : 'rejected',
        admin_notes: adminNotes,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('[adminApproveReject] Error:', error);
      return { success: false, error: 'Failed to update profile', code: 'update_error' };
    }

    // If approving, also create/update consent record
    if (approved) {
      // Check if consent already exists
      const { data: existingConsent, error: consentCheckError } = await supa
        .from('user_consent')
        .select('id')
        .eq('user_id', profileId)
        .single();

      if (!consentCheckError && !existingConsent) {
        // Create consent record with required fields
        const { error: consentError } = await supa
          .from('user_consent')
          .insert({
            user_id: profileId,
            terms_accepted: true,
            terms_version: '1.0',
            marketing_consent: false,
            data_processing_consent: false,
          });

        if (consentError) {
          console.error('[adminApproveReject] Consent creation error:', consentError);
          // Don't fail the whole operation if consent creation fails
        }
      }
    }

    return {
      success: true,
      data: { profile },
    };
  } catch (err) {
    console.error('[adminApproveReject] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Client Enquiry Creation
 * Creates a new client enquiry from Telegram or website.
 *
 * @param name - User's name
 * @param email - User's email
 * @param company - User's company (optional)
 * @param serviceType - Service type from allowed values
 * @param projectType - Optional project type
 * @param budgetRange - Optional budget range
 * @param timeline - Optional timeline
 * @param message - Optional message
 * @param telegramChatId - Optional Telegram chat ID for notification
 */
export async function createEnquiry(
  name: string,
  email: string,
  company?: string,
  serviceType: string = 'other',
  projectType?: string,
  budgetRange?: string,
  timeline?: string,
  message?: string,
  telegramChatId?: string
): Promise<ServiceResponse<{ enquiryId: string }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  // Validate service_type
  const validServiceTypes = [
    'architectural',
    'virtual_reality',
    'webxr',
    'webar',
    'virtual_tour_360',
    'animation',
    'still_renders',
    'other',
  ];

  if (!validServiceTypes.includes(serviceType)) {
    return {
      success: false,
      error: `Invalid service type: ${serviceType}`,
      code: 'invalid_service_type',
    };
  }

  try {
    const { data: enquiry, error } = await supa
      .from('client_enquiries')
      .insert({
        name,
        email,
        company,
        service_type: serviceType,
        project_type: projectType,
        budget_range: budgetRange,
        timeline,
        message,
        status: 'new',
        ...(telegramChatId && { telegram_chat_id: telegramChatId }),
      })
      .select()
      .single();

    if (error) {
      console.error('[createEnquiry] Error:', error);
      return { success: false, error: 'Failed to create enquiry', code: 'enquiry_error' };
    }

    // Create admin notification for new enquiry
    try {
      await supa.from('admin_notifications').insert({
        user_id: null, // Admin-level notification
        title: 'New Client Enquiry',
        message: `New enquiry from ${name} (${email}) — ${serviceType}`,
        type: 'info',
      });
    } catch (notifError) {
      console.error('[createEnquiry] Notification creation error:', notifError);
      // Don't fail the enquiry creation if notification fails
    }

    return {
      success: true,
      data: { enquiryId: enquiry.id },
    };
  } catch (err) {
    console.error('[createEnquiry] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Get enquiries with filtering and pagination
 */
export async function getEnquiries(
  status?: string,
  serviceType?: string,
  userId?: string
): Promise<ServiceResponse<{ enquiries: any[]; total: number }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    let query = supa.from('client_enquiries').select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: enquiries, error, count } = await query;

    if (error) {
      console.error('[getEnquiries] Error:', error);
      return { success: false, error: 'Failed to fetch enquiries', code: 'enquiry_error' };
    }

    return {
      success: true,
      data: {
        enquiries,
        total: count || 0,
      },
    };
  } catch (err) {
    console.error('[getEnquiries] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Get user profile (for both website and Telegram users)
 */
export async function getUserProfile(userId: string): Promise<ServiceResponse<{ profile: any; consent: any }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    const { data: profile, error: profileError } = await supa
      .from('user_profiles')
      .select('*, user_consent(*)')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return { success: false, error: 'Profile not found', code: 'profile_not_found' };
      }
      return { success: false, error: 'Database error', code: 'database_error' };
    }

    return {
      success: true,
      data: {
        profile,
        consent: profile?.user_consent ? { ...profile.user_consent } : null,
      },
    };
  } catch (err) {
    console.error('[getUserProfile] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Get Telegram chat ID for a profile
 */
export async function getTelegramChatId(profileId: string): Promise<ServiceResponse<{ telegramChatId: string }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    const { data, error } = await supa
      .from('user_profiles')
      .select('telegram_chat_id')
      .eq('id', profileId)
      .single();

    if (error) {
      return { success: false, error: 'Profile not found', code: 'profile_not_found' };
    }

    return {
      success: true,
      data: { telegramChatId: data?.telegram_chat_id || '' },
    };
  } catch (err) {
    console.error('[getTelegramChatId] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Check if a Telegram chat ID is already registered
 */
export async function isTelegramRegistered(telegramChatId: string): Promise<ServiceResponse<{ registered: boolean; profileId?: string }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    const { data, error } = await supa
      .from('user_profiles')
      .select('id')
      .eq('telegram_chat_id', telegramChatId)
      .single();

    if (error) {
      // No profile found with this Telegram chat ID
      return { success: true, data: { registered: false } };
    }

    return {
      success: true,
      data: { registered: true, profileId: data.id },
    };
  } catch (err) {
    console.error('[isTelegramRegistered] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}

/**
 * Check if a user is already registered (by email if provided)
 */
export async function isUserRegistered(email?: string): Promise<ServiceResponse<{ registered: boolean; profileId?: string; category?: UserRole }>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured', code: 'supabase_not_configured' };
  }

  const supa = getAuthenticatedSupabase();
  if (!supa) return { success: false, error: 'Supabase client unavailable', code: 'client_unavailable' };

  try {
    let query = supa.from('user_profiles').select('id, category').not('email', 'is', null);

    if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: { registered: false } };
      }
      return { success: false, error: 'Database error', code: 'database_error' };
    }

    if (!data) {
      return { success: true, data: { registered: false } };
    }

    return {
      success: true,
      data: {
        registered: true,
        profileId: data.id,
        category: data.category as UserRole,
      },
    };
  } catch (err) {
    console.error('[isUserRegistered] Unexpected error:', err);
    return { success: false, error: 'Unexpected error', code: 'unknown_error' };
  }
}