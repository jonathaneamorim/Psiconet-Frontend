import React from "react";

interface CarouselCardProps {
  title: string;
  text: string;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ title, text }) => {
  return (
    <div className="flex flex-col h-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 line-clamp-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-h-[4.5rem] overflow-hidden line-clamp-3">
        {text}
      </p>
    </div>
  );
};
