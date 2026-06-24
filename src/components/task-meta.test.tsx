import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DueDate } from './task-meta';

const DAY = 24 * 60 * 60 * 1000;

describe('DueDate', () => {
  it('flags overdue dates with text, not color alone (WCAG 1.4.1)', () => {
    const past = new Date(Date.now() - DAY).toISOString();
    render(<DueDate date={past} />);
    expect(screen.getByText(/overdue:/i)).toBeInTheDocument();
  });

  it('does not add the overdue label for future dates', () => {
    const future = new Date(Date.now() + DAY).toISOString();
    render(<DueDate date={future} />);
    expect(screen.queryByText(/overdue:/i)).not.toBeInTheDocument();
  });
});
