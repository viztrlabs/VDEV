'use client';

import React from 'react';
import Link from 'next/link';
import { homepageData } from '@/data/homepage';
import { ArrowRight, ImageIcon, Play, ArrowRight as ArrowRightIcon } from 'lucide-react';
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

export default function StudioSection() {
 const { studio: fallback } = homepageData;
 const section = useSiteSection('studio') ?? getDefaultSection('studio');
 const badge = getTextField(section, 'badge', 'VIZTR STUDIO');
 const title = getTextField(section, 'title', fallback.title);
 const tagline = getTextField(section, 'tagline', fallback.tagline);
 const cardCtaLabel = getTextField(section, 'cardCtaLabel', fallback.cards[0]?.cta.label ?? 'Explore Studio');
 const listItems = getListItems(section, 'cards');
 const cards = listItems.length
 ? listItems.map((card) => ({
 id: card.id,
 title: card.values.title ?? '',
 description: card.values.description ?? '',
 icon: card.meta?.icon ?? '',
 href: card.meta?.href ?? fallback.cards[0]?.cta.href ?? '/studio',
 services: (card.meta?.services ?? '').split('\n').filter(Boolean),
 }))
 : fallback.cards.map((card) => ({
 id: card.id,
 title: card.title,
 description: card.description,
 icon: card.icon,
 href: card.cta.href,
 services: card.services.map((service) => service.label),
 }));

 return (
 <section id="studio-section"className="py-28 px-6 bg-transparent text-white relative">
 <div className="container-ultrawide">
 {/* Section Header */}
 <div className="text-center max-w-2xl mx-auto mb-16">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-sm">
 <CmsText fieldId="badge" value={badge}/>
 </div>
 <CmsText fieldId="title" value={title} as="h2" className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-4"/>
 <CmsText fieldId="tagline" value={tagline} as="p" className="text-lg text-[#e5e2e3]"/>
 </div>

 {/* Studio Cards */}
 <div className="grid md:grid-cols-2 gap-8 w-full">
 {cards.map((card) => (
 <Link
 key={card.id}
 href={card.href}
 className="group p-8 rounded-[2rem] bg-[#131314] border border-[#3b494b] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between shadow-sm"
 >
 <div>
 <div className="w-10 h-10 rounded-full bg-[#131314] border border-[#3b494b] flex items-center justify-center mb-4 text-[#00F0FF] group-hover:border-[#00F0FF]/50 transition-colors">
 {card.icon === 'Image' && <ImageIcon className="w-4 h-4 text-[#00F0FF]"/>}
 {card.icon === 'Play' && <Play className="w-4 h-4 text-[#00F0FF]"/>}
 </div>
 <div className="space-y-3">
 <CmsText fieldId="title" listFieldId="cards" itemId={card.id} value={card.title} as="h3" className="text-2xl font-bold font-display text-[#e5e2e3]"/>
 <CmsText fieldId="description" listFieldId="cards" itemId={card.id} value={card.description} as="p" rich className="text-sm text-[#B9CACB] leading-relaxed"/>
 <ul className="space-y-2 pt-3 border-t border-[#3b494b]">
 {card.services.map((service, index) => (
 <li key={`${card.id}-${index}`} className="flex items-center gap-2 text-xs text-[#B9CACB]">
 <ArrowRightIcon className="w-3 h-3 text-[#00F0FF]/60 group-hover:text-[#00F0FF] transition-colors"/>
 <span className="group-hover:text-white transition-colors">{service}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="pt-5 mt-6 border-t border-[#3b494b]">
 <div className="w-full py-2.5 rounded-full bg-[#131314] group-hover:bg-[#00F0FF] group-hover:text-black text-[#e5e2e3] border border-[#3b494b] group-hover:border-[#00F0FF] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
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
