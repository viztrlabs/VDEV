import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import UseCasesSection from '@/components/sections/UseCasesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FAQSection from '@/components/sections/FAQSection';
import { EditModeProvider } from '@/components/admin/live-editor/in-context/EditModeContext';
import { buildDefaultSiteContent, getDefaultSection, getListItems } from '@/lib/site-content';
import { useSiteContentStore } from '@/lib/site-content-store';

function renderWith(type: any, ui: React.ReactNode) {
  const section = getDefaultSection(type);
  return { section, ...render(<SectionInstanceProvider pageId="home" section={section}>{ui}</SectionInstanceProvider>) };
}

function editText(content: ReturnType<typeof buildDefaultSiteContent>, type: string, fieldId: string, value: string) {
  const section = content.pages[0].sections.find((s) => s.type === type)!;
  section.fields = section.fields.map((field) =>
    field.kind === 'text' && field.id === fieldId ? { ...field, value } : field,
  );
}

function editItem(
  content: ReturnType<typeof buildDefaultSiteContent>,
  type: string,
  listId: string,
  itemId: string,
  values: Record<string, string>,
) {
  const section = content.pages[0].sections.find((s) => s.type === type)!;
  section.fields = section.fields.map((field) =>
    field.kind === 'list' && field.id === listId
      ? {
          ...field,
          items: field.items.map((item) =>
            item.id === itemId ? { ...item, values: { ...item.values, ...values } } : item,
          ),
        }
      : field,
  );
}

afterEach(() => {
  useSiteContentStore.setState({ content: buildDefaultSiteContent() });
});

it('use cases renders tabs from the cases list', () => {
  const { section } = renderWith('use-cases', <UseCasesSection />);
  const audiences = getListItems(section, 'cases').map((i) => i.values.audience);
  expect(screen.getByRole('button', { name: audiences[0] })).toBeInTheDocument();
});

it('testimonials renders quotes and stats from lists', () => {
  const { section } = renderWith('testimonials', <TestimonialsSection />);
  expect(screen.getByText(new RegExp(getListItems(section, 'testimonials')[0].values.clientName))).toBeInTheDocument();
  expect(screen.getByText(getListItems(section, 'stats')[0].values.value)).toBeInTheDocument();
});

it('faq renders questions and the first answer', () => {
  const { section } = renderWith('faq', <FAQSection />);
  const items = getListItems(section, 'faq');
  expect(screen.getByText(items[0].values.q)).toBeInTheDocument();
  expect(screen.getByText(items[0].values.a)).toBeInTheDocument();
});

it('use cases reads header copy, panel labels, and case copy from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'use-cases', 'eyebrow', 'USE CASES EYEBROW EDIT');
  editText(content, 'use-cases', 'heading', 'USE CASES HEADING EDIT');
  editText(content, 'use-cases', 'description', 'USE CASES DESCRIPTION EDIT');
  editText(content, 'use-cases', 'panelEyebrow', 'PANEL EYEBROW EDIT');
  editText(content, 'use-cases', 'challengeLabel', 'CHALLENGE LABEL EDIT');
  editText(content, 'use-cases', 'solutionLabel', 'SOLUTION LABEL EDIT');
  editText(content, 'use-cases', 'impactLabel', 'IMPACT LABEL EDIT');
  editItem(content, 'use-cases', 'cases', 'case-1', {
    audience: 'CASE AUDIENCE EDIT',
    problem: 'CASE PROBLEM EDIT',
    solution: 'CASE SOLUTION EDIT',
    benefit: 'CASE BENEFIT EDIT',
  });
  useSiteContentStore.setState({ content });
  render(<UseCasesSection />);
  expect(screen.getByText('USE CASES EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('USE CASES HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('USE CASES DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('PANEL EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('CHALLENGE LABEL EDIT')).toBeInTheDocument();
  expect(screen.getByText('SOLUTION LABEL EDIT')).toBeInTheDocument();
  expect(screen.getByText('IMPACT LABEL EDIT')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'CASE AUDIENCE EDIT' })).toBeInTheDocument();
  expect(screen.getAllByText('CASE AUDIENCE EDIT').length).toBeGreaterThan(1);
  expect(screen.getByText('CASE PROBLEM EDIT')).toBeInTheDocument();
  expect(screen.getByText('CASE SOLUTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('CASE BENEFIT EDIT')).toBeInTheDocument();
});

it('testimonials reads header copy, testimonial items, and stats from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'testimonials', 'eyebrow', 'TESTIMONIALS EYEBROW EDIT');
  editText(content, 'testimonials', 'heading', 'TESTIMONIALS HEADING EDIT');
  editText(content, 'testimonials', 'description', 'TESTIMONIALS DESCRIPTION EDIT');
  editItem(content, 'testimonials', 'testimonials', 'testimonial-1', {
    quote: 'TESTIMONIAL QUOTE EDIT',
    clientName: 'TESTIMONIAL NAME EDIT',
    role: 'TESTIMONIAL ROLE EDIT',
  });
  editItem(content, 'testimonials', 'stats', 'stat-1', {
    value: 'STAT VALUE EDIT',
    label: 'STAT LABEL EDIT',
  });
  useSiteContentStore.setState({ content });
  render(<TestimonialsSection />);
  expect(screen.getByText('TESTIMONIALS EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('TESTIMONIALS HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('TESTIMONIALS DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('TESTIMONIAL QUOTE EDIT')).toBeInTheDocument();
  expect(screen.getByText('TESTIMONIAL NAME EDIT')).toBeInTheDocument();
  expect(screen.getByText('TESTIMONIAL ROLE EDIT')).toBeInTheDocument();
  expect(screen.getByText('STAT VALUE EDIT')).toBeInTheDocument();
  expect(screen.getByText('STAT LABEL EDIT')).toBeInTheDocument();
});

it('faq reads header copy and accordion copy from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'faq', 'eyebrow', 'FAQ EYEBROW EDIT');
  editText(content, 'faq', 'heading', 'FAQ HEADING EDIT');
  editText(content, 'faq', 'description', 'FAQ DESCRIPTION EDIT');
  editItem(content, 'faq', 'faq', 'faq-1', {
    q: 'FAQ QUESTION EDIT',
    a: 'FAQ ANSWER EDIT',
  });
  useSiteContentStore.setState({ content });
  render(<FAQSection />);
  expect(screen.getByText('FAQ EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('FAQ HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('FAQ DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('FAQ QUESTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('FAQ ANSWER EDIT')).toBeInTheDocument();
});

it('exposes editable fields only when edit mode is on', () => {
  const useCases = getDefaultSection('use-cases');
  const testimonials = getDefaultSection('testimonials');
  const faq = getDefaultSection('faq');

  const { container, unmount } = render(
    <>
      <SectionInstanceProvider pageId="home" section={useCases}><UseCasesSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={testimonials}><TestimonialsSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={faq}><FAQSection /></SectionInstanceProvider>
    </>,
  );
  expect(container.querySelectorAll('[data-cms-field]')).toHaveLength(0);
  unmount();

  render(
    <EditModeProvider initial={{ editMode: true }}>
      <SectionInstanceProvider pageId="home" section={useCases}><UseCasesSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={testimonials}><TestimonialsSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={faq}><FAQSection /></SectionInstanceProvider>
    </EditModeProvider>,
  );
  expect(screen.getAllByText('Built For Your Industry')[0].closest('[data-cms-field]')).not.toBeNull();
  expect(screen.getByText('The Challenge').closest('[data-cms-field]')?.getAttribute('data-cms-field')).toBe('challengeLabel');
  expect(screen.getAllByText('Real Estate Developers')[0].closest('[data-cms-list-field]')).toBeNull();
  expect(screen.getByText('Struggling to sell off-plan luxury residences before physical construction begins.').closest('[data-cms-list-field]')?.getAttribute('data-cms-list-field')).toBe('cases');
  expect(screen.getAllByText('Kenji Takahashi')[0].closest('[data-cms-list-field]')?.getAttribute('data-cms-list-field')).toBe('testimonials');
  expect(screen.getByText('200+').closest('[data-cms-list-field]')?.getAttribute('data-cms-list-field')).toBe('stats');
  const question = screen.getByText('What file formats can I provide for architectural visualization?');
  expect(question.closest('[data-cms-field]')).toBeNull();
  expect(question.closest('[data-cms-list-field]')).toBeNull();
  expect(screen.getByText('We accept Revit (.rvt), Rhino (.3dm), SketchUp (.skp), ArchiCAD (.pln), AutoCAD (.dwg), 3ds Max (.max), FBX, and IFC files along with reference photography or PDF moodboards.').closest('[data-cms-list-field]')?.getAttribute('data-cms-list-field')).toBe('faq');
});
