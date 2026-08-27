import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('TaskFlow App', () => {
  it('renders application brand, progress overview, and capture form', async () => {
    render(<App />);
    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getByText('Productivity Progress')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/What do you need to accomplish/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('All Tasks')).toBeInTheDocument();
    });
  });
});
