"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export interface CarouselProps {
  items: React.ReactNode[];
  slidesPerView?: number | "auto";
  spaceBetween?: number;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  slidesPerView = "auto",
  spaceBetween = 24,
  className = "",
}) => {

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        grabCursor={true}
        navigation={{
          prevEl: '.carousel-prev-btn',
          nextEl: '.carousel-next-btn',
        }}
        breakpoints={{
          320: {
            slidesPerView: 1.2,
            spaceBetween: 16,
          },
          640: {
            slidesPerView: 2.2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3.2,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: slidesPerView === "auto" ? 4 : slidesPerView,
            spaceBetween: 24,
          },
        }}
        className="pb-16 !overflow-visible md:!overflow-hidden" // Padding to make room for navigation arrows at bottom
      >
        {items.map((item, index) => (
          <SwiperSlide key={index} className="flex" style={{ height: 'auto' }}>
            {item}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="flex justify-center items-center gap-4 z-10 mt-6">
        <button
          className="carousel-prev-btn w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="carousel-next-btn w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
