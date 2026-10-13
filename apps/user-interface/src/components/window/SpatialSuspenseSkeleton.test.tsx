import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpatialSuspenseSkeleton } from './SpatialSuspenseSkeleton';

describe('SpatialSuspenseSkeleton Component', () => {
  it('should render loading status and optional app title', () => {
    render(<SpatialSuspenseSkeleton appTitle="Terminal CLI" />);

    expect(screen.getByText(/BOOTING MODULE.../i)).toBeInTheDocument();
    expect(screen.getByText(/Terminal CLI/i)).toBeInTheDocument();
  });

  it('should render default message when app title is not provided', () => {
    render(<SpatialSuspenseSkeleton />);

    expect(screen.getByText(/BOOTING MODULE.../i)).toBeInTheDocument();
  });
});
