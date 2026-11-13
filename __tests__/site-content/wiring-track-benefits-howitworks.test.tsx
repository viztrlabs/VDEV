import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import TrackProjectSection from '@/components/sections/TrackProjectSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
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

it('track project renders header copy from fields', () => {
  renderWith('track-project', <TrackProjectSection />);
  expect(screen.getByText('Track Active Pipeline Milestone')).toBeInTheDocument();
});

it('benefits renders seeded benefit titles', () => {
  const { section } = renderWith('benefits', <BenefitsSection />);
  expect(screen.getByText(getListItems(section, 'benefits')[0].values.title)).toBeInTheDocument();
});

it('how it works renders steps and sync label', () => {
  const { section } = renderWith('how-it-works', <HowItWorksSection />);
  expect(screen.getByText(getListItems(section, 'steps')[0].values.title)).toBeInTheDocument();
  expect(screen.getAllByText('Full Portal Sync').length).toBeGreaterThan(0);
});

it('track project reads edited header copy from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'track-project', 'eyebrow', 'TRACK EYEBROW EDIT');
  editText(content, 'track-project', 'heading', 'TRACK HEADING EDIT');
  editText(content, 'track-project', 'description', 'TRACK DESCRIPTION EDIT');
  useSiteContentStore.setState({ content });
  render(<TrackProjectSection />);
  expect(screen.getByText('TRACK EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('TRACK HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('TRACK DESCRIPTION EDIT')).toBeInTheDocument();
});

it('benefits reads header copy and benefit items from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'benefits', 'eyebrow', 'BENEFITS EYEBROW EDIT');
  editText(content, 'benefits', 'heading', 'BENEFITS HEADING EDIT');
  editText(content, 'benefits', 'description', 'BENEFITS DESCRIPTION EDIT');
  editItem(content, 'benefits', 'benefits', 'benefit-1', {
    title: 'BENEFIT TITLE EDIT',
    desc: 'BENEFIT DESCRIPTION EDIT',
  });
  useSiteContentStore.setState({ content });
  render(<BenefitsSection />);
  expect(screen.getByText('BENEFITS EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('BENEFITS HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('BENEFITS DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('BENEFIT TITLE EDIT')).toBeInTheDocument();
  expect(screen.getByText('BENEFIT DESCRIPTION EDIT')).toBeInTheDocument();
});

it('how it works reads header copy, sync label, and steps from fields', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'how-it-works', 'eyebrow', 'STEPS EYEBROW EDIT');
  editText(content, 'how-it-works', 'heading', 'STEPS HEADING EDIT');
  editText(content, 'how-it-works', 'description', 'STEPS DESCRIPTION EDIT');
  editText(content, 'how-it-works', 'syncLabel', 'SYNC LABEL EDIT');
  editItem(content, 'how-it-works', 'steps', 'step-1', {
    title: 'STEP TITLE EDIT',
    desc: 'STEP DESCRIPTION EDIT',
  });
  useSiteContentStore.setState({ content });
  render(<HowItWorksSection />);
  expect(screen.getByText('STEPS EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('STEPS HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('STEPS DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('STEP TITLE EDIT')).toBeInTheDocument();
  expect(screen.getByText('STEP DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getAllByText('SYNC LABEL EDIT').length).toBeGreaterThan(0);
});

it('exposes editable fields only when edit mode is on', () => {
  const track = getDefaultSection('track-project');
  const benefits = getDefaultSection('benefits');
  const steps = getDefaultSection('how-it-works');

  const { container, unmount } = render(
    <>
      <SectionInstanceProvider pageId="home" section={track}><TrackProjectSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={benefits}><BenefitsSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={steps}><HowItWorksSection /></SectionInstanceProvider>
    </>,
  );
  expect(container.querySelectorAll('[data-cms-field]')).toHaveLength(0);
  unmount();

  render(
    <EditModeProvider initial={{ editMode: true }}>
      <SectionInstanceProvider pageId="home" section={track}><TrackProjectSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={benefits}><BenefitsSection /></SectionInstanceProvider>
      <SectionInstanceProvider pageId="home" section={steps}><HowItWorksSection /></SectionInstanceProvider>
    </EditModeProvider>,
  );
  expect(screen.getAllByText('Track Active Pipeline Milestone')[0].closest('[data-cms-field]')).not.toBeNull();
  expect(screen.getByText('Premium Visual Presentation').closest('[data-cms-list-field]')?.getAttribute('data-cms-list-field')).toBe('benefits');
  expect(screen.getByText('Share Requirements').closest('[data-cms-list-field]')?.getAttribute('data-cms-list-field')).toBe('steps');
});
