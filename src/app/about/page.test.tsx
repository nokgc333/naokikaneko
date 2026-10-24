import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './page';

describe('About', () => {
  it('shows "Naoki Kaneko" in the heading', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /naoki kaneko/i })).toBeInTheDocument();
  });
});
