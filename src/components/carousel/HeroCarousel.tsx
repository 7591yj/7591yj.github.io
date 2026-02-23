import { useEffect, useRef, useState } from "react";
import Swiper from "swiper";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

import "./HeroCarousel.css";

interface Slide {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

interface Props {
  slides: Slide[];
}

export default function HeroCarousel({ slides }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new Swiper(containerRef.current, {
      modules: [Autoplay, EffectFade, Navigation],
      effect: "fade",
      autoplay: { delay: 5000, disableOnInteraction: false },
      navigation: {
        prevEl: ".hero-carousel__prev",
        nextEl: ".hero-carousel__next",
      },
      loop: true,
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
    <div className="hero-carousel">
      {/* Image preload hints */}
      {slides.map((slide) => (
        <link key={slide.image} rel="preload" as="image" href={slide.image} />
      ))}

      <div ref={containerRef} className="swiper hero-carousel__swiper">
        <div className="swiper-wrapper">
          {slides.map((slide) => (
            <div className="swiper-slide" key={slide.image}>
              <img
                src={slide.image}
                alt={slide.alt}
                className="hero-carousel__image"
              />
              {(slide.title || slide.subtitle) && (
                <div className="hero-carousel__overlay">
                  {slide.title && (
                    <h3 className="hero-carousel__title">{slide.title}</h3>
                  )}
                  {slide.subtitle && (
                    <p className="hero-carousel__subtitle">{slide.subtitle}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <nav className="hero-carousel__nav">
        <button
          className="hero-carousel__stop btn btn--icon btn--md"
          aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
          onClick={toggleAutoplay}
        >
          <svg className="btn__icon" viewBox="0 0 32 32" fill="currentColor">
            {playing ? (
              <path d="M12 8h3v16h-3zM17 8h3v16h-3z" />
            ) : (
              <path d="M10 8l14 8-14 8z" />
            )}
          </svg>
        </button>
        <button
          className="hero-carousel__prev btn btn--icon btn--md"
          aria-label="Previous slide"
        >
          <svg className="btn__icon" viewBox="0 0 32 32" fill="currentColor">
            <path d="M20.3 24.7L11.6 16l8.7-8.7 1.4 1.4L13.4 16l7.3 7.3z" />
          </svg>
        </button>
        <button
          className="hero-carousel__next btn btn--icon btn--md"
          aria-label="Next slide"
        >
          <svg className="btn__icon" viewBox="0 0 32 32" fill="currentColor">
            <path d="M11.7 24.7l-1.4-1.4 7.3-7.3-7.3-7.3 1.4-1.4 8.7 8.7z" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
