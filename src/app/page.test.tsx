import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('見出しに "naokikaneko" が表示される', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /naokikaneko/ })).toBeInTheDocument();
  });
});
