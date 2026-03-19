import React from 'react';
import { render } from '@testing-library/react';
import { CarouselSection } from '../CarouselSection';

// Mock Swiper
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper-mock">{children}</div>,
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper-slide-mock">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Navigation: jest.fn(),
  A11y: jest.fn(),
}));

jest.mock('swiper/css', () => jest.fn());
jest.mock('swiper/css/navigation', () => jest.fn());

describe('CarouselSection', () => {
  it('renders the section properly with its title and the carousel', () => {
    const mockProps = {
      title: "Latest Insights & Resources",
      text: "Support your journey",
      items: [
        { title: "Item 1", text: "Text 1" },
        { title: "Item 2", text: "Text 2" }
      ]
    };

    const { getByText, getByTestId, getAllByTestId } = render(<CarouselSection {...mockProps} />);
    
    // Check headings and text
    expect(getByText('Latest Insights & Resources')).toBeInTheDocument();
    
    // Check that carousel is rendered
    expect(getByTestId('swiper-mock')).toBeInTheDocument();
    
    // There should be 2 mock slides
    expect(getAllByTestId('swiper-slide-mock')).toHaveLength(2);
  });

  it('applies default styling properties', () => {
    const mockProps = {
      title: "Title",
      text: "Text",
      items: []
    };
    const { container } = render(<CarouselSection {...mockProps} />);
    const sectionElement = container.querySelector('section');
    
    expect(sectionElement).toHaveStyle({
      backgroundColor: 'var(--secondary)',
      color: 'var(--tertiary)'
    });
  });

  it('applies custom background and text color styling properly', () => {
    const mockProps = {
      title: "Title",
      text: "Text",
      items: []
    };
    const { container } = render(
      <CarouselSection {...mockProps} bgVariant="--primary" textColor="--secondary" />
    );
    const sectionElement = container.querySelector('section');
    
    expect(sectionElement).toHaveStyle({
      backgroundColor: 'var(--primary)',
      color: 'var(--secondary)'
    });
  });
});
