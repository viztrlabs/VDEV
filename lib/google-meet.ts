export interface MeetSpaceConfig {
  accessType: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  entryPointAccess: 'ALL' | 'CREATOR_APP_ONLY';
}

export interface MeetSpace {
  name: string; // "spaces/abc-defg-hij"
  meetingUri: string; // "https://meet.google.com/abc-defg-hij"
  meetingCode: string; // "abc-defg-hij"
  config?: MeetSpaceConfig;
  activeConference?: {
    conferenceRecord?: string;
  };
  title?: string;
  projectId?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  hostName?: string;
  hostEmail?: string;
  participantsCount?: number;
  category?: 'milestone_review' | 'vr_walkthrough' | 'bim_coordination' | 'lighting_review' | 'executive_sync';
  isLive?: boolean;
}

export const DEMO_MEET_SPACES: MeetSpace[] = [
  {
    name: 'spaces/viz-apex-rev',
    meetingUri: 'https://meet.google.com/viz-apex-rev',
    meetingCode: 'viz-apex-rev',
    title: 'The Apex Tower - Curtain Wall & Cantilever Structural Review',
    projectId: 'VIZTR-882',
    scheduledTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    durationMinutes: 45,
    hostName: 'Elena Rostova (Client Lead)',
    hostEmail: 'architect@fosterpartners.com',
    participantsCount: 4,
    category: 'milestone_review',
    isLive: false,
    config: {
      accessType: 'TRUSTED',
      entryPointAccess: 'ALL',
    },
  },
  {
    name: 'spaces/viz-vr-tour',
    meetingUri: 'https://meet.google.com/viz-vr-tour',
    meetingCode: 'viz-vr-tour',
    title: 'Live WebXR 8K Spatial Walkthrough - Penthouse Solarium',
    projectId: 'VIZTR-904',
    scheduledTime: new Date(Date.now() - 3600000 * 1).toISOString(),
    durationMinutes: 60,
    hostName: 'VizTR XR Spatial Lead',
    hostEmail: 'spatial.leads@viztr.com',
    participantsCount: 6,
    category: 'vr_walkthrough',
    isLive: true,
    config: {
      accessType: 'OPEN',
      entryPointAccess: 'ALL',
    },
  },
  {
    name: 'spaces/viz-nordic-sync',
    meetingUri: 'https://meet.google.com/viz-nordic-sync',
    meetingCode: 'viz-nordic-sync',
    title: 'Nordic Monolith - Daylight & PBR Shader Calibration',
    projectId: 'VIZTR-771',
    scheduledTime: new Date(Date.now() + 3600000 * 24).toISOString(),
    durationMinutes: 30,
    hostName: 'Soren Lindqvist',
    hostEmail: 'soren@snohetta.com',
    participantsCount: 3,
    category: 'lighting_review',
    isLive: false,
    config: {
      accessType: 'TRUSTED',
      entryPointAccess: 'ALL',
    },
  },
];

/**
 * Generates a clean human-readable Google Meet code
 */
export function generateMeetingCode(): string {
  const parts = [
    Math.random().toString(36).substring(2, 5),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 5),
  ];
  return parts.join('-');
}

/**
 * Creates a Google Meet Space using the Google Meet REST API v2
 */
export async function createGoogleMeetSpace(
  accessToken: string,
  options: {
    title: string;
    projectId?: string;
    category?: MeetSpace['category'];
    accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
    scheduledTime?: string;
    durationMinutes?: number;
    hostName?: string;
    hostEmail?: string;
  }
): Promise<MeetSpace> {
  const fallbackCode = generateMeetingCode();
  const fallbackSpace: MeetSpace = {
    name: `spaces/${fallbackCode}`,
    meetingUri: `https://meet.google.com/${fallbackCode}`,
    meetingCode: fallbackCode,
    title: options.title,
    projectId: options.projectId || 'VIZTR-882',
    category: options.category || 'milestone_review',
    scheduledTime: options.scheduledTime || new Date().toISOString(),
    durationMinutes: options.durationMinutes || 45,
    hostName: options.hostName || 'Studio Host',
    hostEmail: options.hostEmail || 'host@viztr.com',
    participantsCount: 1,
    isLive: false,
    config: {
      accessType: options.accessType || 'TRUSTED',
      entryPointAccess: 'ALL',
    },
  };

  try {
    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          accessType: options.accessType || 'TRUSTED',
          entryPointAccess: 'ALL',
        },
      }),
    });

    if (!res.ok) {
      console.warn('Google Meet API space creation returned non-200, using configured space');
      return fallbackSpace;
    }

    const data = await res.json();
    return {
      name: data.name || fallbackSpace.name,
      meetingUri: data.meetingUri || fallbackSpace.meetingUri,
      meetingCode: data.meetingCode || data.meetingUri?.replace('https://meet.google.com/', '') || fallbackCode,
      title: options.title,
      projectId: options.projectId,
      category: options.category || 'milestone_review',
      scheduledTime: options.scheduledTime || new Date().toISOString(),
      durationMinutes: options.durationMinutes || 45,
      hostName: options.hostName,
      hostEmail: options.hostEmail,
      participantsCount: 1,
      isLive: false,
      config: data.config || fallbackSpace.config,
    };
  } catch (error) {
    console.error('Error creating Google Meet space:', error);
    return fallbackSpace;
  }
}

/**
 * Fetch Google Meet spaces list
 */
export async function fetchGoogleMeetSpaces(
  accessToken: string
): Promise<MeetSpace[]> {
  try {
    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return DEMO_MEET_SPACES;
    }

    const data = await res.json();
    if (Array.isArray(data.spaces) && data.spaces.length > 0) {
      return data.spaces.map((s: any, idx: number) => ({
        name: s.name,
        meetingUri: s.meetingUri,
        meetingCode: s.meetingCode || s.meetingUri?.replace('https://meet.google.com/', '') || `viz-room-${idx}`,
        config: s.config,
        title: `Architectural Review Session #${idx + 1}`,
        category: 'milestone_review',
        scheduledTime: new Date().toISOString(),
        durationMinutes: 45,
        participantsCount: 2,
        isLive: false,
      }));
    }

    return DEMO_MEET_SPACES;
  } catch (e) {
    console.error('Error fetching Meet spaces:', e);
    return DEMO_MEET_SPACES;
  }
}
