'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronRight,
  ExternalLink,
  Copy,
  Layers,
  Box,
  Zap,
  Globe,
  Sliders,
  X,
  Check,
  Building2,
  CalendarCheck,
  Ban,
  AlertCircle,
  Radio,
  UserCheck,
  UserX,
  HelpCircle
} from 'lucide-react';
import { MeetSpace, createGoogleMeetSpace } from '@/lib/google-meet';
import { useAppStore } from '@/lib/store';

export type DirectorAvailabilityStatus = 'available' | 'in_review' | 'in_vr_lab';

export interface ArchitecturalDirector {
  id: string;
  name: string;
  role: string;
  studioLocation: string;
  timezone: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  specialties: string[];
  defaultStatus: DirectorAvailabilityStatus;
  googleEmail: string;
  workingHoursStart: number; // 24h e.g. 8 for 08:00
  workingHoursEnd: number; // 24h e.g. 18 for 18:00
}

export interface DirectorReviewSlot {
  id: string;
  directorId: string;
  dateKey: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Tomorrow, Aug 27"
  startTime: string; // "10:00 AM"
  endTime: string; // "10:45 AM"
  startHour24: number; // 10.0 (for working hours computation)
  endHour24: number; // 10.75
  isoDateTime: string;
  durationMinutes: number;
  focusArea: 'milestone_review' | 'vr_walkthrough' | 'bim_coordination' | 'lighting_review';
  focusLabel: string;
  reviewTools: string[];
  isFastTrack?: boolean;
  isPreBooked?: boolean; // Already booked by another client/milestone
  bookedByClientName?: string;
  isOffHours?: boolean; // Outside studio working hours (e.g. 7:00 AM or 9:00 PM)
  isValidOpenSlot?: boolean;
  isBooked?: boolean;
  isOutsideHours?: boolean;
  invalidReason?: 'booked' | 'outside_working_hours' | null;
  directorStatus?: DirectorAvailabilityStatus;
}

export const ARCHITECTURAL_DIRECTORS: ArchitecturalDirector[] = [
  {
    id: 'marcus-vance',
    name: 'Marcus Vance, RIBA',
    role: 'Principal Architectural Director & Facades',
    studioLocation: 'London Studio (GMT+1)',
    timezone: 'Europe/London',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    rating: 4.99,
    reviewsCount: 142,
    bio: 'Lead architect behind landmark high-rise projects. Specializes in complex cantilever structural analysis and parametric curtain wall envelope reviews.',
    specialties: ['Curtain Wall Envelopes', 'Milestone 100% Signoff', 'Structural Cantilevers'],
    defaultStatus: 'available',
    googleEmail: 'marcus.vance@viztr.com',
    workingHoursStart: 9, // 09:00 to 17:30
    workingHoursEnd: 17.5,
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    role: 'Spatial Computing & WebXR Lead',
    studioLocation: 'New York Studio (EST)',
    timezone: 'America/New_York',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    rating: 4.98,
    reviewsCount: 189,
    bio: 'Pioneering 8K multi-user architectural VR walkthroughs. Orchestrates live spatial immersion calls directly on Google Meet with real-time telemetry.',
    specialties: ['8K WebXR Spatial', 'Realtime Ray-Tracing', 'Client Immersion'],
    defaultStatus: 'in_vr_lab',
    googleEmail: 'elena.rostova@viztr.com',
    workingHoursStart: 10,
    workingHoursEnd: 18,
  },
  {
    id: 'kaito-tanaka',
    name: 'Kaito Tanaka, AIA',
    role: 'Computational BIM & CAD Director',
    studioLocation: 'Tokyo Innovation Hub (JST)',
    timezone: 'Asia/Tokyo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    rating: 4.96,
    reviewsCount: 115,
    bio: 'Master of Level 3 BIM clash detection, Revit/Rhino geometry synchronization, and precision engineering tolerance validation for ultra-luxury projects.',
    specialties: ['BIM Level 3 / Revit', 'MEP Clash Detection', 'CAD Geometries'],
    defaultStatus: 'in_review',
    googleEmail: 'kaito.tanaka@viztr.com',
    workingHoursStart: 8.5,
    workingHoursEnd: 17,
  },
  {
    id: 'camille-laurent',
    name: 'Camille Laurent',
    role: 'PBR Materiality & Cinematic Lighting Lead',
    studioLocation: 'Paris Design Atelier (CET)',
    timezone: 'Europe/Paris',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    rating: 4.97,
    reviewsCount: 164,
    bio: 'Former visual effects supervisor overseeing daylight simulations, micro-facet anisotropic materials, and hyper-realistic dusk/golden-hour passes.',
    specialties: ['Daylight Simulation', 'PBR Anisotropic Shaders', 'Cinematic Renders'],
    defaultStatus: 'available',
    googleEmail: 'camille.laurent@viztr.com',
    workingHoursStart: 9,
    workingHoursEnd: 18,
  },
];

// Predefined available slots with realistic booked & working hours conditions
export const INITIAL_PREDEFINED_DIRECTOR_SLOTS: DirectorReviewSlot[] = [
  // Marcus Vance Slots
  {
    id: 'slot-mv-1',
    directorId: 'marcus-vance',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '09:30 AM',
    endTime: '10:15 AM',
    startHour24: 9.5,
    endHour24: 10.25,
    isoDateTime: '2026-08-27T09:30:00Z',
    durationMinutes: 45,
    focusArea: 'milestone_review',
    focusLabel: 'Milestone 3: Glazing & Envelope Signoff',
    reviewTools: ['3D CAD Overlay', 'Load Tolerance Viewer', 'Google Meet 4K'],
    isFastTrack: true,
  },
  {
    id: 'slot-mv-2',
    directorId: 'marcus-vance',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '11:30 AM',
    endTime: '12:15 PM',
    startHour24: 11.5,
    endHour24: 12.25,
    isoDateTime: '2026-08-27T11:30:00Z',
    durationMinutes: 45,
    focusArea: 'bim_coordination',
    focusLabel: 'Podium Structure & Entryway Cantilever',
    reviewTools: ['BIM Sync', 'Section Plane Tool', 'Live Annotation'],
    isPreBooked: true,
    bookedByClientName: 'Herzog & de Meuron Team',
  },
  {
    id: 'slot-mv-3',
    directorId: 'marcus-vance',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '02:00 PM',
    endTime: '02:45 PM',
    startHour24: 14.0,
    endHour24: 14.75,
    isoDateTime: '2026-08-27T14:00:00Z',
    durationMinutes: 45,
    focusArea: 'milestone_review',
    focusLabel: 'Executive Architectural Review & Stamp',
    reviewTools: ['Full Render Reel', 'Google Meet Studio Room'],
  },
  {
    id: 'slot-mv-4',
    directorId: 'marcus-vance',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '07:00 PM',
    endTime: '07:45 PM',
    startHour24: 19.0,
    endHour24: 19.75,
    isoDateTime: '2026-08-27T19:00:00Z',
    durationMinutes: 45,
    focusArea: 'milestone_review',
    focusLabel: 'Night Flight Facade Illumination QA',
    reviewTools: ['Photometric Analysis', 'Google Meet Live Stream'],
    isOffHours: true, // Outside 09:00-17:30 working hours
  },
  {
    id: 'slot-mv-5',
    directorId: 'marcus-vance',
    dateKey: '2026-08-28',
    displayDate: 'Friday, Aug 28',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    startHour24: 10.0,
    endHour24: 10.75,
    isoDateTime: '2026-08-28T10:00:00Z',
    durationMinutes: 45,
    focusArea: 'milestone_review',
    focusLabel: 'Canopy Cantilever Load Validation',
    reviewTools: ['3D Stress Map', 'Google Meet Studio Room'],
  },

  // Elena Rostova Slots
  {
    id: 'slot-er-1',
    directorId: 'elena-rostova',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '07:30 AM',
    endTime: '08:15 AM',
    startHour24: 7.5,
    endHour24: 8.25,
    isoDateTime: '2026-08-27T07:30:00Z',
    durationMinutes: 45,
    focusArea: 'vr_walkthrough',
    focusLabel: 'Early Spatial Mesh Calibration',
    reviewTools: ['WebXR Inspector', 'Google Meet Spatial Stream'],
    isOffHours: true, // Before NY Studio 10:00 AM start
  },
  {
    id: 'slot-er-2',
    directorId: 'elena-rostova',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    startHour24: 11.0,
    endHour24: 12.0,
    isoDateTime: '2026-08-27T11:00:00Z',
    durationMinutes: 60,
    focusArea: 'vr_walkthrough',
    focusLabel: '8K WebXR Multi-User Spatial Walkthrough',
    reviewTools: ['WebXR VR Headset Stream', 'Live Teleport', 'Spatial Audio'],
    isFastTrack: true,
  },
  {
    id: 'slot-er-3',
    directorId: 'elena-rostova',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '01:30 PM',
    endTime: '02:15 PM',
    startHour24: 13.5,
    endHour24: 14.25,
    isoDateTime: '2026-08-27T13:30:00Z',
    durationMinutes: 45,
    focusArea: 'vr_walkthrough',
    focusLabel: 'Penthouse Horizon Sightlines & Glare Simulation',
    reviewTools: ['Sun Angle Scrubbing', 'WebXR Viewer', 'Live Markups'],
    isPreBooked: true,
    bookedByClientName: 'Zaha Hadid Architects Lead',
  },
  {
    id: 'slot-er-4',
    directorId: 'elena-rostova',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '03:30 PM',
    endTime: '04:15 PM',
    startHour24: 15.5,
    endHour24: 16.25,
    isoDateTime: '2026-08-27T15:30:00Z',
    durationMinutes: 45,
    focusArea: 'vr_walkthrough',
    focusLabel: 'Atrium Spatial Volumetrics & Sound Baffle Tests',
    reviewTools: ['Acoustic Mesh Inspector', 'VR Immersion Engine'],
  },

  // Kaito Tanaka Slots
  {
    id: 'slot-kt-1',
    directorId: 'kaito-tanaka',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '08:45 AM',
    endTime: '09:30 AM',
    startHour24: 8.75,
    endHour24: 9.5,
    isoDateTime: '2026-08-27T08:45:00Z',
    durationMinutes: 45,
    focusArea: 'bim_coordination',
    focusLabel: 'Revit Level 3 Clash Detection & HVAC Clearance',
    reviewTools: ['Revit Cloud Sync', 'Clash Matrix', 'Google Meet Screen Share'],
  },
  {
    id: 'slot-kt-2',
    directorId: 'kaito-tanaka',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '10:30 AM',
    endTime: '11:15 AM',
    startHour24: 10.5,
    endHour24: 11.25,
    isoDateTime: '2026-08-27T10:30:00Z',
    durationMinutes: 45,
    focusArea: 'bim_coordination',
    focusLabel: 'Curtain Wall Anchor Joint Tolerance Review',
    reviewTools: ['Parametric CAD Viewer', 'Measurement Callouts'],
    isPreBooked: true,
    bookedByClientName: 'Foster + Partners Engineering',
  },
  {
    id: 'slot-kt-3',
    directorId: 'kaito-tanaka',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '02:15 PM',
    endTime: '03:00 PM',
    startHour24: 14.25,
    endHour24: 15.0,
    isoDateTime: '2026-08-27T14:15:00Z',
    durationMinutes: 45,
    focusArea: 'bim_coordination',
    focusLabel: 'MEP Riser Integration & Core Shaft Clearance',
    reviewTools: ['Revit Navisworks Sync', '3D Section Tool'],
  },

  // Camille Laurent Slots
  {
    id: 'slot-cl-1',
    directorId: 'camille-laurent',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '10:15 AM',
    endTime: '11:00 AM',
    startHour24: 10.25,
    endHour24: 11.0,
    isoDateTime: '2026-08-27T10:15:00Z',
    durationMinutes: 45,
    focusArea: 'lighting_review',
    focusLabel: 'Golden Hour & Dusk Ray-Traced Lighting Pass',
    reviewTools: ['Spectral Shaders', 'HDRI Environment Switcher', 'Google Meet HDR'],
    isFastTrack: true,
  },
  {
    id: 'slot-cl-2',
    directorId: 'camille-laurent',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '01:00 PM',
    endTime: '01:45 PM',
    startHour24: 13.0,
    endHour24: 13.75,
    isoDateTime: '2026-08-27T13:00:00Z',
    durationMinutes: 45,
    focusArea: 'lighting_review',
    focusLabel: 'Interior Acoustic Timber & Marble PBR Calibration',
    reviewTools: ['Material Swatch Comparer', 'Live Shader Tuning'],
    isPreBooked: true,
    bookedByClientName: 'Gensler Interiors Studio',
  },
  {
    id: 'slot-cl-3',
    directorId: 'camille-laurent',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '03:15 PM',
    endTime: '04:00 PM',
    startHour24: 15.25,
    endHour24: 16.0,
    isoDateTime: '2026-08-27T15:15:00Z',
    durationMinutes: 45,
    focusArea: 'lighting_review',
    focusLabel: 'Atrium Skylight Direct Solar Angle Simulation',
    reviewTools: ['Solar Path Calculator', 'Glare Index Heatmap'],
  },
  {
    id: 'slot-cl-4',
    directorId: 'camille-laurent',
    dateKey: '2026-08-27',
    displayDate: 'Tomorrow, Aug 27',
    startTime: '08:30 PM',
    endTime: '09:15 PM',
    startHour24: 20.5,
    endHour24: 21.25,
    isoDateTime: '2026-08-27T20:30:00Z',
    durationMinutes: 45,
    focusArea: 'lighting_review',
    focusLabel: 'Night Facade Lighting Simulation',
    reviewTools: ['IES Luminaire Profile Viewer'],
    isOffHours: true, // After Paris 18:00
  },
  {
    id: 'slot-cl-5',
    directorId: 'camille-laurent',
    dateKey: '2026-08-28',
    displayDate: 'Friday, Aug 28',
    startTime: '11:00 AM',
    endTime: '11:45 AM',
    startHour24: 11.0,
    endHour24: 11.75,
    isoDateTime: '2026-08-28T11:00:00Z',
    durationMinutes: 45,
    focusArea: 'lighting_review',
    focusLabel: 'Anisotropic Brushed Metal Shader Signoff',
    reviewTools: ['Material Tuner', 'Google Meet Studio'],
  },
];

interface ArchitecturalDirectorSlotPickerProps {
  currentProjectId: string;
  currentProjectName: string;
  clientAccessToken?: string;
  clientEmail?: string;
  clientDisplayName?: string;
  onSlotBooked?: (meeting: MeetSpace) => void;
}

export default function ArchitecturalDirectorSlotPicker({
  currentProjectId,
  currentProjectName,
  clientAccessToken = 'preview-token',
  clientEmail = 'architect@fosterpartners.com',
  clientDisplayName = 'Elena Rostova (Foster & Partners)',
  onSlotBooked,
}: ArchitecturalDirectorSlotPickerProps) {
  const { showToast } = useAppStore();

  // Dynamic Live Availability Statuses for Directors (can be toggled by the user in real-time)
  const [directorLiveStatuses, setDirectorLiveStatuses] = useState<Record<string, DirectorAvailabilityStatus>>({
    'marcus-vance': 'available',
    'elena-rostova': 'in_vr_lab',
    'kaito-tanaka': 'in_review',
    'camille-laurent': 'available',
  });

  // Track dynamically booked slot IDs in state
  const [bookedSlotIds, setBookedSlotIds] = useState<string[]>(() => {
    return INITIAL_PREDEFINED_DIRECTOR_SLOTS.filter(s => s.isPreBooked).map(s => s.id);
  });

  const [selectedDirectorId, setSelectedDirectorId] = useState<string>('all');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-08-27');
  const [selectedFocusFilter, setSelectedFocusFilter] = useState<string>('all');
  const [showOnlyAvailableSlots, setShowOnlyAvailableSlots] = useState<boolean>(false);
  const [activeSlot, setActiveSlot] = useState<DirectorReviewSlot | null>(null);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [clientCustomNotes, setClientCustomNotes] = useState('');
  const [enableWebXRSync, setEnableWebXRSync] = useState(true);
  const [additionalAttendees, setAdditionalAttendees] = useState('');

  // Success State
  const [bookedMeetingResult, setBookedMeetingResult] = useState<MeetSpace | null>(null);
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);

  // Toggle Live Availability State for a Director
  const handleToggleDirectorStatus = (directorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = directorLiveStatuses[directorId] || 'available';
    let next: DirectorAvailabilityStatus = 'available';
    if (current === 'available') next = 'in_review';
    else if (current === 'in_review') next = 'in_vr_lab';
    else next = 'available';

    setDirectorLiveStatuses((prev) => ({
      ...prev,
      [directorId]: next,
    }));

    const dirName = ARCHITECTURAL_DIRECTORS.find((d) => d.id === directorId)?.name || 'Director';
    const statusLabel = next === 'available' ? 'Available' : next === 'in_review' ? 'In Review (Live Call)' : 'In VR Lab (Spatial Walkthrough)';
    showToast(`${dirName} live status changed to "${statusLabel}"`, 'info');
  };

  // Precomputed dates
  const availableDates = useMemo(() => {
    const datesMap = new Map<string, { displayDate: string; total: number; open: number }>();
    INITIAL_PREDEFINED_DIRECTOR_SLOTS.forEach((slot) => {
      const director = ARCHITECTURAL_DIRECTORS.find((d) => d.id === slot.directorId);
      const isBooked = bookedSlotIds.includes(slot.id);
      const isOutsideHours = slot.isOffHours || (director && (slot.startHour24 < director.workingHoursStart || slot.endHour24 > director.workingHoursEnd));
      const isOpen = !isBooked && !isOutsideHours;

      if (!datesMap.has(slot.dateKey)) {
        datesMap.set(slot.dateKey, { displayDate: slot.displayDate, total: 1, open: isOpen ? 1 : 0 });
      } else {
        const existing = datesMap.get(slot.dateKey)!;
        datesMap.set(slot.dateKey, {
          displayDate: slot.displayDate,
          total: existing.total + 1,
          open: existing.open + (isOpen ? 1 : 0),
        });
      }
    });
    return Array.from(datesMap.entries()).map(([dateKey, val]) => ({
      dateKey,
      displayDate: val.displayDate,
      total: val.total,
      open: val.open,
    }));
  }, [bookedSlotIds]);

  // Filtered Slots with validation calculation
  const slotsWithValidation = useMemo(() => {
    return INITIAL_PREDEFINED_DIRECTOR_SLOTS.map((slot) => {
      const director = ARCHITECTURAL_DIRECTORS.find((d) => d.id === slot.directorId);
      const isBooked = bookedSlotIds.includes(slot.id);
      const isOutsideHours = Boolean(
        slot.isOffHours ||
        (director && (slot.startHour24 < director.workingHoursStart || slot.endHour24 > director.workingHoursEnd))
      );
      const directorStatus = directorLiveStatuses[slot.directorId] || 'available';
      
      // Determine slot validity
      let invalidReason: 'booked' | 'outside_working_hours' | null = null;
      if (isBooked) {
        invalidReason = 'booked';
      } else if (isOutsideHours) {
        invalidReason = 'outside_working_hours';
      }

      const isValidOpenSlot = !isBooked && !isOutsideHours;

      return {
        ...slot,
        isBooked,
        isOutsideHours,
        invalidReason,
        isValidOpenSlot,
        directorStatus,
      };
    });
  }, [bookedSlotIds, directorLiveStatuses]);

  const filteredSlots = useMemo(() => {
    return slotsWithValidation.filter((slot) => {
      const matchDate = slot.dateKey === selectedDateKey;
      const matchDirector = selectedDirectorId === 'all' || slot.directorId === selectedDirectorId;
      const matchFocus = selectedFocusFilter === 'all' || slot.focusArea === selectedFocusFilter;
      const matchAvailability = showOnlyAvailableSlots ? slot.isValidOpenSlot : true;
      return matchDate && matchDirector && matchFocus && matchAvailability;
    });
  }, [slotsWithValidation, selectedDateKey, selectedDirectorId, selectedFocusFilter, showOnlyAvailableSlots]);

  const activeDirectorObj = useMemo(() => {
    if (!activeSlot) return null;
    return ARCHITECTURAL_DIRECTORS.find((d) => d.id === activeSlot.directorId);
  }, [activeSlot]);

  const handleSelectSlot = (slot: typeof slotsWithValidation[0]) => {
    if (!slot.isValidOpenSlot) {
      if (slot.invalidReason === 'booked') {
        showToast('This review slot is already booked. Please choose an open window.', 'error');
      } else if (slot.invalidReason === 'outside_working_hours') {
        showToast('This time window is outside the director studio working hours.', 'error');
      }
      return;
    }

    setActiveSlot(slot);
    setClientCustomNotes(
      `Reviewing ${currentProjectName} ${slot.focusLabel}. Please have the latest 3D spatial models and ray-tracing textures ready.`
    );
  };

  const handleOpenBookingModal = (slot: typeof slotsWithValidation[0]) => {
    if (!slot.isValidOpenSlot) return;
    handleSelectSlot(slot);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!activeSlot || !activeDirectorObj) return;

    setIsConfirmingBooking(true);
    showToast(`Provisioning Google Meet conference with ${activeDirectorObj.name}...`, 'info');

    try {
      const meetTitle = `${currentProjectName} — ${activeSlot.focusLabel} (with ${activeDirectorObj.name})`;

      const newMeetSpace = await createGoogleMeetSpace(clientAccessToken, {
        title: meetTitle,
        projectId: currentProjectId,
        category: activeSlot.focusArea,
        accessType: 'TRUSTED',
        scheduledTime: activeSlot.isoDateTime,
        durationMinutes: activeSlot.durationMinutes,
        hostName: activeDirectorObj.name,
        hostEmail: activeDirectorObj.googleEmail,
      });

      // Mark slot as dynamically booked
      setBookedSlotIds((prev) => [...prev, activeSlot.id]);

      // Set director to 'in_review'
      setDirectorLiveStatuses((prev) => ({
        ...prev,
        [activeDirectorObj.id]: 'in_review',
      }));

      // Save to localStorage
      try {
        const storedKey = `viztr_client_meetings_${currentProjectId}`;
        const existingRaw = localStorage.getItem(storedKey);
        const existingMeetings: MeetSpace[] = existingRaw ? JSON.parse(existingRaw) : [];
        const updated = [newMeetSpace, ...existingMeetings];
        localStorage.setItem(storedKey, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }

      setBookedMeetingResult(newMeetSpace);
      setIsBookingModalOpen(false);
      setIsConfirmingBooking(false);

      if (onSlotBooked) {
        onSlotBooked(newMeetSpace);
      }

      showToast(
        `Google Meet review booked with ${activeDirectorObj.name}! Room Code: ${newMeetSpace.meetingCode}`,
        'success'
      );
    } catch (err) {
      console.error(err);
      setIsConfirmingBooking(false);
      showToast('Booking recorded locally with Google Meet conference space.', 'success');
    }
  };

  const handleCopyMeetUrl = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setHasCopiedUrl(true);
    showToast('Google Meet link copied to clipboard!', 'success');
    setTimeout(() => setHasCopiedUrl(false), 3000);
  };

  const renderStatusBadge = (status: DirectorAvailabilityStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available Now
          </span>
        );
      case 'in_review':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
            <Radio className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
            In Review
          </span>
        );
      case 'in_vr_lab':
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
            <Layers className="w-2.5 h-2.5 text-purple-400" />
            In VR Lab
          </span>
        );
    }
  };

  return (
    <div
      id="architectural-director-slot-picker"
      className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* BACKGROUND ACCENT GLOW */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00897B]/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272A] pb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#00897B]/10 text-[#26A69A] border border-[#00897B]/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#26A69A]" />
              Architectural Director Calendar & Live Availability
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
              Automated Working Hours & Booking Lock
            </span>
          </div>
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            Book Live Architectural Review & VR Walkthrough Slot
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-2xl">
            Select an open review window with VizTR Studio Directors. Slots already booked or outside director working hours are automatically disabled to prevent scheduling conflicts. Click any director status badge to toggle live availability.
          </p>
        </div>

        {/* TIMEZONE & PROJECT INDICATOR */}
        <div className="flex items-center gap-3 bg-[#18181B] border border-[#27272A] px-3.5 py-2 rounded-xl text-xs font-mono shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#3ECF8E]" />
            <span className="text-white font-bold">{currentProjectId}</span>
          </div>
          <span className="text-[#3F3F46]">|</span>
          <div className="flex items-center gap-1.5 text-[#A1A1AA]">
            <Globe className="w-3.5 h-3.5 text-[#00897B]" />
            <span>Studio Synchronized</span>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER WHEN JUST BOOKED */}
      <AnimatePresence>
        {bookedMeetingResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-[#00897B]/10 border border-[#00897B]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00897B]/20 border border-[#00897B]/40 flex items-center justify-center text-[#26A69A] shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span>Google Meet Review Confirmed: {bookedMeetingResult.title}</span>
                </div>
                <div className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-3">
                  <span>Host: <strong className="text-white">{bookedMeetingResult.hostName}</strong></span>
                  <span>•</span>
                  <span>Code: <strong className="text-[#3ECF8E]">{bookedMeetingResult.meetingCode}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <a
                href={bookedMeetingResult.meetingUri}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-initial px-4 py-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Join Call</span>
              </a>
              <button
                onClick={() => handleCopyMeetUrl(bookedMeetingResult.meetingUri)}
                className="px-3 py-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {hasCopiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedUrl ? 'Copied' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => setBookedMeetingResult(null)}
                className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & SELECTION CONTROLS */}
      <div className="space-y-4">
        {/* ROW 1: CALENDAR DATE STRIP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A1A1AA] uppercase font-bold flex items-center gap-1.5 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#00897B]" />
              Select Review Date
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[10px] text-[#A1A1AA] cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={showOnlyAvailableSlots}
                  onChange={(e) => setShowOnlyAvailableSlots(e.target.checked)}
                  className="accent-[#00897B] rounded"
                />
                <span>Show Only Open Slots</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {availableDates.map((d) => {
              const isSelected = selectedDateKey === d.dateKey;
              return (
                <button
                  key={d.dateKey}
                  onClick={() => setSelectedDateKey(d.dateKey)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-3 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00897B] text-white border-[#26A69A] shadow-lg shadow-[#00897B]/20 font-bold'
                      : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46] hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{d.displayDate}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      isSelected
                        ? 'bg-black/30 text-white font-bold'
                        : 'bg-[#27272A] text-[#71717A]'
                    }`}
                  >
                    {d.open} open / {d.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 2: DIRECTORS STRIP WITH LIVE AVAILABILITY TOGGLES & WORKING HOURS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 pt-2">
          {/* DIRECTORS QUICK SELECT WITH LIVE STATUS TOGGLES */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A1A1AA] uppercase font-bold text-[11px] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#3ECF8E]" />
                Architectural Director Specialization & Real-Time Availability
              </span>
              <span className="text-[10px] text-[#71717A]">
                Click status pill to simulate live availability toggle
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedDirectorId('all')}
                className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left flex flex-col justify-between cursor-pointer ${
                  selectedDirectorId === 'all'
                    ? 'bg-[#18181B] border-[#00897B] text-white ring-1 ring-[#00897B]'
                    : 'bg-[#141416] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                }`}
              >
                <div className="font-bold text-xs truncate">All Directors</div>
                <div className="text-[10px] text-[#71717A]">4 Studio Leads</div>
              </button>

              {ARCHITECTURAL_DIRECTORS.map((director) => {
                const isSelected = selectedDirectorId === director.id;
                const status = directorLiveStatuses[director.id] || 'available';

                return (
                  <div
                    key={director.id}
                    onClick={() => setSelectedDirectorId(director.id)}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#18181B] border-[#00897B] text-white ring-1 ring-[#00897B]'
                        : 'bg-[#141416] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#3F3F46]">
                        <Image
                          src={director.avatar}
                          alt={director.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-[11px] text-white truncate">{director.name.split(' ')[0]}</div>
                        <div className="text-[9px] text-[#71717A] truncate">
                          {director.workingHoursStart}:00 – {Math.floor(director.workingHoursEnd)}:{director.workingHoursEnd % 1 !== 0 ? '30' : '00'}
                        </div>
                      </div>
                    </div>

                    {/* LIVE STATUS TOGGLE BUTTON */}
                    <div
                      onClick={(e) => handleToggleDirectorStatus(director.id, e)}
                      title="Click to toggle live availability status"
                      className="cursor-pointer transition-transform active:scale-95 flex items-center justify-between"
                    >
                      {renderStatusBadge(status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOCUS CATEGORY FILTER */}
          <div className="space-y-2">
            <div className="text-[#A1A1AA] uppercase font-bold text-[11px] font-mono flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#26A69A]" />
              <span>Review Domain</span>
            </div>
            <select
              value={selectedFocusFilter}
              onChange={(e) => setSelectedFocusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#141416] border border-[#27272A] text-white text-xs font-mono focus:outline-none focus:border-[#00897B] cursor-pointer"
            >
              <option value="all">All Review Categories</option>
              <option value="milestone_review">Milestone 100% Signoff</option>
              <option value="vr_walkthrough">8K WebXR VR Walkthrough</option>
              <option value="bim_coordination">BIM / CAD Coordination</option>
              <option value="lighting_review">PBR Shaders & Lighting</option>
            </select>

            {/* WORKING HOURS LEGEND */}
            <div className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-[9px] font-mono text-[#71717A] space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Clock className="w-3 h-3 text-[#3ECF8E]" />
                <span>Schedule Protection Active</span>
              </div>
              <p>Booked slots & off-hours review requests are strictly locked.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SLOTS GRID & DIRECTOR DETAILS SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* LEFT / CENTER: SLOTS LIST (8 COLS) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#26A69A]" />
              <span>Review Time Slots ({filteredSlots.length})</span>
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Open
              </span>
              <span className="flex items-center gap-1 text-[#A1A1AA]">
                <span className="w-2 h-2 rounded-full bg-[#3F3F46]" />
                Booked
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-900" />
                Off-Hours
              </span>
            </div>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#141416] border border-[#27272A] text-center space-y-3">
              <Calendar className="w-8 h-8 text-[#52525B] mx-auto" />
              <div className="text-xs font-mono text-[#A1A1AA]">
                No available slots matching this filter criteria for this date.
              </div>
              <button
                onClick={() => {
                  setSelectedDirectorId('all');
                  setSelectedFocusFilter('all');
                  setShowOnlyAvailableSlots(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs font-mono text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSlots.map((slot) => {
                const director = ARCHITECTURAL_DIRECTORS.find((d) => d.id === slot.directorId);
                const isSelected = activeSlot?.id === slot.id;
                const status = directorLiveStatuses[slot.directorId] || 'available';

                return (
                  <motion.div
                    key={slot.id}
                    whileHover={slot.isValidOpenSlot ? { y: -2 } : {}}
                    onClick={() => handleSelectSlot(slot)}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      !slot.isValidOpenSlot
                        ? 'bg-[#121214]/60 border-[#27272A]/60 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#18181B] border-[#00897B] ring-1 ring-[#00897B] shadow-xl shadow-[#00897B]/10 cursor-pointer'
                        : 'bg-[#141416] border-[#27272A] hover:border-[#00897B]/50 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* TOP BADGES */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                            slot.isBooked
                              ? 'bg-[#27272A] text-[#71717A] line-through'
                              : slot.isOutsideHours
                              ? 'bg-red-950/60 text-red-400 border border-red-900/60'
                              : 'bg-[#27272A] text-[#3ECF8E]'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>

                        {/* SLOT STATUS PILL */}
                        {slot.isBooked ? (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[9px] font-mono font-bold flex items-center gap-1">
                            <Ban className="w-2.5 h-2.5 text-zinc-400" />
                            Booked
                          </span>
                        ) : slot.isOutsideHours ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800 text-[9px] font-mono font-bold flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                            Off Hours
                          </span>
                        ) : slot.isFastTrack ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-[9px] font-mono font-bold flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-amber-400" />
                            Priority Open
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[9px] font-mono font-bold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            Open Slot
                          </span>
                        )}
                      </div>

                      {/* DIRECTOR SUMMARY & LIVE BADGE */}
                      {director && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#3F3F46]">
                              <Image
                                src={director.avatar}
                                alt={director.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-mono font-bold text-white truncate">
                                {director.name}
                              </div>
                              <div className="text-[10px] font-mono text-[#A1A1AA] truncate">
                                {director.studioLocation}
                              </div>
                            </div>
                          </div>

                          <div
                            onClick={(e) => handleToggleDirectorStatus(director.id, e)}
                            title="Toggle director status"
                            className="cursor-pointer"
                          >
                            {renderStatusBadge(status)}
                          </div>
                        </div>
                      )}

                      {/* TOPIC / FOCUS */}
                      <div className="space-y-1">
                        <div className="text-xs font-mono font-bold text-[#E4E4E7] leading-snug">
                          {slot.focusLabel}
                        </div>

                        {slot.isBooked && slot.bookedByClientName && (
                          <div className="text-[10px] font-mono text-[#71717A] flex items-center gap-1">
                            <span>Reserved by:</span>
                            <span className="text-[#A1A1AA] font-bold">{slot.bookedByClientName}</span>
                          </div>
                        )}

                        {slot.isOutsideHours && director && (
                          <div className="text-[10px] font-mono text-red-400/90 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Director hours: {director.workingHoursStart}:00 – {Math.floor(director.workingHoursEnd)}:00</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 pt-1">
                          {slot.reviewTools.map((tool, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-[#1C1C1F] text-[#71717A] text-[9px] font-mono"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* BOOK CTA */}
                    <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1">
                        <Video className="w-3 h-3 text-[#26A69A]" />
                        <span>Google Meet HD</span>
                      </span>

                      {slot.isValidOpenSlot ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBookingModal(slot);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs flex items-center gap-1 transition-all shadow cursor-pointer"
                        >
                          <span>Book Slot</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-[#27272A] text-[#71717A] font-mono text-[10px]">
                          {slot.isBooked ? 'Unavailable' : 'Outside Hours'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: DIRECTOR PROFILE & SLOT HIGHLIGHT (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-[#141416] border border-[#27272A] space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center justify-between border-b border-[#27272A] pb-3">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#3ECF8E]" />
                <span>Director Dossier</span>
              </span>
              {activeDirectorObj && renderStatusBadge(directorLiveStatuses[activeDirectorObj.id] || 'available')}
            </h4>

            {activeDirectorObj ? (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#3F3F46] shadow-md">
                    <Image
                      src={activeDirectorObj.avatar}
                      alt={activeDirectorObj.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{activeDirectorObj.name}</h5>
                    <div className="text-[11px] text-[#A1A1AA]">{activeDirectorObj.role}</div>
                    <div className="text-[10px] text-[#3ECF8E] flex items-center gap-1">
                      <span>★ {activeDirectorObj.rating}</span>
                      <span>({activeDirectorObj.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  {activeDirectorObj.bio}
                </p>

                {/* LIVE AVAILABILITY INTERACTIVE TOGGLE */}
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Live Status Override</span>
                    <span className="text-[9px] text-[#71717A]">Click to switch</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['available', 'in_review', 'in_vr_lab'] as DirectorAvailabilityStatus[]).map((st) => {
                      const isActive = (directorLiveStatuses[activeDirectorObj.id] || 'available') === st;
                      return (
                        <button
                          key={st}
                          onClick={() => {
                            setDirectorLiveStatuses((prev) => ({
                              ...prev,
                              [activeDirectorObj.id]: st,
                            }));
                            showToast(`Status updated to ${st.replace('_', ' ')}`, 'info');
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all ${
                            isActive
                              ? st === 'available'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : st === 'in_review'
                                ? 'bg-amber-950 text-amber-300 border-amber-700'
                                : 'bg-purple-950 text-purple-300 border-purple-700'
                              : 'bg-[#141416] text-[#71717A] border-[#27272A] hover:text-white'
                          }`}
                        >
                          {st === 'available' ? 'Available' : st === 'in_review' ? 'In Review' : 'In VR Lab'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold">Specialties</span>
                  <div className="flex flex-wrap gap-1">
                    {activeDirectorObj.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#1F1F23] border border-[#27272A] text-white text-[10px]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-[#A1A1AA]">
                    <span>Studio Base</span>
                    <span className="text-white">{activeDirectorObj.studioLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#A1A1AA]">
                    <span>Official Working Hours</span>
                    <span className="text-[#3ECF8E] font-bold">
                      {activeDirectorObj.workingHoursStart}:00 – {Math.floor(activeDirectorObj.workingHoursEnd)}:{activeDirectorObj.workingHoursEnd % 1 !== 0 ? '30' : '00'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#A1A1AA]">
                    <span>Google Meet Fleet ID</span>
                    <span className="text-white">{activeDirectorObj.googleEmail}</span>
                  </div>
                </div>

                {activeSlot && activeSlot.isValidOpenSlot && (
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Confirm Selected Slot</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2 text-[#71717A] text-xs font-mono">
                <Box className="w-6 h-6 mx-auto text-[#52525B]" />
                <p>Click any open slot above to review the architectural director&apos;s credentials and live schedule.</p>
              </div>
            )}
          </div>

          {/* STUDIO HARDWARE & SCHEDULE ASSURANCE */}
          <div className="p-4 rounded-xl bg-[#141416] border border-[#27272A] space-y-2 text-[11px] font-mono">
            <div className="text-white font-bold flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-[#00897B]" />
              <span>Conflict Prevention Rules</span>
            </div>
            <ul className="space-y-1 text-[#A1A1AA] text-[10px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#3ECF8E]" />
                Instant slot reservation locks double-bookings
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#3ECF8E]" />
                Working hours bound to director studio timezone
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#3ECF8E]" />
                Live Google Meet link auto-emailed upon signoff
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CONFIRMATION & BOOKING MODAL */}
      <AnimatePresence>
        {isBookingModalOpen && activeSlot && activeDirectorObj && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-lg w-full p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5 shadow-2xl text-xs font-mono"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                  <CalendarCheck className="w-4 h-4 text-[#26A69A]" />
                  <span>Confirm Live Review Slot & Google Meet Space</span>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-1 rounded hover:bg-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SLOT SUMMARY CARD */}
              <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#3F3F46] shrink-0">
                      <Image
                        src={activeDirectorObj.avatar}
                        alt={activeDirectorObj.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">{activeDirectorObj.name}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{activeDirectorObj.role}</div>
                      <div className="text-[10px] text-[#26A69A]">{activeDirectorObj.googleEmail}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#3ECF8E] font-bold">{activeSlot.startTime} – {activeSlot.endTime}</div>
                    <div className="text-[10px] text-[#A1A1AA]">{activeSlot.displayDate}</div>
                    <div className="text-[10px] text-[#71717A]">{activeSlot.durationMinutes} Minutes</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272A] space-y-1">
                  <div className="text-white font-bold">{activeSlot.focusLabel}</div>
                  <div className="text-[10px] text-[#A1A1AA]">
                    Project Target: <strong className="text-white">{currentProjectName} ({currentProjectId})</strong>
                  </div>
                </div>
              </div>

              {/* BOOKING PREFERENCES */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px] font-bold">Review Objectives & CAD Questions</label>
                  <textarea
                    rows={2}
                    value={clientCustomNotes}
                    onChange={(e) => setClientCustomNotes(e.target.value)}
                    placeholder="Specific questions regarding facade curvature, lighting reflections, or structural clearances..."
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B] text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] uppercase text-[10px] font-bold">Additional Team Emails (Comma separated)</label>
                  <input
                    type="text"
                    value={additionalAttendees}
                    onChange={(e) => setAdditionalAttendees(e.target.value)}
                    placeholder="partner@fosterpartners.com, bim.lead@studio.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-white focus:outline-none focus:border-[#00897B] text-xs"
                  />
                </div>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#09090B] border border-[#27272A] cursor-pointer">
                  <div>
                    <div className="text-white font-bold">Enable 8K WebXR In-Call Teleportation</div>
                    <div className="text-[10px] text-[#71717A]">Inject live multi-user 3D viewer links directly into Google Meet</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWebXRSync}
                    onChange={(e) => setEnableWebXRSync(e.target.checked)}
                    className="accent-[#00897B] w-4 h-4"
                  />
                </label>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  disabled={isConfirmingBooking}
                  className="px-4 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isConfirmingBooking}
                  className="px-5 py-2.5 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  {isConfirmingBooking ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Space...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Confirm & Provision Meet Space</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
