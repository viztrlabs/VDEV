/**
 * GET/PUT /api/user/profile
 * Get or update user profile
 * 
 * GET: Returns the authenticated user's profile and consent record
 * PUT: Updates the user's profile (category, company, bio, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-guard';
import { getAuthenticatedSupabase } from '@/lib/telegram-services';
import { normalizeUserRole, type UserRole } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const userId = guard.userId;
  const supa = getAuthenticatedSupabase();

  if (!supa) {
    return NextResponse.json(
      { success: false, error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    // Get user profile with consent
    const { data: profile, error: profileError } = await supa
      .from('user_profiles')
      .select('*, user_consent(*)')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Profile not found. Use /register to create one.',
            registered: false,
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Database error', code: profileError.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
      consent: profile.user_consent ? { ...profile.user_consent } : null,
    });
  } catch (error: any) {
    console.error('[profile:GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAuth(req);
  if (guard.error) return guard.error;

  const userId = guard.userId;
  const supa = getAuthenticatedSupabase();

  if (!supa) {
    return NextResponse.json(
      { success: false, error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { category, bio, company, location, website, portfolio_url, experience_level } = body;

    // Validate category if provided
    if (category && !['client', 'architect', '3d_artist', 'freelancer', 'learner', 'technology_enthusiast'].includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category: ${category}` },
        { status: 400 }
      );
    }

    // Validate experience_level if provided
    if (experience_level && !['beginner', 'intermediate', 'advanced', 'expert'].includes(experience_level)) {
      return NextResponse.json(
        { success: false, error: `Invalid experience level: ${experience_level}` },
        { status: 400 }
      );
    }

    // Update profile
    const { data: profile, error } = await supa
      .from('user_profiles')
      .update({
        ...(category && { category }),
        ...(bio !== undefined && { bio }),
        ...(company !== undefined && { company }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(portfolio_url !== undefined && { portfolio_url }),
        ...(experience_level && { experience_level }),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[profile:PUT] Update error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile', code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('[profile:PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}