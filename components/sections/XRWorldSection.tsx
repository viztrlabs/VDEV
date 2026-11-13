'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { ArrowRight, Box, ScanLine, Headset, Compass, Sparkles, Cpu } from 'lucide-react';
import { useSiteSection } from '@/lib/use-site-section';
import { getDefaultSection, getListItems, getTextField } from '@/lib/site-content';
import { sanitizeRichText } from '@/lib/sanitize-rich-text';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import { useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';

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

export default function XRWorldSection() {
 const { xrWorld: fallback } = homepageData;
 const section = useSiteSection('xr-world') ?? getDefaultSection('xr-world');
 const eyebrow = getTextField(section, 'eyebrow', 'Section 02');
 const title = getTextField(section, 'title', fallback.title);
 const tagline = getTextField(section, 'tagline', fallback.tagline);
 const ctaLabel = getTextField(section, 'ctaLabel', fallback.cta.label);
 const cardCtaTemplate = getTextField(section, 'cardCtaTemplate', 'Explore {name}');
 const listItems = getListItems(section, 'experiences');
 const experiences = listItems.length
 ? listItems.map((experience) => ({
 id: experience.id,
 name: experience.values.name ?? '',
 purpose: experience.values.purpose ?? '',
 badge: experience.values.badge ?? '',
 icon: experience.meta?.icon ?? '',
 href: experience.meta?.href ?? '#',
 }))
 : fallback.experiences.map((experience) => ({
 id: experience.id,
 name: experience.name,
 purpose: experience.purpose,
 badge: experience.badge ?? '',
 icon: experience.icon,
 href: experience.href,
 }));

 const getIcon = (name: string) => {
 const icons: Record<string, React.ReactNode> = {
 Box: <Box className="w-5 h-5"/>,
 ScanLine: <ScanLine className="w-5 h-5"/>,
 Headset: <Headset className="w-5 h-5"/>,
 Compass: <Compass className="w-5 h-5"/>,
 Sparkles: <Sparkles className="w-5 h-5"/>,
 Cpu: <Cpu className="w-5 h-5"/>,
 };
 return icons[name] || <Box className="w-5 h-5"/>;
 };

 return (
 <section id="xr-world-section"className="py-28 px-6 bg-transparent border-y border-[var(--glass-border)] relative">
 <div className="container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <span className="px-4 py-1.5 rounded-full glass-pill text-[#42CF8B] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#1E293B]">
 <CmsText fieldId="eyebrow" value={eyebrow}/>
 </span>
 <CmsText fieldId="title" value={title} as="h2" className="text-fluid-h2 font-bold tracking-tight text-white font-display mb-4"/>
 <CmsText fieldId="tagline" value={tagline} as="p" className="text-lg text-[#B9CACB] font-medium prose-readable mx-auto"/>
 </div>

 {/* Experience Cards Grid */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 grid-ultrawide-3 gap-6 w-full">
 {experiences.map((exp) => (
 <Link
 key={exp.id}
 href={exp.href}
 className="p-6 rounded-[2rem] bg-[#131314] border border-[#1E293B] hover:border-[#42CF8B]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#0A0A0B] border border-[#1E293B] flex items-center justify-center mb-4 text-[#42CF8B] group-hover:border-[#42CF8B]/50 transition-colors">
 {getIcon(exp.icon)}
 </div>
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <CmsText fieldId="name" listFieldId="experiences" itemId={exp.id} value={exp.name} as="h3" className="text-base font-display font-bold text-[#FAFAFA]"/>
 {exp.badge && (
 <CmsText fieldId="badge" listFieldId="experiences" itemId={exp.id} value={exp.badge} as="span" className="px-2.5 py-0.5 rounded-full bg-[#0A0A0B] border border-[#42CF8B]/35 text-[#42CF8B] text-[9px] font-extrabold uppercase tracking-wider"/>
 )}
 </div>
 <CmsText fieldId="purpose" listFieldId="experiences" itemId={exp.id} value={exp.purpose} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
 </div>
 </div>
 <div className="pt-5 mt-4 border-t border-[#1E293B]">
 <div className="w-full py-2.5 rounded-full bg-[#0A0A0B] group-hover:bg-[#42CF8B] group-hover:text-black text-[#FAFAFA] border border-[#1E293B] group-hover:border-[#42CF8B] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
 <CmsText fieldId="cardCtaTemplate" value={cardCtaTemplate.replace('{name}', exp.name)}/>
 <ArrowRight className="w-3.5 h-3.5"/>
 </div>
 </div>
 </Link>
 ))}
 </div>

 {/* CTA */}
 <div className="text-center mt-12">
 <Link
 href={fallback.cta.href}
 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#42CF8B] hover:bg-[#58dc9b] text-black font-bold text-sm transition-all hover:scale-105"
 >
 <CmsText fieldId="ctaLabel" value={ctaLabel}/>
 <ArrowRight className="w-4 h-4"/>
 </Link>
 </div>
 </div>
 </section>
 );
}
