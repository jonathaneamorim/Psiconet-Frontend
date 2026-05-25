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
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({ 
  title, 
  text, 
  items
}) => {
  const carouselItems = items.map((data, index) => (
    <CarouselCard key={index} title={data.title} text={data.text} />
  ));

  return (
    <section className="w-full min-h-[80vh] flex flex-col justify-center py-24 px-4 md:px-8 bg-white border-t border-slate-100 overflow-hidden box-border">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
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
