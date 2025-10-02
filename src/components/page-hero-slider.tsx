"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageHeroSliderProps {
  title: string;
  subtitle?: string;
  images?: string[];
  height?: "small" | "medium" | "large";
}

const defaultImages = [
  "/images/hero1.jpg",
  "/images/hero2.JPG",
  "/images/hero3.jpg"
];

export function PageHeroSlider({
  title,
  subtitle,
  images = defaultImages,
  height = "medium"
}: PageHeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const heightClasses = {
    small: "h-[40vh] min-h-[300px]",
    medium: "h-[50vh] min-h-[400px]",
    large: "h-[60vh] min-h-[500px]"
  };

  return (
    <section className={`relative ${heightClasses[height]} overflow-hidden`}>
      {/* Slides */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={`${title} - Slide ${index + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-2xl animate-slide-up">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto max-w-2xl text-lg text-white/90 leading-relaxed drop-shadow-lg animate-fade-in sm:text-xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:h-12 sm:w-12"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:h-12 sm:w-12"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 sm:h-3 sm:w-3 ${
                  index === currentSlide
                    ? "bg-white w-6 sm:w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
