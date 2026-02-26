import { useEffect, useRef, useState } from "react";
import Swiper from "swiper";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

import InteractiveDotGrid from "../InteractiveDotGrid";
import "./HeroCarousel.css";

interface ProjectData {
  title: string;
  subtitle: string;
  tech: string[];
  status: string;
  current?: boolean;
  href?: string;
}

interface Slide {
  image?: string;
  alt: string;
  title?: string;
  subtitle?: string;
  project?: ProjectData;
}

interface Props {
  slides: Slide[];
  fullscreen?: boolean;
}

export default function HeroCarousel({ slides, fullscreen }: Props) {
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
    <div className={`hero-carousel${fullscreen ? " hero-carousel--fullscreen" : ""}`}>
      {/* Image preload hints */}
      {slides.map((slide) =>
        slide.image ? (
          <link key={slide.image} rel="preload" as="image" href={slide.image} />
        ) : null,
      )}

      <div ref={containerRef} className="swiper hero-carousel__swiper">
        <div className="swiper-wrapper">
          {slides.map((slide, i) => (
            <div className="swiper-slide" key={slide.image ?? `fallback-${i}`}>
              {slide.image ? (
                <>
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="hero-carousel__image"
                  />
                  <InteractiveDotGrid
                    className="hero-carousel__dot-grid"
                    gridSpacing={16}
                    dotSize={1}
                    dotColor="rgba(0, 0, 0, 0.8)"
                  />
                </>
              ) : (
                <div className="hero-carousel__fallback">
                  <InteractiveDotGrid
                    className="hero-carousel__dot-grid"
                    gridSpacing={16}
                    dotSize={1}
                    dotColor="rgba(0, 0, 0, 0.8)"
                  />
                  <span className="hero-carousel__fallback-title">
                    {slide.project?.title ?? slide.alt}
                  </span>
                  {slide.project && (
                    <span className="hero-carousel__fallback-subtitle">
                      {slide.project.subtitle}
                    </span>
                  )}
                  {slide.project && (
                    <div className="hero-carousel__fallback-tech">
                      {slide.project.tech.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  )}
                  {slide.project && (
                    <span className="hero-carousel__fallback-status">
                      {slide.project.current ? "IN DEVELOPMENT" : "RELEASED"}
                    </span>
                  )}
                </div>
              )}

              {/* Watermark index */}
              {slide.project && (
                <span className="hero-carousel__watermark">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}

              {/* Simple title/subtitle overlay (non-project slides) */}
              {!slide.project && (slide.title || slide.subtitle) && (
                <div className="hero-carousel__overlay">
                  {slide.title && (
                    <h3 className="hero-carousel__title">{slide.title}</h3>
                  )}
                  {slide.subtitle && (
                    <p className="hero-carousel__subtitle">{slide.subtitle}</p>
                  )}
                </div>
              )}

              {/* Project info overlay */}
              {slide.project && (
                <div className="hero-carousel__project-overlay">
                  <a
                    className="hero-carousel__project-card"
                    href={slide.project.href}
                  >
                    <div
                      className={`hero-carousel__project-badge${
                        slide.project.current
                          ? " hero-carousel__project-badge--current"
                          : ""
                      }`}
                    >
                      <span
                        className={`hero-carousel__project-led${
                          slide.project.current
                            ? " hero-carousel__project-led--active"
                            : " hero-carousel__project-led--hollow"
                        }`}
                      />
                      <span>
                        {slide.project.current ? "CURRENTLY BUILDING" : "RELEASED"}
                      </span>
                    </div>
                    <div className="hero-carousel__project-header">
                      <h3 className="hero-carousel__project-title">
                        {slide.project.title}
                        <span className="hero-carousel__project-arrow">&rarr;</span>
                      </h3>
                    </div>
                    <p className="hero-carousel__project-subtitle">
                      <span className="hero-carousel__project-chevron">&gt;</span>
                      {slide.project.subtitle}
                    </p>
                    <div className="hero-carousel__project-tech">
                      {slide.project.tech.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </a>
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

      {fullscreen && (
        <div className="hero-carousel__scroll-indicator">
          <span className="hero-carousel__scroll-label">SCROLL</span>
          <svg
            className="hero-carousel__scroll-chevron"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 4l5 5 5-5" />
            <path d="M3 8l5 5 5-5" />
          </svg>
        </div>
      )}
    </div>
  );
}
