import { render } from '@testing-library/react';
import { type ReactNode, useRef } from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useDocumentTitle, useFocusMainOnNavigation } from './a11y';

afterEach(() => {
  document.title = 'TaskFlow';
});

function TitleProbe({ title }: { title?: string }) {
  useDocumentTitle(title);
  return null;
}

describe('useDocumentTitle', () => {
  it('sets a suffixed document title and restores it on unmount', () => {
    document.title = 'TaskFlow';
    const { unmount } = render(<TitleProbe title="Projects" />);
    expect(document.title).toBe('Projects · TaskFlow');
    unmount();
    expect(document.title).toBe('TaskFlow');
  });

  it('leaves the title untouched when no title is given', () => {
    document.title = 'TaskFlow';
    render(<TitleProbe />);
    expect(document.title).toBe('TaskFlow');
  });
});

function FocusHarness({ home }: { home: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useFocusMainOnNavigation(ref);
  return (
    <>
      <main ref={ref} tabIndex={-1} data-testid="main">
        <Routes>
          <Route path="/" element={home} />
          <Route path="/next" element={<p>Next page</p>} />
        </Routes>
      </main>
    </>
  );
}

function GoNext() {
  const navigate = useNavigate();
  // A control that unmounts on navigation, stranding focus on <body>.
  return <button onClick={() => navigate('/next')}>Go next</button>;
}

describe('useFocusMainOnNavigation', () => {
  it('moves focus to main when the activating control unmounts', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByRole } = render(
      <MemoryRouter initialEntries={['/']}>
        <FocusHarness home={<GoNext />} />
      </MemoryRouter>,
    );

    await user.click(getByRole('button', { name: 'Go next' }));
    expect(getByTestId('main')).toHaveFocus();
  });
});
