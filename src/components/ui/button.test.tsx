/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    // Note: The class check depends on how cn() merges classes.
    // Usually it results in the class string containing 'bg-destructive'.
    // We check if the class list contains it.
    expect(button.className).toContain('bg-destructive');
  });
});
