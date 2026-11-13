'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Palette, Box, BarChart3, Wrench } from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getListItems, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Box,
  BarChart3,
  Wrench,
};

const STAGE_STATUS_COLORS: Record<string, string> = {
  modeling: 'text-[#42CF8B]',
  visualization: 'text-[#F59E0B]',
  'xr-experience': 'text-[#00F0FF]',
};

function CmsText({
  fieldId,
  listFieldId,
  itemId,
  value,
  as: Tag = 'span',
  className,
  rich,
}: {
  fieldId: string;
  listFieldId?: string;
  itemId?: string;
  value: string;
  as?: React.ElementType;
  className?: string;
  rich?: boolean;
}) {
  const { editMode } = useEditMode();
  if (editMode) {
    return <EditableText fieldId={fieldId} listFieldId={listFieldId} itemId={itemId} as={Tag} className={className}/>;
  }
  if (rich) return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}/>;
  return <Tag className={className}>{value}</Tag>;
}

export default function FourPillarsSection() {
  const section = useSiteSection('four-pillars') ?? getDefaultSection('four-pillars');
  const eyebrow = getTextField(section, 'eyebrow', 'THE VIZTR PLATFORM');
  const heading = getTextField(section, 'heading', 'Four Pillars. One Vision.');
  const subheading = getTextField(section, 'subheading', 'From visualization to experience — from creation to delivery.');
  const pillarCtaLabel = getTextField(section, 'pillarCtaLabel', 'Explore');
  const previewProjectName = getTextField(section, 'previewProjectName', 'LUXURY SMART VILLA');
  const previewProjectId = getTextField(section, 'previewProjectId', 'Project #VTR-2048');
  const previewProgressValue = getTextField(section, 'previewProgressValue', '78%');
  const previewStatusLabel = getTextField(section, 'previewStatusLabel', 'In Progress');
  const previewLastUpdate = getTextField(section, 'previewLastUpdate', 'Last update · 12 min ago');
  const previewCtaLabel = getTextField(section, 'previewCtaLabel', 'Review Project');

  const pillars = getListItems(section, 'pillars').map((pillar) => ({
    id: pillar.id,
    number: pillar.values.number ?? '',
    title: pillar.values.title ?? '',
    verb: pillar.values.verb ?? '',
    description: pillar.values.description ?? '',
    icon: pillar.meta?.icon ?? '',
    href: pillar.meta?.href ?? '#',
    color: pillar.meta?.color ?? 'text-[#00F0FF]',
    bgColor: pillar.meta?.bgColor ?? 'bg-[#00F0FF]/10',
  }));

  const previewStages = getListItems(section, 'previewStages').map((stage) => ({
    id: stage.id,
    label: stage.values.label ?? '',
    status: stage.meta?.status ?? '',
  }));

  const stageStatus = (stageId: string, fallback: string) => {
    if (stageId === 'visualization') return previewProgressValue;
    if (stageId === 'xr-experience') return previewStatusLabel;
    return fallback;
  };

  return (
    <section
      id="four-pillars-section"
      className="py-20 px-4 sm:px-6 bg-[#0A0A0B] text-white border-y border-[#1E293B] relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#42CF8B] animate-pulse" />
            <CmsText fieldId="eyebrow" value={eyebrow} className="text-[11px] font-bold uppercase tracking-widest text-[#42CF8B]"/>
          </div>
          <CmsText fieldId="heading" value={heading} as="h2" className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[#FAFAFA] mb-4"/>
          <CmsText fieldId="subheading" value={subheading} as="p" rich className="text-sm sm:text-base text-[#B9CACB] max-w-2xl mx-auto"/>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.icon] ?? Box;
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                className="group relative p-6 rounded-[1.5rem] bg-[#131314] border border-[#1E293B] hover:border-[#42CF8B]/40 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:shadow-[#42CF8B]/5"
              >
                {/* Number */}
                <CmsText fieldId="number" listFieldId="pillars" itemId={pillar.id} value={pillar.number} className="text-[10px] font-mono font-bold text-[#71717A] tracking-widest mb-4"/>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${pillar.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${pillar.color}`} />
                </div>

                {/* Title */}
                <CmsText fieldId="title" listFieldId="pillars" itemId={pillar.id} value={pillar.title} as="h3" className="text-lg font-display font-bold text-[#FAFAFA] mb-1"/>

                {/* Verb */}
                <CmsText fieldId="verb" listFieldId="pillars" itemId={pillar.id} value={pillar.verb} as="p" className={`text-sm font-semibold ${pillar.color} mb-3`}/>

                {/* Description */}
                <CmsText fieldId="description" listFieldId="pillars" itemId={pillar.id} value={pillar.description} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed mb-5"/>

                {/* CTA */}
                <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-[#FAFAFA] group-hover:text-[#42CF8B] transition-colors">
                  <CmsText fieldId="pillarCtaLabel" value={pillarCtaLabel}/>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Project Hub Preview Card */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="p-5 rounded-2xl bg-[#131314] border border-[#1E293B]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <CmsText fieldId="previewProjectName" value={previewProjectName} as="p" className="text-sm font-bold text-[#FAFAFA]"/>
                <CmsText fieldId="previewProjectId" value={previewProjectId} as="p" className="text-[10px] font-mono text-[#71717A]"/>
              </div>
            </div>
            <div className="space-y-2.5 mb-4">
              {previewStages.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between">
                  <CmsText fieldId="label" listFieldId="previewStages" itemId={stage.id} value={stage.label} className="text-xs text-[#B9CACB]"/>
                  {stage.id === 'visualization' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: previewProgressValue }} />
                      </div>
                      <span className="text-xs font-mono text-[#F59E0B]">{stageStatus(stage.id, stage.status)}</span>
                    </div>
                  ) : (
                    <span className={`text-xs font-mono ${STAGE_STATUS_COLORS[stage.id] ?? 'text-[#71717A]'}`}>{stageStatus(stage.id, stage.status)}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
              <CmsText fieldId="previewLastUpdate" value={previewLastUpdate} className="text-[10px] font-mono text-[#71717A]"/>
              <Link
                href="/track-project"
                className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1"
              >
                <CmsText fieldId="previewCtaLabel" value={previewCtaLabel} /> <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
