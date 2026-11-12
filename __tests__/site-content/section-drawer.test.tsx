import { render, screen, fireEvent } from '@testing-library/react';
import SectionDrawer from '@/components/admin/live-editor/in-context/SectionDrawer';
import { EditModeProvider } from '@/components/admin/live-editor/in-context/EditModeContext';
import { buildDefaultSiteContent, SECTION_TYPES, getSectionDef } from '@/lib/site-content';
import { useSiteContentDraftStore } from '@/lib/site-content-store';

function openOn(sectionId: string) {
  const content = buildDefaultSiteContent();
  useSiteContentDraftStore.setState({ content });
  const store = useSiteContentDraftStore.getState();
  return render(
    <EditModeProvider initial={{ drawerOpen: true, selectedSectionId: sectionId }}>
      <SectionDrawer />
    </EditModeProvider>,
  );
}

it('edits a text field', () => {
  openOn('hero');
  const input = screen.getByLabelText('Headline') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'NEW' } });
  const hero = useSiteContentDraftStore.getState().content.pages[0].sections[0];
  expect(hero.fields.find((f) => f.id === 'headline')).toMatchObject({ value: 'NEW' });
});

it('toggles visibility and padding', () => {
  openOn('hero');
  fireEvent.click(screen.getByLabelText('Visible'));
  fireEvent.change(screen.getByLabelText('Padding'), { target: { value: 'lg' } });
  const hero = useSiteContentDraftStore.getState().content.pages[0].sections[0];
  expect(hero.isVisible).toBe(false);
  expect(hero.style.padding).toBe('lg');
});

it('renders every field for every section type without crashing', () => {
  for (const type of SECTION_TYPES) {
    const content = buildDefaultSiteContent();
    const section = content.pages[0].sections.find((s) => s.type === type)!;
    useSiteContentDraftStore.setState({ content });
    const { unmount } = render(
      <EditModeProvider initial={{ drawerOpen: true, selectedSectionId: section.id }}>
        <SectionDrawer />
      </EditModeProvider>,
    );
    for (const def of getSectionDef(type).fields) {
      expect(screen.getByText(def.label)).toBeInTheDocument();
    }
    unmount();
  }
});

it('adds a list item', () => {
  openOn('faq');
  fireEvent.click(screen.getByText('Add FAQ'));
  const faq = useSiteContentDraftStore.getState().content.pages[0].sections.find((s) => s.id === 'faq')!;
  const list = faq.fields.find((f) => f.kind === 'list') as any;
  expect(list.items).toHaveLength(8);
});
