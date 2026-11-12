import { render, screen, fireEvent } from '@testing-library/react';
import EditableMedia from '@/components/admin/live-editor/in-context/EditableMedia';
import { EditModeProvider } from '@/components/admin/live-editor/in-context/EditModeContext';
import { SectionInstanceProvider } from '@/components/site/SectionInstanceContext';
import { getDefaultSection } from '@/lib/site-content';
import { useSiteContentDraftStore } from '@/lib/site-content-store';

jest.mock('@/components/admin/live-editor/MediaPickerModal', () => ({
  __esModule: true,
  default: ({ open, onPick }: any) => (open ? <button onClick={() => onPick('https://example.com/new.jpg')}>pick</button> : null),
}));

function setup() {
  const section = getDefaultSection('showreel');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  return render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableMedia fieldId="poster" mediaType="image"><img alt="poster" src="x" /></EditableMedia>
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
}

it('replaces a single media url from the picker', () => {
  setup();
  fireEvent.click(screen.getByText('Replace'));
  fireEvent.click(screen.getByText('pick'));
  const poster = useSiteContentDraftStore.getState().content.pages[0].sections[0].fields.find((f) => f.id === 'poster') as any;
  expect(poster.urls).toEqual(['https://example.com/new.jpg']);
});

it('replaces a gallery slide by index', () => {
  const section = getDefaultSection('hero');
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableMedia fieldId="heroImages" index={2} mediaType="image"><img alt="slide" src="x" /></EditableMedia>
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  fireEvent.click(screen.getByText('Replace'));
  fireEvent.click(screen.getByText('pick'));
  const images = useSiteContentDraftStore.getState().content.pages[0].sections[0].fields.find((f) => f.id === 'heroImages') as any;
  expect(images.urls[2]).toBe('https://example.com/new.jpg');
  expect(images.urls[0]).not.toBe('https://example.com/new.jpg');
});

it('shows an upload prompt for empty media', () => {
  const section = getDefaultSection('showreel');
  (section.fields.find((f) => f.id === 'poster') as any).urls = [];
  useSiteContentDraftStore.setState({ content: { version: 2, pages: [{ id: 'home', label: 'Homepage', route: '/', sections: [section] }] } });
  render(
    <EditModeProvider>
      <SectionInstanceProvider pageId="home" section={section}>
        <EditableMedia fieldId="poster" mediaType="image">{null}</EditableMedia>
      </SectionInstanceProvider>
    </EditModeProvider>,
  );
  expect(screen.getByText('Upload / Select Media')).toBeInTheDocument();
});
