import { useEffect, useRef, useState } from "react";
import type Swiper from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";

import "./HeroCarousel.css";

interface ProjectSlide {
  image?: string;
  project: {
    title: string;
    subtitle: string;
    tech: string[];
    status?: string;
    current?: boolean;
    href?: string;
  };
}

interface Props {
  slides: ProjectSlide[];
  fullscreen?: boolean;
  releasedLabel: string;
  inDevelopmentLabel: string;
}

export default function HeroCarousel({
  slides,
  fullscreen,
  releasedLabel,
  inDevelopmentLabel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);
  const reduceMotionRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const autoplayLabel = reduceMotion
    ? "Motion paused by preference"
    : playing
      ? "Pause autoplay"
      : "Resume autoplay";

  useEffect(() => {
    let mounted = true;
    let instance: Swiper | null = null;

    async function initSwiper() {
      if (!containerRef.current) return;

      const [{ default: Swiper }, { Autoplay, EffectFade, Navigation }] =
        await Promise.all([import("swiper"), import("swiper/modules")]);

      if (!mounted || !containerRef.current) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      reduceMotionRef.current = reduceMotion;
      setReduceMotion(reduceMotion);
      setPlaying(!reduceMotion);

      instance = new Swiper(containerRef.current, {
        modules: [Autoplay, EffectFade, Navigation],
        effect: reduceMotion ? "slide" : "fade",
        speed: reduceMotion ? 0 : 300,
        autoplay: reduceMotion
          ? false
          : { delay: 5000, disableOnInteraction: false },
        navigation: {
          prevEl: ".hero-carousel__prev",
          nextEl: ".hero-carousel__next",
        },
        loop: true,
      });
      instance.on("slideChange", () =>
        setActiveIndex(instance?.realIndex ?? 0),
      );
      swiperRef.current = instance;
    }

    void initSwiper();

    return () => {
      mounted = false;
      instance?.destroy(true, true);
      swiperRef.current = null;
    };
  }, []);

  function toggleAutoplay() {
    const swiper = swiperRef.current;
    if (!swiper || reduceMotionRef.current) return;
    if (swiper.autoplay.running) {
      swiper.autoplay.stop();
      setPlaying(false);
    } else {
      swiper.autoplay.start();
      setPlaying(true);
    }
  }

  function selectProject(index: number, trigger?: HTMLButtonElement) {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.slideToLoop(index);
    swiper.autoplay.stop();
    setPlaying(false);
    setActiveIndex(index);
    trigger?.blur();
  }

  return (
    <div
      className={`hero-carousel${fullscreen ? " hero-carousel--fullscreen" : ""}`}
    >
      <div ref={containerRef} className="swiper hero-carousel__swiper">
        <div className="swiper-wrapper">
          {slides.map((slide, i) => (
            <div className="swiper-slide" key={slide.image ?? `fallback-${i}`}>
              {slide.image ? (
                <>
                  <img
                    src={slide.image}
                    alt={slide.project.title}
                    className="hero-carousel__image"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </>
              ) : (
                <div className="hero-carousel__fallback">
                  <span className="hero-carousel__fallback-title">
                    {slide.project.title}
                  </span>
                  <span className="hero-carousel__fallback-subtitle">
                    {slide.project.subtitle}
                  </span>
                  <div className="hero-carousel__fallback-tech">
                    {slide.project.tech.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <span className="hero-carousel__fallback-status">
                    {(slide.project.current
                      ? inDevelopmentLabel
                      : releasedLabel
                    ).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Watermark index */}
              <span className="hero-carousel__watermark">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Project info overlay */}
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
                      {(slide.project.current
                        ? inDevelopmentLabel
                        : releasedLabel
                      ).toUpperCase()}
                    </span>
                  </div>
                  <div className="hero-carousel__project-header">
                    <h3 className="hero-carousel__project-title">
                      {slide.project.title}
                      <span className="hero-carousel__project-arrow">
                        &rarr;
                      </span>
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
            </div>
          ))}
        </div>
      </div>

      <div
        className={`hero-carousel__project-rail${mapOpen ? " hero-carousel__project-rail--open" : ""}`}
        aria-label="Featured project index"
      >
        <div className="hero-carousel__rail-header">
          <span className="hero-carousel__rail-label">
            MAP · {slides.length}
          </span>
          {slides.length > 3 && (
            <button
              type="button"
              className="hero-carousel__rail-expand"
              aria-expanded={mapOpen}
              onClick={() => setMapOpen((open) => !open)}
            >
              {mapOpen ? "LESS" : "MORE"}
            </button>
          )}
        </div>
        <div className="hero-carousel__rail-list">
          {slides.map((slide, i) => (
            <button
              key={`${slide.project.title}-${i}`}
              type="button"
              className={`hero-carousel__rail-item${
                activeIndex === i ? " hero-carousel__rail-item--active" : ""
              }`}
              aria-current={activeIndex === i ? "true" : undefined}
              onClick={(event) => selectProject(i, event.currentTarget)}
            >
              <span className="hero-carousel__rail-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="hero-carousel__rail-title">
                {slide.project.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hero-carousel__mobile-strip" aria-label="Featured project selector">
        <button
          className={`hero-carousel__mobile-play${reduceMotion ? " hero-carousel__motion-control--paused" : ""}`}
          type="button"
          aria-label={autoplayLabel}
          aria-disabled={reduceMotion}
          title={autoplayLabel}
          data-reduced-label={reduceMotion ? autoplayLabel : undefined}
          data-haptic="nudge"
          onClick={toggleAutoplay}
        >
          <svg className="hero-carousel__mobile-play-icon" viewBox="0 0 32 32" fill="currentColor">
            {playing ? (
              <path d="M12 8h3v16h-3zM17 8h3v16h-3z" />
            ) : (
              <path d="M10 8l14 8-14 8z" />
            )}
          </svg>
          {reduceMotion && (
            <span className="hero-carousel__motion-tooltip" role="status">
              {autoplayLabel}
            </span>
          )}
        </button>
        <span className="hero-carousel__mobile-counter" aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="hero-carousel__mobile-list">
          {slides.map((slide, i) => (
            <button
              key={`mobile-${slide.project.title}-${i}`}
              type="button"
              className={`hero-carousel__mobile-item${
                activeIndex === i ? " hero-carousel__mobile-item--active" : ""
              }`}
              aria-label={`Show project ${i + 1}: ${slide.project.title}`}
              aria-current={activeIndex === i ? "true" : undefined}
              onClick={(event) => selectProject(i, event.currentTarget)}
            >
              <span className="hero-carousel__mobile-item-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="hero-carousel__mobile-item-title">
                {slide.project.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <nav className="hero-carousel__nav">
        <button
          className={`hero-carousel__stop btn btn--icon btn--md${reduceMotion ? " hero-carousel__motion-control--paused" : ""}`}
          aria-label={autoplayLabel}
          aria-disabled={reduceMotion}
          title={autoplayLabel}
          data-reduced-label={reduceMotion ? autoplayLabel : undefined}
          data-haptic="nudge"
          onClick={toggleAutoplay}
        >
          <svg className="btn__icon" viewBox="0 0 32 32" fill="currentColor">
            {playing ? (
              <path d="M12 8h3v16h-3zM17 8h3v16h-3z" />
            ) : (
              <path d="M10 8l14 8-14 8z" />
            )}
          </svg>
          {reduceMotion && (
            <span className="hero-carousel__motion-tooltip" role="status">
              {autoplayLabel}
            </span>
          )}
        </button>
        <button
          className="hero-carousel__prev btn btn--icon btn--md"
          aria-label="Previous slide"
          data-haptic="nudge"
        >
          <svg className="btn__icon" viewBox="0 0 32 32" fill="currentColor">
            <path d="M20.3 24.7L11.6 16l8.7-8.7 1.4 1.4L13.4 16l7.3 7.3z" />
          </svg>
        </button>
        <button
          className="hero-carousel__next btn btn--icon btn--md"
          aria-label="Next slide"
          data-haptic="nudge"
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
