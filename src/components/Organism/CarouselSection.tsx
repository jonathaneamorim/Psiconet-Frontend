"use client";

import React from "react";
import { Carousel } from "./Carousel";
import { CarouselCard } from "../Molecules/CarouselCard";

interface CarouselItemData {
  title: string;
  text: string;
}

interface CarouselSectionProps {
  title: string;
  text: string;
  items: CarouselItemData[];
  bgVariant?: '--primary' | '--secondary' | '--tertiary';
  textColor?: '--primary' | '--secondary' | '--tertiary';
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({ 
  title, 
  text, 
  items,
  bgVariant = '--secondary',
  textColor = '--tertiary'
}) => {
  const carouselItems = items.map((data, index) => (
    <CarouselCard key={index} title={data.title} text={data.text} />
  ));

  return (
    <section 
      className="w-full h-screen flex flex-col justify-center py-16 px-4 md:px-8 overflow-hidden box-border"
      style={{
        backgroundColor: `var(${bgVariant})`,
        color: `var(${textColor})`
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: `var(${textColor})`, opacity: 0.8 }}>
            {text}
          </p>
        </div>

        <div className="relative">
          <Carousel items={carouselItems} />
        </div>
      </div>
    </section>
  );
};
