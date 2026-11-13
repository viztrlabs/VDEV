import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import FourPillarsSection from '@/components/sections/FourPillarsSection';
import XRExperienceSection from '@/components/sections/XRExperienceSection';
import PortfolioPreview from '@/components/sections/PortfolioPreview';
import { buildDefaultSiteContent, getDefaultSection, getListItems } from '@/lib/site-content';
import { useSiteContentStore } from '@/lib/site-content-store';
import { useAppStore } from '@/lib/store';

jest.mock('next/image', () => {
  return function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} data-testid="portfolio-img" />;
  };
});

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
  useAppStore.setState({ modelViewerOpen: false, panoramaModalOpen: false, lightboxOpen: false });
});

it('four pillars renders seeded heading and pillar titles', () => {
  const { section } = renderWith('four-pillars', <FourPillarsSection />);
  expect(screen.getByText('Four Pillars. One Vision.')).toBeInTheDocument();
  expect(screen.getByText(getListItems(section, 'pillars')[0].values.title)).toBeInTheDocument();
});

it('four pillars reads header, pillar copy, preview card, and stage labels from content', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'four-pillars', 'eyebrow', 'EYEBROW EDIT');
  editText(content, 'four-pillars', 'heading', 'HEADING EDIT');
  editText(content, 'four-pillars', 'subheading', 'SUBHEADING EDIT');
  editText(content, 'four-pillars', 'pillarCtaLabel', 'ENTER PILLAR');
  editText(content, 'four-pillars', 'previewProjectName', 'PROJECT NAME EDIT');
  editText(content, 'four-pillars', 'previewProjectId', 'PROJECT ID EDIT');
  editText(content, 'four-pillars', 'previewProgressValue', '64%');
  editText(content, 'four-pillars', 'previewStatusLabel', 'STATUS EDIT');
  editText(content, 'four-pillars', 'previewLastUpdate', 'LAST UPDATE EDIT');
  editText(content, 'four-pillars', 'previewCtaLabel', 'PREVIEW CTA EDIT');
  editItem(content, 'four-pillars', 'pillars', 'studio', {
    number: '09',
    title: 'PILLAR TITLE EDIT',
    verb: 'VERB EDIT',
    description: 'PILLAR DESCRIPTION EDIT',
  });
  editItem(content, 'four-pillars', 'previewStages', 'visualization', { label: 'STAGE LABEL EDIT' });
  useSiteContentStore.setState({ content });
  render(<FourPillarsSection />);
  expect(screen.getByText('EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('SUBHEADING EDIT')).toBeInTheDocument();
  expect(screen.getAllByText('ENTER PILLAR').length).toBeGreaterThan(0);
  expect(screen.getByText('PROJECT NAME EDIT')).toBeInTheDocument();
  expect(screen.getByText('PROJECT ID EDIT')).toBeInTheDocument();
  expect(screen.getByText('64%')).toBeInTheDocument();
  expect(screen.getByText('STATUS EDIT')).toBeInTheDocument();
  expect(screen.getByText('LAST UPDATE EDIT')).toBeInTheDocument();
  expect(screen.getByText('PREVIEW CTA EDIT')).toBeInTheDocument();
  expect(screen.getByText('09')).toBeInTheDocument();
  expect(screen.getByText('PILLAR TITLE EDIT')).toBeInTheDocument();
  expect(screen.getByText('VERB EDIT')).toBeInTheDocument();
  expect(screen.getByText('PILLAR DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('STAGE LABEL EDIT')).toBeInTheDocument();
});

it('xr experience renders copy and keeps model buttons working', () => {
  const { section } = renderWith('xr-experience', <XRExperienceSection />);
  expect(screen.getByText(getListItems(section, 'experiences')[0].values.title)).toBeInTheDocument();
  fireEvent.click(screen.getByText('Launch AR Simulator'));
  expect(useAppStore.getState().modelViewerOpen).toBe(true);
  expect(useAppStore.getState().activeModelTitle).toBe('WebAR Tabletop Model');
});

it('xr experience reads header and experience copy from content', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'xr-experience', 'eyebrow', 'XR EYEBROW EDIT');
  editText(content, 'xr-experience', 'heading', 'XR HEADING EDIT');
  editText(content, 'xr-experience', 'description', 'XR DESCRIPTION EDIT');
  editItem(content, 'xr-experience', 'experiences', 'webar', {
    title: 'EXPERIENCE TITLE EDIT',
    desc: 'EXPERIENCE DESCRIPTION EDIT',
    cta: 'EXPERIENCE CTA EDIT',
  });
  useSiteContentStore.setState({ content });
  render(<XRExperienceSection />);
  expect(screen.getByText('XR EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('XR HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('XR DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('EXPERIENCE TITLE EDIT')).toBeInTheDocument();
  expect(screen.getByText('EXPERIENCE DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('EXPERIENCE CTA EDIT')).toBeInTheDocument();
});

it('xr experience dispatches panorama actions from item meta', () => {
  renderWith('xr-experience', <XRExperienceSection />);
  fireEvent.click(screen.getByText('Explore 360° Tour'));
  expect(useAppStore.getState().panoramaModalOpen).toBe(true);
  expect(useAppStore.getState().activePanoramaTitle).toBe('Desert Mirage Pavilion 360');
});

it('portfolio preview renders header copy from fields', () => {
  renderWith('portfolio-preview', <PortfolioPreview />);
  expect(screen.getByText('Selected Works')).toBeInTheDocument();
});

it('portfolio preview reads header, CTA labels, and filter labels from content', () => {
  const content = buildDefaultSiteContent();
  editText(content, 'portfolio-preview', 'eyebrow', 'PORTFOLIO EYEBROW EDIT');
  editText(content, 'portfolio-preview', 'heading', 'PORTFOLIO HEADING EDIT');
  editText(content, 'portfolio-preview', 'description', 'PORTFOLIO DESCRIPTION EDIT');
  editText(content, 'portfolio-preview', 'allProjectsLabel', 'ALL WORKS EDIT');
  editText(content, 'portfolio-preview', 'ctaPanoramaLabel', 'PANORAMA CTA EDIT');
  editText(content, 'portfolio-preview', 'ctaGalleryLabel', 'GALLERY CTA EDIT');
  editItem(content, 'portfolio-preview', 'filterLabels', 'all', { label: 'EVERYTHING EDIT' });
  useSiteContentStore.setState({ content });
  render(<PortfolioPreview />);
  expect(screen.getByText('PORTFOLIO EYEBROW EDIT')).toBeInTheDocument();
  expect(screen.getByText('PORTFOLIO HEADING EDIT')).toBeInTheDocument();
  expect(screen.getByText('PORTFOLIO DESCRIPTION EDIT')).toBeInTheDocument();
  expect(screen.getByText('ALL WORKS EDIT')).toBeInTheDocument();
  expect(screen.getByText('EVERYTHING EDIT')).toBeInTheDocument();
  expect(screen.getAllByText('PANORAMA CTA EDIT').length).toBeGreaterThan(0);
  expect(screen.getAllByText('GALLERY CTA EDIT').length).toBeGreaterThan(0);
});
