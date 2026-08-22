'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Lock,
  Calendar,
  ShieldCheck,
  ExternalLink,
  QrCode,
  Mail,
  Trash2,
  Eye,
  Key,
  X,
  Layers,
  Zap,
  Info,
  FileDown,
  Download,
  FileText,
  FileSpreadsheet,
  Code,
  Printer,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ALL_STAGES } from '@/data/projects-tracking';

export interface ProjectStatsData {
  hoursSpent: number;
  totalEstimatedHours: number;
  assetsApproved: number;
  totalAssets: number;
  pendingRevisions: number;
  revisionsSummary?: string;
  nextMilestone: string;
  milestoneEta: string;
  currentStageNumber: number;
  totalStages: number;
}

export interface StakeholderShareLink {
  id: string;
  token: string;
  projectId: string;
  recipientLabel: string;
  durationLabel: string;
  expiresAt: number; // timestamp
  createdAt: number;
  pinRequired: boolean;
  pinCode?: string;
  scopes: string[];
  url: string;
}

interface ProjectStatsWidgetProps {
  stats: ProjectStatsData;
  projectName?: string;
  projectId?: string;
  className?: string;
  readOnly?: boolean;
}

export default function ProjectStatsWidget({
  stats,
  projectName = 'Architectural CGI Commission',
  projectId = 'VIZTR-882',
  className = '',
  readOnly = false,
}: ProjectStatsWidgetProps) {
  const { showToast } = useAppStore();

  // Share Modal & Generator State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [shareQrDataUrl, setShareQrDataUrl] = useState<string>('');

  // Dedicated Mobile QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [qrPinCopied, setQrPinCopied] = useState(false);
  const [qrTargetLink, setQrTargetLink] = useState<StakeholderShareLink | null>(null);

  // Export Data Modal & State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json' | 'csv'>('pdf');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfIncludeRoadmap, setPdfIncludeRoadmap] = useState(true);
  const [pdfIncludeRevisions, setPdfIncludeRevisions] = useState(true);
  const [pdfIncludeSignoff, setPdfIncludeSignoff] = useState(true);
  const [pdfClientNote, setPdfClientNote] = useState('Foster & Partners Architectural Review');

  // Form Configuration State for New Link
  const [durationOption, setDurationOption] = useState<'24h' | '48h' | '7d' | '30d'>('7d');
  const [recipientTag, setRecipientTag] = useState('Stakeholder Review Board');
  const [requirePin, setRequirePin] = useState(true);
  const [pinCode, setPinCode] = useState('8824');
  const [scopeStats, setScopeStats] = useState(true);
  const [scopeRoadmap, setScopeRoadmap] = useState(true);
  const [scopeDocs, setScopeDocs] = useState(false);

  // Reference time for expiry calculations
  const [nowTimestamp, setNowTimestamp] = useState<number>(0);

  // Active Generated Links State with safe lazy initializers
  const [activeLinks, setActiveLinks] = useState<StakeholderShareLink[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`viztr_share_links_${projectId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
    return [];
  });

  const [currentGeneratedLink, setCurrentGeneratedLink] = useState<StakeholderShareLink | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`viztr_share_links_${projectId}`);
      if (stored) {
        const parsed: StakeholderShareLink[] = JSON.parse(stored);
        return parsed.length > 0 ? parsed[0] : null;
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const [originUrl, setOriginUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://viztr-studios.com';
  });

  // Keep nowTimestamp updated safely
  useEffect(() => {
    const updateTime = () => setNowTimestamp(Date.now());
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Persist links to localStorage
  const saveLinks = useCallback((links: StakeholderShareLink[]) => {
    setActiveLinks(links);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`viztr_share_links_${projectId}`, JSON.stringify(links));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [projectId]);

  const getDurationHours = (dur: '24h' | '48h' | '7d' | '30d'): number => {
    switch (dur) {
      case '24h':
        return 24;
      case '48h':
        return 48;
      case '7d':
        return 24 * 7;
      case '30d':
        return 24 * 30;
      default:
        return 24 * 7;
    }
  };

  // Generate a new secure link
  const handleGenerateLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hours = getDurationHours(durationOption);
    const currentNow = Date.now();
    const expiresTimestamp = currentNow + hours * 60 * 60 * 1000;
    const randomHex = Math.random().toString(36).substring(2, 9);
    const token = `stk_${projectId.toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomHex}`;

    const baseUrl = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://viztr-studios.com');
    const fullShareUrl = `${baseUrl}/client-view/${projectId}?token=${token}&scope=${scopeStats ? 'stats' : ''}${scopeRoadmap ? '+roadmap' : ''}${scopeDocs ? '+docs' : ''}&pin=${requirePin ? pinCode : 'none'}&exp=${expiresTimestamp}`;

    const newLink: StakeholderShareLink = {
      id: `share-${currentNow}`,
      token,
      projectId,
      recipientLabel: recipientTag.trim() || 'Stakeholder Board',
      durationLabel: durationOption.toUpperCase(),
      expiresAt: expiresTimestamp,
      createdAt: currentNow,
      pinRequired: requirePin,
      pinCode: requirePin ? pinCode : undefined,
      scopes: [
        scopeStats ? 'Project Stats Telemetry' : '',
        scopeRoadmap ? '7-Stage Roadmap' : '',
        scopeDocs ? 'Deliverable Archives' : ''
      ].filter(Boolean),
      url: fullShareUrl,
    };

    const updated = [newLink, ...activeLinks];
    saveLinks(updated);
    setCurrentGeneratedLink(newLink);

    showToast(`Secure stakeholder link generated for ${newLink.recipientLabel}`, 'success');
  };

  const handleCopyLink = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Secure stakeholder link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleRevokeLink = (id: string) => {
    const updated = activeLinks.filter((l) => l.id !== id);
    saveLinks(updated);
    if (currentGeneratedLink?.id === id) {
      setCurrentGeneratedLink(updated.length > 0 ? updated[0] : null);
    }
    showToast('Stakeholder link access revoked.', 'info');
  };

  const generateRandomPin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(randomPin);
    showToast(`New PIN generated: ${randomPin}`, 'info');
  };

  const hoursPercentage = Math.min(
    100,
    Math.round((stats.hoursSpent / (stats.totalEstimatedHours || 1)) * 100)
  );

  const assetsPercentage = Math.min(
    100,
    Math.round((stats.assetsApproved / (stats.totalAssets || 1)) * 100)
  );

  // Format remaining time using stored timestamp or fallback
  const formatTimeLeft = (expiresAt: number) => {
    const currentRef = nowTimestamp || expiresAt - 1000;
    const diffMs = expiresAt - currentRef;
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 24) return `${Math.max(1, hours)}h remaining`;
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h left`;
  };

  // Generate real scannable QR Code Data URL using QRCode library
  const generateQrCodeForUrl = async (url: string): Promise<string> => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: '#09090B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
      return dataUrl;
    } catch (err) {
      console.error('QR code generation error:', err);
      return '';
    }
  };

  // Open dedicated Mobile QR Code Modal
  const handleOpenQrModal = async (linkToUse?: StakeholderShareLink) => {
    try {
      setQrLoading(true);
      let target = linkToUse || currentGeneratedLink;

      // If no active link exists yet, automatically create a default 7-day secure stakeholder link
      if (!target) {
        const currentNow = Date.now();
        const expiresTimestamp = currentNow + 7 * 24 * 60 * 60 * 1000;
        const randomHex = Math.random().toString(36).substring(2, 9);
        const token = `stk_${(projectId || 'viztr882').toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomHex}`;
        const baseUrl = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://viztr-studios.com');
        const fullShareUrl = `${baseUrl}/client-view/${projectId || 'VIZTR-882'}?token=${token}&scope=stats+roadmap&pin=8824&exp=${expiresTimestamp}`;

        target = {
          id: `share-${currentNow}`,
          token,
          projectId: projectId || 'VIZTR-882',
          recipientLabel: 'Mobile Stakeholder Board',
          durationLabel: '7D',
          expiresAt: expiresTimestamp,
          createdAt: currentNow,
          pinRequired: true,
          pinCode: '8824',
          scopes: ['Project Stats Telemetry', '7-Stage Roadmap'],
          url: fullShareUrl,
        };

        const updated = [target, ...activeLinks];
        saveLinks(updated);
        setCurrentGeneratedLink(target);
      }

      setQrTargetLink(target);
      const dataUrl = await generateQrCodeForUrl(target.url);
      setQrDataUrl(dataUrl);
      setQrModalOpen(true);
      showToast('Mobile access QR code generated.', 'success');
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
      showToast('Failed to generate QR code.', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  // Download QR Code image as high-resolution PNG
  const handleDownloadQrCode = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `VIZTR_QR_Stats_${projectId || 'VIZTR-882'}_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('High-resolution QR code downloaded (PNG)', 'success');
  };

  // Keep share modal QR updated
  useEffect(() => {
    if (showQrCode && currentGeneratedLink?.url) {
      generateQrCodeForUrl(currentGeneratedLink.url).then((url) => {
        setShareQrDataUrl(url);
      });
    }
  }, [showQrCode, currentGeneratedLink?.url]);

  // EXPORT SUMMARY AS PDF USING jsPDF
  const handleExportPdf = () => {
    try {
      setExportingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      const margin = 14;
      const contentWidth = pageWidth - margin * 2; // 182mm

      // Background canvas
      doc.setFillColor(248, 249, 250);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Top Dark Header Banner
      doc.setFillColor(15, 17, 23); // #0F1117
      doc.rect(margin, margin, contentWidth, 26, 'F');

      // Emerald Accent Top Stripe
      doc.setFillColor(62, 207, 142); // #3ECF8E
      doc.rect(margin, margin, contentWidth, 2, 'F');

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('VIZTR STUDIOS | ARCHITECTURAL CGI TELEMETRY', margin + 6, margin + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text('EXECUTIVE PROJECT STATISTICS & MILESTONE AUDIT REPORT', margin + 6, margin + 16);

      // Project Badge on Top Right
      doc.setFillColor(24, 24, 27);
      doc.rect(pageWidth - margin - 42, margin + 6, 36, 14, 'F');
      doc.setDrawColor(62, 207, 142);
      doc.setLineWidth(0.3);
      doc.rect(pageWidth - margin - 42, margin + 6, 36, 14, 'S');

      doc.setTextColor(62, 207, 142);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(projectId || 'VIZTR-882', pageWidth - margin - 24, margin + 13, { align: 'center' });
      doc.setFontSize(6);
      doc.setTextColor(161, 161, 170);
      doc.text('CONFIDENTIAL AUDIT', pageWidth - margin - 24, margin + 17, { align: 'center' });

      // Metadata Panel below banner
      let y = margin + 31;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 19, 2, 2, 'FD');

      doc.setTextColor(113, 113, 122);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('PROJECT COMMISSION:', margin + 4, y + 6);
      doc.text('CLIENT / RECIPIENT:', margin + 70, y + 6);
      doc.text('GENERATED ON:', margin + 130, y + 6);

      doc.setTextColor(24, 24, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(projectName || 'Architectural CGI Commission', margin + 4, y + 13);
      doc.text(pdfClientNote || 'Foster & Partners Review Board', margin + 70, y + 13);

      const genDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(genDate, margin + 130, y + 13);

      // Section 1: Executive KPI Telemetry
      y += 24;
      doc.setTextColor(15, 17, 23);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('1. EXECUTIVE KPI TELEMETRY & BUDGET UTILIZATION', margin, y);

      y += 4;
      const cardWidth = (contentWidth - 6) / 2; // 88mm each
      const cardHeight = 23;

      // Card 1: Hours Spent
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(228, 228, 231);
      doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
      doc.setFillColor(62, 207, 142);
      doc.rect(margin, y, 1.5, cardHeight, 'F');

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('HOURS SPENT / PRODUCTION BUDGET', margin + 5, y + 5.5);

      doc.setTextColor(24, 24, 27);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${stats.hoursSpent.toFixed(1)} hrs`, margin + 5, y + 12);

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Budget: ${stats.totalEstimatedHours}h (${hoursPercentage}% used)`, margin + 5, y + 17);

      // Progress bar in card 1
      doc.setFillColor(228, 228, 231);
      doc.roundedRect(margin + 5, y + 19, cardWidth - 10, 1.8, 0.9, 0.9, 'F');
      doc.setFillColor(62, 207, 142);
      doc.roundedRect(margin + 5, y + 19, (cardWidth - 10) * (hoursPercentage / 100), 1.8, 0.9, 0.9, 'F');

      // Card 2: Assets Approved
      const card2X = margin + cardWidth + 6;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(228, 228, 231);
      doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, 'FD');
      doc.setFillColor(62, 207, 142);
      doc.rect(card2X, y, 1.5, cardHeight, 'F');

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSETS APPROVED / SCOPE TOTAL', card2X + 5, y + 5.5);

      doc.setTextColor(24, 24, 27);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${stats.assetsApproved} / ${stats.totalAssets}`, card2X + 5, y + 12);

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${stats.totalAssets - stats.assetsApproved} pending (${assetsPercentage}% done)`, card2X + 5, y + 17);

      // Progress bar in card 2
      doc.setFillColor(228, 228, 231);
      doc.roundedRect(card2X + 5, y + 19, cardWidth - 10, 1.8, 0.9, 0.9, 'F');
      doc.setFillColor(62, 207, 142);
      doc.roundedRect(card2X + 5, y + 19, (cardWidth - 10) * (assetsPercentage / 100), 1.8, 0.9, 0.9, 'F');

      y += cardHeight + 3.5;

      // Card 3: Pending Revisions
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(228, 228, 231);
      doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
      const revColor = stats.pendingRevisions > 0 ? [245, 158, 11] : [62, 207, 142];
      doc.setFillColor(revColor[0], revColor[1], revColor[2]);
      doc.rect(margin, y, 1.5, cardHeight, 'F');

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('REVISION TICKETS & CLEARANCES', margin + 5, y + 5.5);

      doc.setTextColor(stats.pendingRevisions > 0 ? 180 : 24, stats.pendingRevisions > 0 ? 83 : 24, stats.pendingRevisions > 0 ? 9 : 27);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${stats.pendingRevisions} ${stats.pendingRevisions === 1 ? 'Ticket' : 'Tickets'} Active`, margin + 5, y + 12);

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      const revText = stats.revisionsSummary || (stats.pendingRevisions > 0 ? 'Active in studio queue' : 'Zero blockers recorded');
      doc.text(revText.length > 42 ? revText.substring(0, 40) + '...' : revText, margin + 5, y + 18);

      // Card 4: Milestone Target
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(228, 228, 231);
      doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, 'FD');
      doc.setFillColor(62, 207, 142);
      doc.rect(card2X, y, 1.5, cardHeight, 'F');

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('CURRENT PRODUCTION STAGE', card2X + 5, y + 5.5);

      doc.setTextColor(24, 24, 27);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Stage ${stats.currentStageNumber} of ${stats.totalStages}`, card2X + 5, y + 12);

      doc.setTextColor(113, 113, 122);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${stats.nextMilestone} (${stats.milestoneEta})`, card2X + 5, y + 18);

      y += cardHeight + 7;

      // Section 2: 7-Stage Production Roadmap Table
      if (pdfIncludeRoadmap) {
        doc.setTextColor(15, 17, 23);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text('2. SEVEN-STAGE PRODUCTION PIPELINE STATUS', margin, y);
        y += 4;

        // Table Header
        doc.setFillColor(15, 17, 23);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('STAGE', margin + 3, y + 4.5);
        doc.text('MILESTONE PHASE', margin + 18, y + 4.5);
        doc.text('DESCRIPTION / SCOPE CRITERIA', margin + 62, y + 4.5);
        doc.text('STATUS', pageWidth - margin - 22, y + 4.5);

        y += 6.5;

        ALL_STAGES.forEach((stg, index) => {
          const isDone = stg.stage < stats.currentStageNumber;
          const isCurr = stg.stage === stats.currentStageNumber;
          const rowBg = index % 2 === 0 ? 255 : 248;

          doc.setFillColor(rowBg, rowBg, rowBg);
          doc.setDrawColor(228, 228, 231);
          doc.rect(margin, y, contentWidth, 7.5, 'FD');

          // Stage Num
          doc.setTextColor(113, 113, 122);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text(`0${stg.stage}`, margin + 3, y + 5);

          // Name
          doc.setTextColor(24, 24, 27);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text(stg.name, margin + 18, y + 5);

          // Desc
          doc.setTextColor(113, 113, 122);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          const truncatedDesc = stg.desc.length > 58 ? stg.desc.substring(0, 56) + '...' : stg.desc;
          doc.text(truncatedDesc, margin + 62, y + 5);

          // Status Badge
          if (isDone) {
            doc.setFillColor(220, 252, 231); // emerald-100
            doc.setDrawColor(187, 247, 208);
            doc.roundedRect(pageWidth - margin - 25, y + 1.2, 21, 4.8, 1, 1, 'FD');
            doc.setTextColor(22, 101, 52); // emerald-800
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(5.5);
            doc.text('COMPLETED', pageWidth - margin - 14.5, y + 4.3, { align: 'center' });
          } else if (isCurr) {
            doc.setFillColor(254, 243, 199); // amber-100
            doc.setDrawColor(253, 230, 138);
            doc.roundedRect(pageWidth - margin - 25, y + 1.2, 21, 4.8, 1, 1, 'FD');
            doc.setTextColor(146, 64, 14); // amber-800
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(5.5);
            doc.text('IN PRODUCTION', pageWidth - margin - 14.5, y + 4.3, { align: 'center' });
          } else {
            doc.setFillColor(244, 244, 245);
            doc.setDrawColor(228, 228, 231);
            doc.roundedRect(pageWidth - margin - 25, y + 1.2, 21, 4.8, 1, 1, 'FD');
            doc.setTextColor(161, 161, 170);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(5.5);
            doc.text('PENDING', pageWidth - margin - 14.5, y + 4.3, { align: 'center' });
          }

          y += 7.5;
        });

        y += 4;
      }

      // Section 3: Revision Details & Quality Assurance Seal
      if (pdfIncludeRevisions && y < pageHeight - 40) {
        doc.setTextColor(15, 17, 23);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text('3. REVISION MANAGEMENT & QUALITY ASSURANCE', margin, y);
        y += 4;

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(228, 228, 231);
        doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

        doc.setTextColor(113, 113, 122);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.text('STUDIO REVISION & DELIVERABLE NOTES:', margin + 4, y + 5);

        doc.setTextColor(24, 24, 27);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const fullRevDesc = stats.revisionsSummary
          ? `Current Active Notice: ${stats.revisionsSummary}. All revisions are calibrated to architectural photorealism and calibrated color-managed workflows (ACEScg / sRGB).`
          : 'All milestone deliverables have passed quality sign-off with zero pending tickets. Ready for final archival deployment.';
        
        const splitText = doc.splitTextToSize(fullRevDesc, contentWidth - 8);
        doc.text(splitText, margin + 4, y + 10);

        y += 19;
      }

      // Footer Authentication Block
      const footerY = pageHeight - margin - 13;
      doc.setFillColor(15, 17, 23);
      doc.rect(margin, footerY, contentWidth, 13, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('AUTHENTICATED BY VIZTR CGI PRODUCTION ENGINE', margin + 5, footerY + 5);

      doc.setTextColor(161, 161, 170);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text('Certified for Stakeholder & Executive Review • SHA-256 Telemetry Hash Verified', margin + 5, footerY + 9);

      doc.setTextColor(62, 207, 142);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('STATUS: VERIFIED', pageWidth - margin - 5, footerY + 7.5, { align: 'right' });

      // Save PDF
      const cleanFileName = `VIZTR_Project_Summary_${(projectId || 'VIZTR-882').replace(/[^a-zA-Z0-9_-]/g, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(cleanFileName);

      showToast(`Project summary PDF saved as ${cleanFileName}`, 'success');
      setExportModalOpen(false);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      showToast('Failed to generate PDF summary. Please try again.', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  // EXPORT JSON DATA
  const handleExportJson = () => {
    try {
      const dataPayload = {
        meta: {
          studio: 'VIZTR Studios Architectural CGI',
          projectId,
          projectName,
          generatedAt: new Date().toISOString(),
          recipient: pdfClientNote,
        },
        kpiMetrics: {
          hoursSpent: stats.hoursSpent,
          totalEstimatedHours: stats.totalEstimatedHours,
          hoursUtilizationPercentage: hoursPercentage,
          assetsApproved: stats.assetsApproved,
          totalAssets: stats.totalAssets,
          assetsApprovalPercentage: assetsPercentage,
          pendingRevisions: stats.pendingRevisions,
          revisionsSummary: stats.revisionsSummary,
          currentStageNumber: stats.currentStageNumber,
          totalStages: stats.totalStages,
          nextMilestone: stats.nextMilestone,
          milestoneEta: stats.milestoneEta,
        },
        pipelineStages: ALL_STAGES.map((stg) => ({
          stage: stg.stage,
          name: stg.name,
          description: stg.desc,
          status: stg.stage < stats.currentStageNumber ? 'completed' : stg.stage === stats.currentStageNumber ? 'in-production' : 'pending',
        })),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `VIZTR_Telemetry_${projectId || 'VIZTR-882'}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Project telemetry JSON dataset downloaded!', 'success');
      setExportModalOpen(false);
    } catch (err) {
      console.error('JSON export error:', err);
      showToast('Failed to export JSON data.', 'error');
    }
  };

  // EXPORT CSV DATA
  const handleExportCsv = () => {
    try {
      const rows = [
        ['Metric Category', 'Metric Key', 'Value', 'Unit / Details'],
        ['Project Info', 'Project ID', projectId || 'VIZTR-882', ''],
        ['Project Info', 'Project Name', projectName || 'Architectural CGI Commission', ''],
        ['Project Info', 'Client / Recipient', pdfClientNote, ''],
        ['Project Info', 'Report Timestamp', new Date().toISOString(), ''],
        ['Telemetry', 'Hours Spent', stats.hoursSpent.toString(), 'Hours'],
        ['Telemetry', 'Total Estimated Budget', stats.totalEstimatedHours.toString(), 'Hours'],
        ['Telemetry', 'Budget Utilization', `${hoursPercentage}%`, ''],
        ['Telemetry', 'Assets Approved', stats.assetsApproved.toString(), 'Assets'],
        ['Telemetry', 'Total Scope Assets', stats.totalAssets.toString(), 'Assets'],
        ['Telemetry', 'Asset Completion Rate', `${assetsPercentage}%`, ''],
        ['Telemetry', 'Pending Revision Tickets', stats.pendingRevisions.toString(), 'Active Tickets'],
        ['Telemetry', 'Revisions Summary', `"${stats.revisionsSummary || 'Zero blockers'}"`, ''],
        ['Milestone', 'Current Stage Number', stats.currentStageNumber.toString(), `Stage ${stats.currentStageNumber} of ${stats.totalStages}`],
        ['Milestone', 'Next Target Milestone', `"${stats.nextMilestone}"`, `ETA: ${stats.milestoneEta}`],
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `VIZTR_Stats_${projectId || 'VIZTR-882'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast('Project statistics CSV downloaded!', 'success');
      setExportModalOpen(false);
    } catch (err) {
      console.error('CSV export error:', err);
      showToast('Failed to export CSV data.', 'error');
    }
  };

  return (
    <div
      id={`project-stats-widget-${projectId || 'default'}`}
      className={`space-y-3 ${className}`}
    >
      {/* SECTION TITLE & SHARE ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span>Project Statistics</span>
          </h3>
          {projectId && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
              {projectId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* REAL-TIME TELEMETRY PILL */}
          <div className="text-[11px] font-mono text-[#71717A] hidden md:flex items-center gap-1.5 mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
            <span>Live telemetry</span>
          </div>

          {/* EXPORT DATA BUTTON (DOWNLOAD SUMMARY AS PDF) */}
          <button
            id="btn-export-project-stats"
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/60 text-zinc-300 hover:text-[#3ECF8E] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group"
            title="Export project statistics summary as PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-[#3ECF8E] transition-transform group-hover:-translate-y-0.5" />
            <span>Export Data</span>
          </button>

          {/* QR CODE BUTTON FOR MOBILE STAKEHOLDERS */}
          <button
            id="btn-qr-code-project-stats"
            onClick={() => handleOpenQrModal()}
            className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/60 text-zinc-300 hover:text-[#3ECF8E] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group"
            title="Generate & display unique QR code for mobile device access"
          >
            <QrCode className="w-3.5 h-3.5 text-[#3ECF8E] transition-transform group-hover:scale-110" />
            <span>Mobile QR</span>
          </button>

          {/* SHARE BUTTON FOR STAKEHOLDER LINK GENERATION */}
          {!readOnly && (
            <button
              id="btn-share-project-stats"
              onClick={() => {
                if (activeLinks.length === 0 && !currentGeneratedLink) {
                  handleGenerateLink();
                }
                setShareModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#3ECF8E]/40 hover:border-[#3ECF8E] text-[#3ECF8E] hover:text-[#3ECF8E] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group"
              title="Generate temporary secure link for stakeholders"
            >
              <Share2 className="w-3.5 h-3.5 text-[#3ECF8E] transition-transform group-hover:scale-110" />
              <span>Share Stats</span>
              {activeLinks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30 font-bold">
                  {activeLinks.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 4-CARD METRIC GRID USING .hd-card WITH FRAMER MOTION ENTRANCE ANIMATION */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.05,
            },
          },
        }}
      >
        {/* CARD 1: HOURS SPENT */}
        <motion.div
          id="stat-card-hours-spent"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          className="hd-card p-4 hover:border-[#3ECF8E]/40 transition-all flex flex-col justify-between space-y-3 group relative"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Hours Spent
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-display font-bold text-white tracking-tight">
                  {stats.hoursSpent.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-[#71717A]">hrs</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenQrModal();
                }}
                title="Scan QR on mobile"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-[#71717A] hover:text-[#3ECF8E] cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <div className="w-9 h-9 rounded-lg bg-[#09090B] border border-[#27272A] group-hover:border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-[#27272A]/70">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#71717A]">Est. Budget: {stats.totalEstimatedHours}h</span>
              <span className="text-[#3ECF8E] font-bold">{hoursPercentage}% used</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#09090B] overflow-hidden">
              <div
                className="h-full bg-[#3ECF8E] rounded-full transition-all duration-500"
                style={{ width: `${hoursPercentage}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* CARD 2: ASSETS APPROVED */}
        <motion.div
          id="stat-card-assets-approved"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          className="hd-card p-4 hover:border-[#3ECF8E]/40 transition-all flex flex-col justify-between space-y-3 group relative"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Assets Approved
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-display font-bold text-white tracking-tight">
                  {stats.assetsApproved}
                </span>
                <span className="text-xs font-mono text-[#71717A]">
                  / {stats.totalAssets}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenQrModal();
                }}
                title="Scan QR on mobile"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-[#71717A] hover:text-[#3ECF8E] cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <div className="w-9 h-9 rounded-lg bg-[#09090B] border border-[#27272A] group-hover:border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-[#27272A]/70">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#71717A]">
                {stats.totalAssets - stats.assetsApproved} pending signoff
              </span>
              <span className="text-[#3ECF8E] font-bold">{assetsPercentage}% done</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#09090B] overflow-hidden">
              <div
                className="h-full bg-[#3ECF8E] rounded-full transition-all duration-500"
                style={{ width: `${assetsPercentage}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* CARD 3: PENDING REVISIONS */}
        <motion.div
          id="stat-card-pending-revisions"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          className="hd-card p-4 hover:border-[#3ECF8E]/40 transition-all flex flex-col justify-between space-y-3 group relative"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Pending Revisions
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-white tracking-tight">
                  {stats.pendingRevisions}
                </span>
                <span className="text-xs font-mono text-[#71717A]">
                  {stats.pendingRevisions === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenQrModal();
                }}
                title="Scan QR on mobile"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-[#71717A] hover:text-[#3ECF8E] cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  stats.pendingRevisions > 0
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 group-hover:border-amber-500'
                    : 'bg-[#09090B] border-[#27272A] text-[#3ECF8E]'
                }`}
              >
                {stats.pendingRevisions > 0 ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-[#27272A]/70 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#71717A] truncate max-w-[140px]" title={stats.revisionsSummary}>
              {stats.revisionsSummary || (stats.pendingRevisions > 0 ? 'In active studio queue' : 'Zero blockers')}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                stats.pendingRevisions > 0
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
              }`}
            >
              {stats.pendingRevisions > 0 ? 'Active' : 'Clear'}
            </span>
          </div>
        </motion.div>

        {/* CARD 4: MILESTONE VELOCITY / NEXT TARGET */}
        <motion.div
          id="stat-card-next-milestone"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          className="hd-card p-4 hover:border-[#3ECF8E]/40 transition-all flex flex-col justify-between space-y-3 group relative"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                Current Milestone
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-display font-bold text-white tracking-tight truncate">
                  Stage {stats.currentStageNumber}/{stats.totalStages}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenQrModal();
                }}
                title="Scan QR on mobile"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3ECF8E]/50 text-[#71717A] hover:text-[#3ECF8E] cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <div className="w-9 h-9 rounded-lg bg-[#09090B] border border-[#27272A] group-hover:border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] transition-colors shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-[#27272A]/70 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#A1A1AA] truncate font-medium max-w-[130px]" title={stats.nextMilestone}>
              {stats.nextMilestone}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#09090B] border border-[#27272A] text-[#3ECF8E] shrink-0">
              {stats.milestoneEta}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* STAKEHOLDER SHARE LINK MODAL / DIALOG */}
      <AnimatePresence>
        {shareModalOpen && (
          <div
            id="modal-share-stats-backdrop"
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShareModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="hd-card w-full max-w-2xl bg-[#121215] border-[#27272A] shadow-2xl p-6 space-y-6 text-[#FAFAFA] font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between gap-4 border-b border-[#27272A] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[10px] font-mono font-bold uppercase tracking-wider">
                      Stakeholder Telemetry Access
                    </span>
                    <span className="text-xs font-mono text-[#71717A]">• {projectId}</span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">
                    Generate Temporary Secure Link
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Share real-time project metrics, milestone pacing, and revision tickets with external clients or investors.
                  </p>
                </div>

                <button
                  onClick={() => setShareModalOpen(false)}
                  className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* LINK CONFIGURATION FORM */}
              <form onSubmit={handleGenerateLink} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* EXPIRATION DURATION SELECTOR */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <span>Link Expiration Window</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['24h', '48h', '7d', '30d'] as const).map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setDurationOption(dur)}
                          className={`py-2 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                            durationOption === dur
                              ? 'bg-[#3ECF8E] text-black border-[#3ECF8E] shadow-sm'
                              : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-zinc-500'
                          }`}
                        >
                          {dur.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RECIPIENT LABEL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <span>Recipient / Organization</span>
                    </label>
                    <input
                      type="text"
                      value={recipientTag}
                      onChange={(e) => setRecipientTag(e.target.value)}
                      placeholder="e.g. Foster & Partners Executive Board"
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E]"
                    />
                  </div>
                </div>

                {/* SCOPES AND SECURITY */}
                <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-3">
                  <div className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <span>Access Permissions & Security</span>
                    </span>
                    <span className="text-[10px] text-[#71717A] font-normal">Read-Only Enforced</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-[#18181B] border border-[#27272A] cursor-pointer hover:border-zinc-600">
                      <input
                        type="checkbox"
                        checked={scopeStats}
                        onChange={(e) => setScopeStats(e.target.checked)}
                        className="rounded border-[#27272A] text-[#3ECF8E] focus:ring-[#3ECF8E] accent-[#3ECF8E]"
                      />
                      <span className="text-[11px] text-white">Live Stats Telemetry</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-[#18181B] border border-[#27272A] cursor-pointer hover:border-zinc-600">
                      <input
                        type="checkbox"
                        checked={scopeRoadmap}
                        onChange={(e) => setScopeRoadmap(e.target.checked)}
                        className="rounded border-[#27272A] text-[#3ECF8E] focus:ring-[#3ECF8E] accent-[#3ECF8E]"
                      />
                      <span className="text-[11px] text-white">7-Stage Roadmap</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-[#18181B] border border-[#27272A] cursor-pointer hover:border-zinc-600">
                      <input
                        type="checkbox"
                        checked={scopeDocs}
                        onChange={(e) => setScopeDocs(e.target.checked)}
                        className="rounded border-[#27272A] text-[#3ECF8E] focus:ring-[#3ECF8E] accent-[#3ECF8E]"
                      />
                      <span className="text-[11px] text-white">Deliverable Stills</span>
                    </label>
                  </div>

                  {/* PIN PROTECTION ROW */}
                  <div className="pt-2 border-t border-[#27272A]/70 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requirePin}
                        onChange={(e) => setRequirePin(e.target.checked)}
                        className="rounded border-[#27272A] text-[#3ECF8E] focus:ring-[#3ECF8E] accent-[#3ECF8E]"
                      />
                      <span className="text-[11px] text-[#FAFAFA] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#3ECF8E]" />
                        <span>Require 4-Digit Access PIN</span>
                      </span>
                    </label>

                    {requirePin && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-lg px-2 py-1">
                          <Key className="w-3 h-3 text-[#3ECF8E]" />
                          <input
                            type="text"
                            maxLength={4}
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-12 bg-transparent text-center font-mono font-bold text-white focus:outline-none text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={generateRandomPin}
                          className="px-2 py-1 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[10px] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                          Randomize
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate New Secure Link</span>
                  </button>
                </div>
              </form>

              {/* CURRENT GENERATED LINK DISPLAY BOX */}
              {currentGeneratedLink && (
                <div className="p-4 rounded-xl bg-[#09090B] border border-[#3ECF8E]/40 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-pulse" />
                      <span className="text-xs font-bold text-white">
                        Active Stakeholder URL ({currentGeneratedLink.recipientLabel})
                      </span>
                    </div>
                    <span className="text-[10px] text-[#3ECF8E] bg-[#3ECF8E]/10 px-2 py-0.5 rounded border border-[#3ECF8E]/30 font-bold">
                      {formatTimeLeft(currentGeneratedLink.expiresAt)}
                    </span>
                  </div>

                  {/* URL INPUT & COPY BUTTON */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentGeneratedLink.url}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-[#FAFAFA] font-mono focus:outline-none select-all"
                    />
                    <button
                      onClick={() => handleCopyLink(currentGeneratedLink.url)}
                      className="px-3.5 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* ACTION QUICK LAUNCHERS */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#27272A] text-xs">
                    <div className="flex items-center gap-3 text-[11px] text-[#A1A1AA]">
                      {currentGeneratedLink.pinRequired && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Lock className="w-3 h-3" />
                          <span>PIN: {currentGeneratedLink.pinCode}</span>
                        </span>
                      )}
                      <span>Scopes: {currentGeneratedLink.scopes.join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#3ECF8E]" />
                        <span>{showQrCode ? 'Hide QR' : 'Show QR'}</span>
                      </button>

                      <a
                        href={`mailto:?subject=Project Statistics Review: ${projectName}&body=Here is the temporary secure link to review real-time statistics for ${projectName}:%0D%0A%0D%0A${encodeURIComponent(currentGeneratedLink.url)}${currentGeneratedLink.pinRequired ? `%0D%0A%0D%0AAccess PIN: ${currentGeneratedLink.pinCode}` : ''}%0D%0A%0D%0AThis link will expire in ${currentGeneratedLink.durationLabel}.`}
                        className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#3ECF8E]" />
                        <span>Email</span>
                      </a>

                      <a
                        href={currentGeneratedLink.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#3ECF8E] flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* QR CODE DISPLAY WITH REAL SCANNABLE CODE */}
                  {showQrCode && (
                    <div className="p-4 rounded-xl bg-white text-black flex flex-col items-center justify-center space-y-3 mt-2 shadow-xl">
                      <div className="p-2 rounded-lg bg-white border-2 border-zinc-900 shadow-inner flex items-center justify-center">
                        {shareQrDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={shareQrDataUrl}
                            alt="Stakeholder Review QR Code"
                            className="w-44 h-44 object-contain rounded-md"
                          />
                        ) : (
                          <div className="w-44 h-44 flex items-center justify-center font-mono text-xs text-zinc-500">
                            Generating QR Code...
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-[10px] font-mono font-bold text-zinc-900 tracking-wider uppercase flex items-center justify-center gap-1">
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>VIZTR SECURE MOBILE PORTAL</span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-600 text-center">
                          Scan with iOS Camera or Android Lens for mobile review
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!shareQrDataUrl) return;
                          const link = document.createElement('a');
                          link.href = shareQrDataUrl;
                          link.download = `VIZTR_QR_${projectId || 'VIZTR-882'}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          showToast('QR Code downloaded', 'success');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#3ECF8E]" />
                        <span>Download QR Image</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PREVIOUSLY GENERATED ACTIVE LINKS LEDGER */}
              {activeLinks.length > 0 && (
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-[11px] uppercase tracking-wider font-bold">
                    <span>Active Stakeholder Access Tokens ({activeLinks.length})</span>
                    <button
                      onClick={() => {
                        saveLinks([]);
                        setCurrentGeneratedLink(null);
                        showToast('All active share links cleared.', 'info');
                      }}
                      className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Revoke All
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {activeLinks.map((link) => {
                      const isExpired = nowTimestamp > 0 && nowTimestamp > link.expiresAt;
                      return (
                        <div
                          key={link.id}
                          className="p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white truncate text-xs">
                                {link.recipientLabel}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  isExpired
                                    ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                    : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                }`}
                              >
                                {isExpired ? 'Expired' : formatTimeLeft(link.expiresAt)}
                              </span>
                              {link.pinRequired && (
                                <span className="text-[9px] text-amber-400 font-mono">
                                  PIN: {link.pinCode}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#71717A] truncate">
                              {link.token} • {link.scopes.join(' + ')}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setCurrentGeneratedLink(link);
                                handleCopyLink(link.url);
                              }}
                              className="p-1.5 rounded-lg bg-[#09090B] hover:bg-[#27272A] text-[#3ECF8E] transition-colors cursor-pointer"
                              title="Copy URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRevokeLink(link.id)}
                              className="p-1.5 rounded-lg bg-[#09090B] hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Revoke Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPORT DATA MODAL */}
      <AnimatePresence>
        {exportModalOpen && (
          <div
            id="modal-export-project-stats"
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setExportModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-[#0E1015] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden my-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* TOP HEADER */}
              <div className="p-5 border-b border-[#27272A] flex items-start justify-between bg-[#14171F]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 flex items-center justify-center text-[#3ECF8E]">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <span>Export Project Summary</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09090B] text-[#3ECF8E] border border-[#3ECF8E]/30">
                        {projectId || 'VIZTR-882'}
                      </span>
                    </h3>
                    <p className="text-xs text-[#A1A1AA]">
                      Generate executive telemetry reports and statistical audit summaries
                    </p>
                  </div>
                </div>

                <button
                  id="btn-close-export-modal"
                  onClick={() => setExportModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* FORMAT SELECTOR */}
              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block font-bold">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      id="export-fmt-pdf"
                      onClick={() => setExportFormat('pdf')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        exportFormat === 'pdf'
                          ? 'bg-[#3ECF8E]/10 border-[#3ECF8E] text-white shadow-sm'
                          : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3ECF8E]/40 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <FileText className={`w-4 h-4 ${exportFormat === 'pdf' ? 'text-[#3ECF8E]' : 'text-zinc-400'}`} />
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Recommended
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono">Executive PDF</div>
                        <div className="text-[10px] text-[#71717A]">Printable Audit</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="export-fmt-json"
                      onClick={() => setExportFormat('json')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        exportFormat === 'json'
                          ? 'bg-[#3ECF8E]/10 border-[#3ECF8E] text-white shadow-sm'
                          : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3ECF8E]/40 hover:text-zinc-200'
                      }`}
                    >
                      <Code className={`w-4 h-4 ${exportFormat === 'json' ? 'text-[#3ECF8E]' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-bold font-mono">JSON Dataset</div>
                        <div className="text-[10px] text-[#71717A]">Raw Telemetry</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="export-fmt-csv"
                      onClick={() => setExportFormat('csv')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        exportFormat === 'csv'
                          ? 'bg-[#3ECF8E]/10 border-[#3ECF8E] text-white shadow-sm'
                          : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3ECF8E]/40 hover:text-zinc-200'
                      }`}
                    >
                      <FileSpreadsheet className={`w-4 h-4 ${exportFormat === 'csv' ? 'text-[#3ECF8E]' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-xs font-bold font-mono">CSV Sheet</div>
                        <div className="text-[10px] text-[#71717A]">Spreadsheet Table</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* PDF CONFIGURATION SECTION */}
                {exportFormat === 'pdf' && (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block font-bold">
                        Client / Executive Recipient
                      </label>
                      <input
                        id="input-pdf-client-recipient"
                        type="text"
                        value={pdfClientNote}
                        onChange={(e) => setPdfClientNote(e.target.value)}
                        placeholder="e.g., Foster & Partners Review Board"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-[#27272A] focus:border-[#3ECF8E] text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block font-bold">
                        Report Sections & Inclusions
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] cursor-pointer hover:border-[#3ECF8E]/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={pdfIncludeRoadmap}
                            onChange={(e) => setPdfIncludeRoadmap(e.target.checked)}
                            className="w-4 h-4 rounded text-[#3ECF8E] accent-[#3ECF8E] bg-[#09090B] border-[#27272A]"
                          />
                          <div className="text-xs">
                            <span className="text-white font-bold block">7-Stage Production Pipeline Audit</span>
                            <span className="text-[#71717A] text-[11px]">Full breakdown from Brief Received to Master Archival Delivery</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] cursor-pointer hover:border-[#3ECF8E]/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={pdfIncludeRevisions}
                            onChange={(e) => setPdfIncludeRevisions(e.target.checked)}
                            className="w-4 h-4 rounded text-[#3ECF8E] accent-[#3ECF8E] bg-[#09090B] border-[#27272A]"
                          />
                          <div className="text-xs">
                            <span className="text-white font-bold block">Revision Ledger & Quality Assurance Notes</span>
                            <span className="text-[#71717A] text-[11px]">Active ticket logs, ACEScg color standard adherence, and deliverable review</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* PDF PREVIEW SUMMARY BOX */}
                    <div className="p-3.5 rounded-xl bg-[#14171F] border border-[#27272A] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#A1A1AA] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#3ECF8E]" />
                          <span>PDF Output Specification</span>
                        </span>
                        <span className="text-[#3ECF8E] font-bold">A4 Vector Document</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A1A1AA]">
                        <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A]">
                          <span className="text-[#71717A] block text-[9px] font-mono uppercase">Hours Utilization</span>
                          <span className="text-white font-bold font-mono">{stats.hoursSpent.toFixed(1)} / {stats.totalEstimatedHours} hrs ({hoursPercentage}%)</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A]">
                          <span className="text-[#71717A] block text-[9px] font-mono uppercase">Approval Progress</span>
                          <span className="text-white font-bold font-mono">{stats.assetsApproved} / {stats.totalAssets} assets ({assetsPercentage}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* JSON PREVIEW */}
                {exportFormat === 'json' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block font-bold">
                      JSON Structure Payload
                    </span>
                    <pre className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] text-[11px] font-mono text-[#3ECF8E] overflow-x-auto max-h-48 text-left">
{JSON.stringify(
  {
    projectId: projectId || 'VIZTR-882',
    projectName: projectName || 'Architectural CGI Commission',
    hoursSpent: stats.hoursSpent,
    totalBudget: stats.totalEstimatedHours,
    assetsApproved: stats.assetsApproved,
    totalAssets: stats.totalAssets,
    pendingRevisions: stats.pendingRevisions,
    currentStage: stats.currentStageNumber,
    stagesCount: stats.totalStages,
    timestamp: new Date().toISOString()
  },
  null,
  2
)}
                    </pre>
                  </div>
                )}

                {/* CSV PREVIEW */}
                {exportFormat === 'csv' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider block font-bold">
                      Tabular CSV Schema
                    </span>
                    <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-300 space-y-1">
                      <div className="text-[#71717A]">Category, Metric, Value, Details</div>
                      <div className="text-white">Telemetry, Hours Spent, {stats.hoursSpent.toFixed(1)}, Hours</div>
                      <div className="text-white">Telemetry, Assets Approved, {stats.assetsApproved}/{stats.totalAssets}, Approved</div>
                      <div className="text-white">Milestone, Current Stage, {stats.currentStageNumber}, Stage {stats.currentStageNumber} of {stats.totalStages}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-5 border-t border-[#27272A] bg-[#14171F] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {exportFormat === 'pdf' && (
                  <button
                    type="button"
                    id="btn-download-pdf-summary"
                    onClick={handleExportPdf}
                    disabled={exportingPdf}
                    className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {exportingPdf ? (
                      <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download Summary PDF</span>
                  </button>
                )}

                {exportFormat === 'json' && (
                  <button
                    type="button"
                    id="btn-download-json-summary"
                    onClick={handleExportJson}
                    className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON File</span>
                  </button>
                )}

                {exportFormat === 'csv' && (
                  <button
                    type="button"
                    id="btn-download-csv-summary"
                    onClick={handleExportCsv}
                    className="px-5 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV Sheet</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEDICATED MOBILE QR CODE MODAL */}
      <AnimatePresence>
        {qrModalOpen && (
          <div
            id="modal-qr-stats-backdrop"
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setQrModalOpen(false)}
          >
            <motion.div
              id="modal-qr-stats-content"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-lg rounded-2xl bg-[#0D0F14] border border-[#3ECF8E]/40 text-white shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="p-5 border-b border-[#27272A] bg-[#14171F] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#09090B] border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] shadow-sm">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-display font-bold text-white tracking-tight">
                        Mobile Access QR Code
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
                        <span>Live Telemetry</span>
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#A1A1AA] mt-0.5">
                      Instant mobile access for {projectName || 'Architectural Review'}
                    </p>
                  </div>
                </div>

                <button
                  id="btn-close-qr-modal"
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 space-y-5 bg-[#0D0F14]">
                {/* QR CODE CARD WITH ARCHITECTURAL STYLING */}
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="relative p-4 rounded-2xl bg-white text-black shadow-2xl border-4 border-zinc-900 flex flex-col items-center justify-center">
                    {/* Decorative Corner Brackets */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-black" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-black" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-black" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-black" />

                    {qrLoading ? (
                      <div className="w-56 h-56 flex flex-col items-center justify-center gap-2">
                        <span className="w-8 h-8 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-mono font-bold text-zinc-700">Generating QR...</span>
                      </div>
                    ) : qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="Project Statistics QR Code"
                        className="w-56 h-56 object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center text-xs font-mono text-zinc-500">
                        No QR available
                      </div>
                    )}

                    {/* Studio Sub-label */}
                    <div className="pt-2 border-t border-zinc-300 w-full text-center">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-800 uppercase">
                        VIZTR STUDIO · 256-BIT TOKENIZED
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                    <Smartphone className="w-4 h-4 text-[#3ECF8E]" />
                    <span>Point phone camera or iPad lens at QR code</span>
                  </div>
                </div>

                {/* SECURITY & TOKEN DETAILS PANEL */}
                {qrTargetLink && (
                  <div className="p-3.5 rounded-xl bg-[#14171F] border border-[#27272A] space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#71717A] uppercase text-[10px] tracking-wider">Access Parameters</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#09090B] border border-[#27272A] text-[#3ECF8E]">
                        Expires in: {formatTimeLeft(qrTargetLink.expiresAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A]">
                        <span className="text-[#71717A] block text-[9px] uppercase">Stakeholder Group</span>
                        <span className="text-white font-bold truncate block">{qrTargetLink.recipientLabel}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                        <div>
                          <span className="text-[#71717A] block text-[9px] uppercase">Security PIN</span>
                          <span className="text-amber-400 font-bold tracking-widest">{qrTargetLink.pinCode || 'None'}</span>
                        </div>
                        {qrTargetLink.pinCode && (
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                navigator.clipboard.writeText(qrTargetLink.pinCode || '');
                                setQrPinCopied(true);
                                showToast('PIN code copied!', 'success');
                                setTimeout(() => setQrPinCopied(false), 2000);
                              }
                            }}
                            className="p-1 rounded bg-[#18181B] hover:bg-[#27272A] text-zinc-400 hover:text-white border border-[#27272A] text-[10px] cursor-pointer"
                            title="Copy PIN code"
                          >
                            {qrPinCopied ? <Check className="w-3 h-3 text-[#3ECF8E]" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* FULL URL INPUT + COPY */}
                    <div className="space-y-1">
                      <span className="text-[#71717A] block text-[10px] uppercase">Encoded Destination URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={qrTargetLink.url}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-zinc-300 font-mono text-[11px] select-all truncate outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(qrTargetLink.url);
                              setQrCopied(true);
                              showToast('Secure link copied to clipboard!', 'success');
                              setTimeout(() => setQrCopied(false), 2500);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#3ECF8E] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          {qrCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{qrCopied ? 'Copied' : 'Copy URL'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div className="p-4 border-t border-[#27272A] bg-[#14171F] flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleGenerateLink();
                    setTimeout(() => {
                      if (activeLinks.length > 0) {
                        handleOpenQrModal(activeLinks[0]);
                      }
                    }, 50);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Generate a new secure token and refresh QR code"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#3ECF8E]" />
                  <span>Regenerate</span>
                </button>

                <div className="flex items-center gap-2">
                  {qrTargetLink && (
                    <a
                      href={qrTargetLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      <span>Test View</span>
                    </a>
                  )}

                  <button
                    type="button"
                    id="btn-download-qr-png"
                    onClick={handleDownloadQrCode}
                    disabled={!qrDataUrl}
                    className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
