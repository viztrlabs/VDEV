'use client';

import React from 'react';
import SuperAdminPanel from '../SuperAdminPanel';

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>PLATFORM OVERVIEW</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Super Admin Command Center
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Unified governance, telemetry, and fleet management for the VizTR spatial platform.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function SuperAdminGovernance() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>SUPER ADMIN GOVERNANCE</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Master Super Admin Panel
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Users, analytics, revenue, GPU monitoring, feature toggles, system health, and permissions.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function CoreSystemsFleet() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>CORE SYSTEMS FLEET</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Core Systems & Fleet Management
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Project management, XR links, pixel streaming, file storage, and asset pipeline.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function SuperAdminCMS() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>SUPER ADMIN CMS SUITE</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Master CMS Engine
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Pages, blog, services, media, design themes, navigation, and social links.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function DocStudioCRMSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>DOC STUDIO & CRM</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Doc Studio & CRM
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Documents, leads, and studio profile with kanban board.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function XRRealTimeEngine() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>XR REAL-TIME ENGINE</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          XR Real-Time Engine
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          VR tours, AR quicklook, GPU streaming, Gaussian splats, and virtual tours.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function MeetingsBookings() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>MEETINGS & BOOKINGS</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Meetings & Bookings
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Google Meet fleet, all bookings, and support tickets.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function CloudInfrastructure() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>CLOUD INFRASTRUCTURE</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Cloud Infrastructure
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Google Drive fleet, AI credentials, PlayCanvas engine, platform settings, AI platform.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}

export function ClientDiscoveryForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] font-bold uppercase">
          <span>CLIENT DISCOVERY</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Client Discovery Form
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Google Forms integration for client intake and project scoping.
        </p>
      </div>
      
      <SuperAdminPanel />
    </div>
  );
}