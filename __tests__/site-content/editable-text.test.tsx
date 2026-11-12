import React from 'react';
import { act, render, renderHook, screen, fireEvent } from '@testing-library/react';
import { EditModeProvider, useEditMode } from '@/components/admin/live-editor/in-context/EditModeContext';
import EditableText from '@/components/admin/live-editor/in-context/EditableText';
import RichTextToolbar from '@/components/admin/live-editor/in-context/RichTextToolbar';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import { getDefaultSection } from '@/lib/site-content';
import { useSiteContentDraftStore, useSiteContentStore } from '@/lib/site-content-store';

function draftField(sectionId: string, fieldId: string) {
  return useSiteContentDraftStore
    .getState()
    .content.pages[0].sections.find((s) => s.id === sectionId)
    ?.fields.find((f) => f.id === fieldId) as any;
}

function setup() {
  const section = getDefaultSection('hero');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  return render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="headline" as="h1" />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
}

it('renders plain text in preview mode', () => {
  setup();
  expect(screen.getByText('VIZTR')).toBeInTheDocument();
  expect(screen.getByText('VIZTR')).not.toHaveAttribute('contenteditable');
});

it('commits an edit on blur', () => {
  setup();
  const el = screen.getByText('VIZTR');
  fireEvent.click(el);
  el.textContent = 'NEW HEADLINE';
  fireEvent.blur(el);
  const hero = useSiteContentDraftStore.getState().content.pages[0].sections[0];
  expect((hero.fields.find((f) => f.id === 'headline') as any).value).toBe('NEW HEADLINE');
});

it('cancels on Escape', () => {
  setup();
  const el = screen.getByText('VIZTR');
  fireEvent.click(el);
  el.textContent = 'DISCARDED';
  fireEvent.keyDown(el, { key: 'Escape' });
  expect(useSiteContentDraftStore.getState().content.pages[0].sections[0].fields.find((f) => f.id === 'headline')).toMatchObject({ value: 'VIZTR' });
});

it('sanitizes rich html on commit', () => {
  const section = getDefaultSection('hero');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="description" as="p" />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  const el = document.querySelector('[data-cms-field="description"]') as HTMLElement;
  fireEvent.click(el);
  el.innerHTML = '<b>bold</b><script>alert(1)</script>';
  fireEvent.blur(el);
  const value = (useSiteContentDraftStore.getState().content.pages[0].sections[0].fields.find((f) => f.id === 'description') as any).value;
  expect(value).toContain('<b>bold</b>');
  expect(value).not.toContain('script');
});

it('shows a placeholder when empty in edit mode', () => {
  const section = getDefaultSection('hero');
  (section.fields.find((f) => f.id === 'subheadline') as any).value = '';
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="subheadline" as="p" placeholder="Add a subheadline" />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  expect(screen.getByText('Add a subheadline')).toBeInTheDocument();
});

it('commits on Enter for single-line fields', () => {
  setup();
  const el = screen.getByText('VIZTR');
  fireEvent.click(el);
  el.textContent = 'ENTERED';
  fireEvent.keyDown(el, { key: 'Enter' });
  expect(draftField('hero', 'headline').value).toBe('ENTERED');
  expect(el).not.toHaveAttribute('contenteditable');
});

it('keeps newlines on Enter and commits on Ctrl+Enter for multiline fields', () => {
  const section = getDefaultSection('hero');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="description" as="p" />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  const el = document.querySelector('[data-cms-field="description"]') as HTMLElement;
  fireEvent.click(el);
  el.innerHTML = 'first line';
  fireEvent.keyDown(el, { key: 'Enter' });
  expect(el).toHaveAttribute('contenteditable');
  expect(draftField('hero', 'description').value).not.toBe('first line');
  fireEvent.keyDown(el, { key: 'Enter', ctrlKey: true });
  expect(draftField('hero', 'description').value).toBe('first line');
});

it('restores the original text in the DOM when Escape cancels', () => {
  setup();
  const el = screen.getByText('VIZTR');
  fireEvent.click(el);
  el.textContent = 'DISCARDED';
  fireEvent.keyDown(el, { key: 'Escape' });
  expect(el.textContent).toBe('VIZTR');
  expect(el).not.toHaveAttribute('contenteditable');
});

it('commits an empty string when the text is only whitespace', () => {
  setup();
  const el = screen.getByText('VIZTR');
  fireEvent.click(el);
  el.textContent = '   ';
  fireEvent.blur(el);
  expect(draftField('hero', 'headline').value).toBe('');
  expect(screen.getByText('Headline')).toBeInTheDocument();
});

it('pastes rich markup as plain text', () => {
  const section = getDefaultSection('hero');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="description" as="p" />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  const el = document.querySelector('[data-cms-field="description"]') as HTMLElement;
  fireEvent.click(el);
  el.innerHTML = '<b>base</b>';
  fireEvent.paste(el, { clipboardData: { getData: () => '<img src=x onerror="alert(1)">plain pasted' } });
  expect(el.innerHTML).not.toContain('<img');
  fireEvent.blur(el);
  const value = draftField('hero', 'description').value;
  expect(value).toContain('base');
  expect(value).toContain('plain pasted');
  expect(value).not.toContain('<img');
});

it('never writes to the published store', () => {
  const published = useSiteContentStore.getState().content;
  setup();
  const el = screen.getByText('VIZTR');
  fireEvent.click(el);
  el.textContent = 'DRAFT ONLY';
  fireEvent.blur(el);
  expect(useSiteContentStore.getState().content).toBe(published);
  expect(draftField('hero', 'headline').value).toBe('DRAFT ONLY');
});

it('renders nothing when no section instance or sectionId resolves', () => {
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [] } });
  const { container } = render(
    <EditModeProvider>
      <EditableText fieldId="headline" as="h1" />
    </EditModeProvider>,
  );
  expect(container).toBeEmptyDOMElement();
});

it('resolves an explicit sectionId from the draft store', () => {
  const section = getDefaultSection('hero');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <EditableText fieldId="headline" as="h1" sectionId="hero" />
    </EditModeProvider>,
  );
  expect(screen.getByText('VIZTR')).toBeInTheDocument();
});

it('writes list item fields by merging the changed key', () => {
  const section = getDefaultSection('studio');
  const list = section.fields.find((f) => f.id === 'cards') as any;
  const itemId = list.items[0].id as string;
  const originalDescription = list.items[0].values.description as string;
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="title" listFieldId="cards" itemId={itemId} />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  const el = document.querySelector('[data-cms-field="title"]') as HTMLElement;
  expect(el).toHaveAttribute('data-cms-list-field', 'cards');
  expect(el).toHaveAttribute('data-cms-item-id', itemId);
  fireEvent.click(el);
  el.textContent = 'REWRITTEN CARD';
  fireEvent.blur(el);

  const updated = (draftField('studio', 'cards') as any).items.find((i: any) => i.id === itemId);
  expect(updated.values.title).toBe('REWRITTEN CARD');
  expect(updated.values.description).toBe(originalDescription);
});

it('renders rich preview html without exposing it as plain markup', () => {
  const section = getDefaultSection('hero');
  (section.fields.find((f) => f.id === 'description') as any).value = '<b>Rich</b> copy';
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider initial={{ editMode: false }}>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="description" as="p" />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  const el = document.querySelector('[data-cms-field="description"]') as HTMLElement;
  expect(el.innerHTML).toBe('<b>Rich</b> copy');
  expect(el).not.toHaveAttribute('contenteditable');
  expect(el.querySelector('b')).not.toBeNull();
});

it('exposes the edit mode API with pre-opened initial state', () => {
  const { result } = renderHook(() => useEditMode(), {
    wrapper: ({ children }) => (
      <EditModeProvider initial={{ editMode: true, selectedSectionId: 'studio', drawerOpen: true }}>{children}</EditModeProvider>
    ),
  });

  expect(result.current.editMode).toBe(true);
  expect(result.current.drawerOpen).toBe(true);
  expect(result.current.selectedSectionId).toBe('studio');
  expect(result.current.selectedFieldId).toBeNull();

  act(() => result.current.selectField('hero', 'headline'));
  expect(result.current.selectedSectionId).toBe('hero');
  expect(result.current.selectedFieldId).toBe('headline');
  expect(result.current.drawerOpen).toBe(true);

  act(() => result.current.closeDrawer());
  expect(result.current.drawerOpen).toBe(false);
  expect(result.current.selectedFieldId).toBeNull();
  expect(result.current.selectedSectionId).toBe('hero');

  act(() => result.current.selectSection('studio'));
  expect(result.current.drawerOpen).toBe(true);
  expect(result.current.selectedSectionId).toBe('studio');
  expect(result.current.selectedFieldId).toBeNull();

  act(() => result.current.hoverSection('faq'));
  expect(result.current.hoveredSectionId).toBe('faq');

  act(() => result.current.setEditMode(false));
  expect(result.current.editMode).toBe(false);
});

it('defaults to edit mode and a closed drawer', () => {
  const { result } = renderHook(() => useEditMode(), {
    wrapper: ({ children }) => <EditModeProvider>{children}</EditModeProvider>,
  });
  expect(result.current.editMode).toBe(true);
  expect(result.current.hoveredSectionId).toBeNull();
  expect(result.current.selectedSectionId).toBeNull();
  expect(result.current.selectedFieldId).toBeNull();
  expect(result.current.drawerOpen).toBe(false);
});

it('renders the toolbar only when a non-collapsed rich selection can be positioned', () => {
  const onCommand = jest.fn();
  const { container } = render(<RichTextToolbar onCommand={onCommand} />);
  expect(container).toBeEmptyDOMElement();

  const section = getDefaultSection('hero');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableText fieldId="description" as="p" />
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  const el = document.querySelector('[data-cms-field="description"]') as HTMLElement;
  fireEvent.click(el);

  const selection = window.getSelection() as Selection;
  act(() => {
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
  expect(screen.queryByRole('toolbar')).toBeNull();

  act(() => {
    const range = document.createRange();
    range.setStart(el.firstChild as Node, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
  expect(screen.queryByRole('toolbar')).toBeNull();
  expect(onCommand).not.toHaveBeenCalled();
});
