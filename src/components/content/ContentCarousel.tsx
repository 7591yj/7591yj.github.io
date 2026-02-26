import { useEffect, useRef, useState } from "react";
import Swiper from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";

import "./ContentCarousel.css";

interface Props {
  images: { src: string; alt?: string }[];
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClass: Record<string, string> = {
  xs: "content-carousel--xs",
  sm: "content-carousel--sm",
  md: "content-carousel--md",
  lg: "content-carousel--lg",
  xl: "content-carousel--xl",
};

export default function ContentCarousel({ images, size = "xl" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(() => {
    if (!containerRef.current || !prevRef.current || !nextRef.current) return;

    const instance = new Swiper(containerRef.current, {
      modules: [Autoplay, Navigation],
      autoplay: { delay: 5000, disableOnInteraction: false },
      navigation: {
        prevEl: prevRef.current,
        nextEl: nextRef.current,
      },
      loop: true,
      on: {
        slideChange(swiper) {
          setActiveIndex(swiper.realIndex + 1);
        },
      },
    });
    swiperRef.current = instance;

    return () => {
      instance.destroy(true, true);
      swiperRef.current = null;
    };
  }, []);

  function toggleAutoplay() {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (swiper.autoplay.running) {
      swiper.autoplay.stop();
      setPlaying(false);
    } else {
      swiper.autoplay.start();
      setPlaying(true);
    }
  }

  return (
    <div className={`content-carousel ${sizeClass[size]}`}>
      <div ref={containerRef} className="swiper content-carousel__swiper">
        <div className="swiper-wrapper">
          {images.map((img, i) => (
            <div className="swiper-slide" key={`${img.src}-${i}`}>
              <img
                src={img.src}
                alt={img.alt ?? ""}
                className="content-carousel__image"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="content-carousel__bar">
        <span className="content-carousel__counter">
          {activeIndex} / {images.length}
        </span>

        <div className="content-carousel__controls">
          <button
            className="content-carousel__btn"
            aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
            onClick={toggleAutoplay}
          >
            <svg
              className="content-carousel__btn-icon"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              {playing ? (
                <path d="M12 8h3v16h-3zM17 8h3v16h-3z" />
              ) : (
                <path d="M10 8l14 8-14 8z" />
              )}
            </svg>
          </button>
          <button
            ref={prevRef}
            className="content-carousel__btn"
            aria-label="Previous slide"
          >
            <svg
              className="content-carousel__btn-icon"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M20.3 24.7L11.6 16l8.7-8.7 1.4 1.4L13.4 16l7.3 7.3z" />
            </svg>
          </button>
          <button
            ref={nextRef}
            className="content-carousel__btn"
            aria-label="Next slide"
          >
            <svg
              className="content-carousel__btn-icon"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M11.7 24.7l-1.4-1.4 7.3-7.3-7.3-7.3 1.4-1.4 8.7 8.7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
