import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionInstanceProvider, useSectionInstance } from '@/components/site/SectionInstanceContext';
import { getDefaultSection, buildDefaultSiteContent } from '@/lib/site-content';
import { useSiteSection } from '@/lib/use-site-section';
import {
  useSiteContentStore,
  useSiteContentDraftStore,
} from '@/lib/site-content-store';

function Probe() {
  const section = useSiteSection('hero');
  return <span>{section ? (section.fields.find((f) => f.id === 'headline') as any).value : 'none'}</span>;
}

function InstanceProbe() {
  const instance = useSectionInstance();
  if (!instance) return <span data-testid="instance">NONE</span>;
  return (
    <span data-testid="instance">
      {instance.pageId}:{instance.sectionId}:{instance.section.type}
    </span>
  );
}

beforeEach(() => {
  useSiteContentStore.setState({ content: buildDefaultSiteContent() });
  useSiteContentDraftStore.setState({ content: buildDefaultSiteContent() });
});

it('resolves the instance from context', () => {
  const section = getDefaultSection('hero');
  (section.fields.find((f) => f.id === 'headline') as any).value = 'FROM CONTEXT';
  render(<SectionInstanceProvider pageId="home" section={section}><Probe /></SectionInstanceProvider>);
  expect(screen.getByText('FROM CONTEXT')).toBeInTheDocument();
});

it('resolves the published section by type outside a provider', () => {
  const content = buildDefaultSiteContent();
  const hero = content.pages[0].sections.find((s) => s.type === 'hero')!;
  (hero.fields.find((f) => f.id === 'headline') as any).value = 'FROM STORE';
  useSiteContentStore.setState({ content });
  render(<Probe />);
  expect(screen.getByText('FROM STORE')).toBeInTheDocument();
});

it('falls back to the default section when no instance or stored section exists', () => {
  useSiteContentStore.setState({ content: { version: 2, pages: [] } });
  render(<Probe />);
  expect(screen.getByText('VIZTR')).toBeInTheDocument();
});

it('renders duplicated sections independently', () => {
  const content = buildDefaultSiteContent();
  const hero = content.pages[0].sections.find((s) => s.type === 'hero')!;
  const copy = { ...hero, id: 'hero-2', fields: hero.fields.map((f) => ({ ...f })) };
  (copy.fields.find((f) => f.id === 'headline') as any).value = 'COPY';
  content.pages[0].sections = [hero, copy];
  useSiteContentStore.setState({ content });
  render(<><SectionInstanceProvider pageId="home" section={hero}><Probe /></SectionInstanceProvider><SectionInstanceProvider pageId="home" section={copy}><Probe /></SectionInstanceProvider></>);
  expect(screen.getByText('VIZTR')).toBeInTheDocument();
  expect(screen.getByText('COPY')).toBeInTheDocument();
});

it('exposes pageId and sectionId through useSectionInstance', () => {
  const section = getDefaultSection('hero');
  section.id = 'hero-2';
  render(
    <SectionInstanceProvider pageId="home" section={section}>
      <InstanceProbe />
    </SectionInstanceProvider>,
  );
  expect(screen.getByTestId('instance')).toHaveTextContent('home:hero-2:hero');
});

it('returns no instance outside a provider', () => {
  render(<InstanceProbe />);
  expect(screen.getByTestId('instance')).toHaveTextContent('NONE');
});
