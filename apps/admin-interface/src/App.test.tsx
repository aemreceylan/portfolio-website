import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import App from './App';

describe('Admin Console Application', () => {
  it('renders the admin console header and brand name', () => {
    render(<App />);
    expect(screen.getByText(/AEC WebOS — Admin Console/i)).toBeInTheDocument();
    expect(screen.getByText(/Sistem Aktif/i)).toBeInTheDocument();
  });

  it('renders telemetry and system resource cards', () => {
    render(<App />);
    expect(screen.getByText(/Telemetri & Analitik/i)).toBeInTheDocument();
    expect(screen.getByText(/Sistem Kaynakları/i)).toBeInTheDocument();
    expect(screen.getByText(/İçerik & VFS Yönetimi/i)).toBeInTheDocument();
  });
});
