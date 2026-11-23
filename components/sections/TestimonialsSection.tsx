'use client';

import React from 'react';
import { Star } from 'lucide-react';
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

export default function TestimonialsSection() {
  const section = useSiteSection('testimonials') ?? getDefaultSection('testimonials');
  const eyebrow = getTextField(section, 'eyebrow', 'CLIENT ENDORSEMENTS & METRICS');
  const heading = getTextField(section, 'heading', 'What Clients Say');
  const description = getTextField(
    section,
    'description',
    'Trusted by premier architects, sovereign wealth developers, and luxury interior studios worldwide.',
  );
  const testimonials = getListItems(section, 'testimonials').map((testimonial) => ({
    id: testimonial.id,
    quote: testimonial.values.quote ?? '',
    clientName: testimonial.values.clientName ?? '',
    role: testimonial.values.role ?? '',
    rating: Math.max(0, Math.min(5, Number.parseInt(testimonial.meta?.rating ?? '0', 10) || 0)),
  }));
  const stats = getListItems(section, 'stats').map((stat) => ({
    id: stat.id,
    value: stat.values.value ?? '',
    label: stat.values.label ?? '',
  }));

  return (
    <section id="testimonials-section"className="py-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#3b494b]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#54de99] animate-pulse"/>
            <CmsText fieldId="eyebrow" value={eyebrow} className="text-[11px] font-bold uppercase tracking-widest text-[#54de99]"/>
          </div>
          <CmsText fieldId="heading" value={heading} as="h2" className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#e5e2e3]"/>
        </div>
        <CmsText fieldId="description" value={description} as="p" rich className="text-xs sm:text-sm text-[#B9CACB] max-w-md"/>
      </div>

      {/* TESTIMONIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-[2rem] bg-[#131314] border border-[#3b494b] hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#00F0FF]">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#00F0FF]"/>
                ))}
              </div>
              <p className="text-sm text-[#e5e2e3] leading-relaxed italic">
                &ldquo;<CmsText fieldId="quote" listFieldId="testimonials" itemId={t.id} value={t.quote} rich/>&rdquo;
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-[#3b494b]">
              <CmsText fieldId="clientName" listFieldId="testimonials" itemId={t.id} value={t.clientName} as="h4" className="text-sm font-display font-bold text-[#e5e2e3]"/>
              <CmsText fieldId="role" listFieldId="testimonials" itemId={t.id} value={t.role} as="p" className="text-xs text-[#B9CACB] mt-0.5"/>
            </div>
          </div>
        ))}
      </div>

      {/* STATS ROW */}
      <div className="p-8 rounded-[2rem] bg-[#131314] text-white border border-[#3b494b] grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xl">
        {stats.map((s) => (
          <div key={s.id} className="space-y-1">
            <CmsText fieldId="value" listFieldId="stats" itemId={s.id} value={s.value} as="div" className="text-3xl sm:text-4xl font-extrabold font-display text-[#00F0FF]"/>
            <CmsText fieldId="label" listFieldId="stats" itemId={s.id} value={s.label} as="div" className="text-xs font-bold uppercase tracking-wider text-[#B9CACB]"/>
          </div>
        ))}
      </div>
    </section>
  );
}
