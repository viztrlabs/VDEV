'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { Box, Sparkles, Layers, PenTool, Zap, ExternalLink, ArrowRight } from 'lucide-react';
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

export default function CreatorSection() {
 const { creator: fallback } = homepageData;
 const section = useSiteSection('creator') ?? getDefaultSection('creator');
 const eyebrow = getTextField(section, 'eyebrow', 'Creator');
 const title = getTextField(section, 'title', fallback.title);
 const tagline = getTextField(section, 'tagline', fallback.tagline);
 const openToolLabel = getTextField(section, 'openToolLabel', 'Open Tool');
 const comingSoonLabel = getTextField(section, 'comingSoonLabel', 'Coming Soon');
 const ctaLabel = getTextField(section, 'ctaLabel', fallback.cta.label);
 const listItems = getListItems(section, 'tools');
 const tools = listItems.length
 ? listItems.map((tool) => ({
 id: tool.id,
 name: tool.values.name ?? '',
 description: tool.values.description ?? '',
 icon: tool.meta?.icon ?? '',
 href: tool.meta?.href ?? '#',
 comingSoon: tool.meta?.comingSoon === 'true',
 }))
 : fallback.tools.map((tool) => ({
 id: tool.id,
 name: tool.name,
 description: tool.description,
 icon: tool.icon,
 href: tool.href,
 comingSoon: tool.comingSoon ?? false,
 }));

 const getIcon = (name: string) => {
 const icons: Record<string, React.ReactNode> = {
 Box: <Box className="w-5 h-5"/>,
 Sparkles: <Sparkles className="w-5 h-5"/>,
 Layers: <Layers className="w-5 h-5"/>,
 PenTool: <PenTool className="w-5 h-5"/>,
 Zap: <Zap className="w-5 h-5"/>,
 ExternalLink: <ExternalLink className="w-5 h-5"/>,
 };
 return icons[name] || <Box className="w-5 h-5"/>;
 };

 return (
 <section id="creator-section"className="py-28 bg-transparent text-white relative">
 <div className="w-full container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <span className="px-4 py-1.5 rounded-full glass-pill text-[#00F0FF] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#3b494b]">
 <CmsText fieldId="eyebrow" value={eyebrow}/>
 </span>
 <CmsText fieldId="title" value={title} as="h2" className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-display mb-4"/>
 <CmsText fieldId="tagline" value={tagline} as="p" className="text-lg text-[#B9CACB] font-medium"/>
 </div>

 {/* Tools Grid */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
 {tools.map((tool) => (
 <div
 key={tool.id}
 className={`p-6 rounded-[2rem] bg-[#131314] border border-[#3b494b] flex flex-col justify-between group shadow-sm transition-all duration-300 ${
 tool.comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00F0FF]/40 '
 }`}
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#131314] border border-[#3b494b] flex items-center justify-center mb-4 text-[#00F0FF] group-hover:border-[#00F0FF]/50 transition-colors">
 {getIcon(tool.icon)}
 </div>
 <CmsText fieldId="name" listFieldId="tools" itemId={tool.id} value={tool.name} as="h3" className="text-base font-display font-bold text-[#e5e2e3] mb-2"/>
 <CmsText fieldId="description" listFieldId="tools" itemId={tool.id} value={tool.description} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed mb-4"/>
 </div>

 <div className="pt-5 mt-4 border-t border-[#3b494b]">
 {tool.comingSoon ? (
 <div className="w-full py-2.5 rounded-full bg-[#131314] text-zinc-500 border border-[#3b494b] text-xs font-bold uppercase tracking-wider text-center">
 <CmsText fieldId="comingSoonLabel" value={comingSoonLabel}/>
 </div>
 ) : (
 <Link
 href={tool.href}
 className="w-full py-2.5 rounded-full bg-[#131314] hover:bg-[#00F0FF] hover:text-black text-[#e5e2e3] border border-[#3b494b] hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
 >
 <CmsText fieldId="openToolLabel" value={openToolLabel}/>
 <ArrowRight className="w-3.5 h-3.5"/>
 </Link>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* CTA */}
 <div className="text-center">
 <Link
 href={fallback.cta.href}
 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#33f3ff] text-black font-extrabold text-sm transition-all hover:scale-105"
 >
 <CmsText fieldId="ctaLabel" value={ctaLabel}/>
 <ArrowRight className="w-4 h-4"/>
 </Link>
 </div>
 </div>
 </section>
 );
}
