/**
 * POST /api/user/register
 * Register a new user via Telegram bot or website.
 * 
 * This endpoint is called from:
 * - Telegram bot (via webhook or polling)
 * - Website registration form
 * 
 * Requires: body { telegramChatId, category, name, email?, termsAccepted?, termsVersion? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerTelegramUser, isTelegramRegistered, isUserRegistered } from '@/lib/telegram-services';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizeUserRole, type UserRole } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// Allowed categories for registration
const VALID_CATEGORIES: UserRole[] = [
  'client',
  'architect',
  '3d_artist',
  'freelancer',
  'learner',
  'technology_enthusiast',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramChatId, category, name, email, termsAccepted = false, termsVersion = '1.0' } = body;

    // Validate required fields
    if (!telegramChatId) {
      return NextResponse.json(
        { success: false, error: 'telegramChatId is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'category is required' },
        { status: 400 }
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category: ${category}. Valid categories: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if Telegram chat ID is already registered
    const registeredCheck = await isTelegramRegistered(telegramChatId);
    if (registeredCheck.success && registeredCheck.data?.registered) {
      return NextResponse.json(
        {
          success: false,
          error: 'This Telegram account is already registered',
          profileId: registeredCheck.data.profileId,
        },
        { status: 409 }
      );
    }

    // Check if email is already registered (if provided)
    if (email) {
      const emailCheck = await isUserRegistered(email);
      if (emailCheck.success && emailCheck.data?.registered) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email already exists',
            profileId: emailCheck.data.profileId,
          },
          { status: 409 }
        );
      }
    }

    // Register the user
    const result = await registerTelegramUser(
      telegramChatId,
      category,
      name,
      email,
      termsAccepted,
      termsVersion
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Registration failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profileId: result.data?.profileId,
        consentId: result.data?.consentId,
        message: 'Registration submitted. Awaiting admin approval.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[register] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Check registration status for a Telegram chat ID
  const { searchParams } = new URL(req.url);
  const telegramChatId = searchParams.get('telegramChatId');

  if (!telegramChatId) {
    return NextResponse.json(
      { success: false, error: 'telegramChatId is required' },
      { status: 400 }
    );
  }

  try {
    const result = await isTelegramRegistered(telegramChatId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Check failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registered: result.data?.registered || false,
      profileId: result.data?.profileId,
    });
  } catch (error: any) {
    console.error('[register:GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}