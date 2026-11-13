import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import StudioSection from '@/components/sections/StudioSection';
import XRWorldSection from '@/components/sections/XRWorldSection';
import CreatorSection from '@/components/sections/CreatorSection';
import SolutionsSection from '@/components/sections/SolutionsSection';
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

it('studio renders seeded badge, title, and card services', () => {
  renderWith('studio', <StudioSection />);
  expect(screen.getByText('VIZTR STUDIO')).toBeInTheDocument();
  expect(screen.getByText('VizTR Studio')).toBeInTheDocument();
  expect(screen.getByText('Exterior Rendering')).toBeInTheDocument();
});

it('xr world renders experience names from the list', () => {
  const { section } = renderWith('xr-world', <XRWorldSection />);
  const names = getListItems(section, 'experiences').map((i) => i.values.name);
  expect(screen.getByText(names[0])).toBeInTheDocument();
});

it('creator renders tool names from the list', () => {
  const { section } = renderWith('creator', <CreatorSection />);
  const names = getListItems(section, 'tools').map((i) => i.values.name);
  expect(screen.getByText(names[0])).toBeInTheDocument();
});

it('solutions renders audience titles from the list', () => {
  const { section } = renderWith('solutions', <SolutionsSection />);
  const titles = getListItems(section, 'audiences').map((i) => i.values.title);
  expect(screen.getByText(titles[0])).toBeInTheDocument();
});

it('studio reads badge, card copy, and card CTA label from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'studio', 'badge', 'STUDIO BADGE EDIT');
  editText(content, 'studio', 'cardCtaLabel', 'ENTER STUDIO');
  editItem(content, 'studio', 'cards', 'still-renders', { title: 'CARD TITLE EDIT' });
  useSiteContentStore.setState({ content });
  render(<StudioSection />);
  expect(screen.getByText('STUDIO BADGE EDIT')).toBeInTheDocument();
  expect(screen.getByText('CARD TITLE EDIT')).toBeInTheDocument();
  expect(screen.getAllByText('ENTER STUDIO')).toHaveLength(2);
});

it('xr world reads eyebrow, card CTA template, and experience copy from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'xr-world', 'eyebrow', 'XR EYEBROW EDIT');
  editText(content, 'xr-world', 'cardCtaTemplate', 'Dive into {name}');
  editItem(content, 'xr-world', 'experiences', 'webxr', { name: 'EXPERIENCE NAME EDIT', purpose: 'PURPOSE EDIT' });
  useSiteContentStore.setState({ content });
  render(<XRWorldSection />);
  expect(screen.getByText('XR EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('EXPERIENCE NAME EDIT')).toBeInTheDocument();
  expect(screen.getByText('PURPOSE EDIT')).toBeInTheDocument();
  expect(screen.getByText('Dive into EXPERIENCE NAME EDIT')).toBeInTheDocument();
});

it('creator reads labels and tool copy from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'creator', 'comingSoonLabel', 'SHIPPING SOON');
  editText(content, 'creator', 'openToolLabel', 'LAUNCH');
  editItem(content, 'creator', 'tools', '3d-editor', { name: 'TOOL NAME EDIT', description: 'TOOL DESCRIPTION EDIT' });
  useSiteContentStore.setState({ content });
  render(<CreatorSection />);
  expect(screen.getByText('TOOL NAME EDIT')).toBeInTheDocument();
  expect(screen.getByText('TOOL DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getAllByText('SHIPPING SOON').length).toBeGreaterThan(0);
  expect(screen.getAllByText('LAUNCH').length).toBeGreaterThan(0);
});

it('solutions reads card CTA label and audience copy from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'solutions', 'subtitle', 'SUBTITLE EDIT');
  editText(content, 'solutions', 'cardCtaLabel', 'READ MORE');
  editItem(content, 'solutions', 'audiences', 'architects', { title: 'AUDIENCE TITLE EDIT', description: 'AUDIENCE DESCRIPTION EDIT' });
  useSiteContentStore.setState({ content });
  render(<SolutionsSection />);
  expect(screen.getByText('SUBTITLE EDIT')).toBeInTheDocument();
  expect(screen.getByText('AUDIENCE TITLE EDIT')).toBeInTheDocument();
  expect(screen.getByText('AUDIENCE DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getAllByText('READ MORE').length).toBeGreaterThan(0);
});
