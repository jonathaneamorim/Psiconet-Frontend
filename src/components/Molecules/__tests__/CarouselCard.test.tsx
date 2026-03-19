import React from 'react';
import { render, screen } from '@testing-library/react';
import { CarouselCard } from '../CarouselCard';

describe('CarouselCard', () => {
  it('renders title and text correctly', () => {
    render(<CarouselCard title="Test Title" text="Test Text" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });
});
