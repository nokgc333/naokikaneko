import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './page';

describe('About', () => {
  it('見出しに "Naoki Kaneko" が表示される', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /naoki kaneko/i })).toBeInTheDocument();
  });
});
