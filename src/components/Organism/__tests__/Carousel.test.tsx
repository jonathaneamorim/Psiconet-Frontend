import React from 'react';
import { render } from '@testing-library/react';
import { Carousel } from '../Carousel';

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

describe('Carousel', () => {
  it('renders correctly with given items', () => {
    const items = [
      <div key="1">Slide 1</div>,
      <div key="2">Slide 2</div>,
    ];

    const { getByTestId, getAllByTestId } = render(<Carousel items={items} />);
    
    expect(getByTestId('swiper-mock')).toBeInTheDocument();
    expect(getAllByTestId('swiper-slide-mock')).toHaveLength(2);
  });

  it('renders custom navigation buttons correctly', () => {
    const { container } = render(<Carousel items={[]} />);
    
    expect(container.querySelector('.carousel-prev-btn')).toBeInTheDocument();
    expect(container.querySelector('.carousel-next-btn')).toBeInTheDocument();
  });
});
