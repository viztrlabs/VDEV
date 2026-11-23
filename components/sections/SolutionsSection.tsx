'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { Building2, Home, Building, Palette, Briefcase, ArrowRight } from 'lucide-react';
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

export default function SolutionsSection() {
 const { solutions: fallback } = homepageData;
 const section = useSiteSection('solutions') ?? getDefaultSection('solutions');
 const eyebrow = getTextField(section, 'eyebrow', 'Solutions');
 const title = getTextField(section, 'title', fallback.title);
 const subtitle = getTextField(section, 'subtitle', fallback.subtitle);
 const cardCtaLabel = getTextField(section, 'cardCtaLabel', 'Learn More');
 const listItems = getListItems(section, 'audiences');
 const audiences = listItems.length
 ? listItems.map((audience) => ({
 id: audience.id,
 title: audience.values.title ?? '',
 description: audience.values.description ?? '',
 icon: audience.meta?.icon ?? '',
 href: audience.meta?.href ?? '#',
 }))
 : fallback.audiences.map((audience) => ({
 id: audience.id,
 title: audience.title,
 description: audience.description,
 icon: audience.icon,
 href: audience.href,
 }));

 const getIcon = (name: string) => {
 const icons: Record<string, React.ReactNode> = {
 Building2: <Building2 className="w-5 h-5"/>,
 Home: <Home className="w-5 h-5"/>,
 Building: <Building className="w-5 h-5"/>,
 Palette: <Palette className="w-5 h-5"/>,
 Briefcase: <Briefcase className="w-5 h-5"/>,
 };
 return icons[name] || <Building2 className="w-5 h-5"/>;
 };

 return (
 <section id="solutions-section"className="py-28 bg-transparent border-y border-[var(--glass-border)] relative">
 <div className="w-full container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <span className="px-4 py-1.5 rounded-full glass-pill text-[#54de99] text-xs font-bold uppercase tracking-widest inline-block mb-4 border border-[#3b494b]">
 <CmsText fieldId="eyebrow" value={eyebrow}/>
 </span>
 <CmsText fieldId="title" value={title} as="h2" className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-display mb-4"/>
 <CmsText fieldId="subtitle" value={subtitle} as="p" rich className="text-lg text-[#B9CACB] font-medium"/>
 </div>

 {/* Solution Cards */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
 {audiences.map((audience) => (
 <Link
 key={audience.id}
 href={audience.href}
 className="p-6 rounded-[2rem] bg-[#131314] border border-[#3b494b] hover:border-[#54de99]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#131314] border border-[#3b494b] flex items-center justify-center mb-4 text-[#54de99] group-hover:border-[#54de99]/50 transition-colors">
 {getIcon(audience.icon)}
 </div>
 <CmsText fieldId="title" listFieldId="audiences" itemId={audience.id} value={audience.title} as="h3" className="text-base font-display font-bold text-[#e5e2e3] mb-2"/>
 <CmsText fieldId="description" listFieldId="audiences" itemId={audience.id} value={audience.description} as="p" rich className="text-xs text-[#B9CACB] leading-relaxed"/>
 </div>
 <div className="pt-5 mt-4 border-t border-[#3b494b]">
 <div className="w-full py-2.5 rounded-full bg-[#131314] group-hover:bg-[#54de99] group-hover:text-black text-[#e5e2e3] border border-[#3b494b] group-hover:border-[#54de99] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
 <CmsText fieldId="cardCtaLabel" value={cardCtaLabel}/>
 <ArrowRight className="w-3.5 h-3.5"/>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 );
}
