import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
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

function computeAutoplayLabel(reduceMotion: boolean, playing: boolean): string {
  if (reduceMotion) return "Motion paused by preference";
  return playing ? "Pause autoplay" : "Resume autoplay";
}

const HERO_AUTOPLAY_DELAY_MS = 5000;
const SLIDE_CHANGE_EVENT = "slideChange";

function heroMotionOptions(reduceMotion: boolean) {
  return reduceMotion
    ? { effect: "slide" as const, speed: 0, autoplay: false as const }
    : {
        effect: "fade" as const,
        speed: 300,
        autoplay: {
          delay: HERO_AUTOPLAY_DELAY_MS,
          disableOnInteraction: false,
        },
      };
}

function HeroSlideStatus({
  current,
  releasedLabel,
  inDevelopmentLabel,
}: {
  current?: boolean;
  releasedLabel: string;
  inDevelopmentLabel: string;
}) {
  return <>{(current ? inDevelopmentLabel : releasedLabel).toUpperCase()}</>;
}

function HeroSlideImage({
  slide,
  index,
}: {
  slide: ProjectSlide;
  index: number;
}) {
  return (
    <img
      src={slide.image}
      alt={slide.project.title}
      className="hero-carousel__image"
      loading={index === 0 ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function HeroSlideFallback({
  slide,
  releasedLabel,
  inDevelopmentLabel,
}: {
  slide: ProjectSlide;
  releasedLabel: string;
  inDevelopmentLabel: string;
}) {
  return (
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
        <HeroSlideStatus
          current={slide.project.current}
          releasedLabel={releasedLabel}
          inDevelopmentLabel={inDevelopmentLabel}
        />
      </span>
    </div>
  );
}

function HeroSlideMedia({
  slide,
  index,
  releasedLabel,
  inDevelopmentLabel,
}: {
  slide: ProjectSlide;
  index: number;
  releasedLabel: string;
  inDevelopmentLabel: string;
}) {
  return slide.image ? (
    <HeroSlideImage slide={slide} index={index} />
  ) : (
    <HeroSlideFallback
      slide={slide}
      releasedLabel={releasedLabel}
      inDevelopmentLabel={inDevelopmentLabel}
    />
  );
}

function ProjectBadge({
  current,
  releasedLabel,
  inDevelopmentLabel,
}: {
  current?: boolean;
  releasedLabel: string;
  inDevelopmentLabel: string;
}) {
  return (
    <div
      className={`hero-carousel__project-badge${
        current ? " hero-carousel__project-badge--current" : ""
      }`}
    >
      <span
        className={`hero-carousel__project-led${
          current
            ? " hero-carousel__project-led--active"
            : " hero-carousel__project-led--hollow"
        }`}
      />
      <span>
        <HeroSlideStatus
          current={current}
          releasedLabel={releasedLabel}
          inDevelopmentLabel={inDevelopmentLabel}
        />
      </span>
    </div>
  );
}

function ProjectOverlay({
  slide,
  releasedLabel,
  inDevelopmentLabel,
}: {
  slide: ProjectSlide;
  releasedLabel: string;
  inDevelopmentLabel: string;
}) {
  return (
    <div className="hero-carousel__project-overlay">
      <a className="hero-carousel__project-card" href={slide.project.href}>
        <ProjectBadge
          current={slide.project.current}
          releasedLabel={releasedLabel}
          inDevelopmentLabel={inDevelopmentLabel}
        />
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
  );
}

function HeroSlide({
  slide,
  index,
  releasedLabel,
  inDevelopmentLabel,
}: {
  slide: ProjectSlide;
  index: number;
  releasedLabel: string;
  inDevelopmentLabel: string;
}) {
  return (
    <div className="swiper-slide">
      <HeroSlideMedia
        slide={slide}
        index={index}
        releasedLabel={releasedLabel}
        inDevelopmentLabel={inDevelopmentLabel}
      />

      {/* Watermark index */}
      <span className="hero-carousel__watermark">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Project info overlay */}
      <ProjectOverlay
        slide={slide}
        releasedLabel={releasedLabel}
        inDevelopmentLabel={inDevelopmentLabel}
      />
    </div>
  );
}

function PlayIcon({
  playing,
  iconClassName,
}: {
  playing: boolean;
  iconClassName: string;
}) {
  return (
    <svg className={iconClassName} viewBox="0 0 32 32" fill="currentColor">
      {playing ? (
        <path d="M12 8h3v16h-3zM17 8h3v16h-3z" />
      ) : (
        <path d="M10 8l14 8-14 8z" />
      )}
    </svg>
  );
}

function motionControlClass(base: string, reduceMotion: boolean): string {
  return reduceMotion ? `${base} hero-carousel__motion-control--paused` : base;
}

function PlayControl({
  playing,
  reduceMotion,
  autoplayLabel,
  onClick,
  className,
  iconClassName,
}: {
  playing: boolean;
  reduceMotion: boolean;
  autoplayLabel: string;
  onClick: () => void;
  className: string;
  iconClassName: string;
}) {
  return (
    <button
      className={motionControlClass(className, reduceMotion)}
      type="button"
      aria-label={autoplayLabel}
      aria-disabled={reduceMotion}
      title={autoplayLabel}
      data-reduced-label={reduceMotion ? autoplayLabel : undefined}
      data-haptic="nudge"
      onClick={onClick}
    >
      <PlayIcon playing={playing} iconClassName={iconClassName} />
      {reduceMotion && (
        <span className="hero-carousel__motion-tooltip" role="status">
          {autoplayLabel}
        </span>
      )}
    </button>
  );
}

function ProjectRailHeader({
  count,
  mapOpen,
  onToggleMap,
}: {
  count: number;
  mapOpen: boolean;
  onToggleMap: () => void;
}) {
  return (
    <div className="hero-carousel__rail-header">
      <span className="hero-carousel__rail-label">MAP · {count}</span>
      {count > 3 && (
        <button
          type="button"
          className="hero-carousel__rail-expand"
          aria-expanded={mapOpen}
          onClick={onToggleMap}
        >
          {mapOpen ? "LESS" : "MORE"}
        </button>
      )}
    </div>
  );
}

function ProjectRailList({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: ProjectSlide[];
  activeIndex: number;
  onSelect: (index: number, trigger: HTMLButtonElement) => void;
}) {
  return (
    <div className="hero-carousel__rail-list">
      {slides.map((slide, i) => (
        <button
          key={`${slide.project.title}-${i}`}
          type="button"
          className={`hero-carousel__rail-item${
            activeIndex === i ? " hero-carousel__rail-item--active" : ""
          }`}
          aria-current={activeIndex === i ? "true" : undefined}
          onClick={(event) => onSelect(i, event.currentTarget)}
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
  );
}

function ProjectRail({
  slides,
  activeIndex,
  mapOpen,
  onToggleMap,
  onSelect,
}: {
  slides: ProjectSlide[];
  activeIndex: number;
  mapOpen: boolean;
  onToggleMap: () => void;
  onSelect: (index: number, trigger: HTMLButtonElement) => void;
}) {
  return (
    <div
      className={`hero-carousel__project-rail${
        mapOpen ? " hero-carousel__project-rail--open" : ""
      }`}
      aria-label="Featured project index"
    >
      <ProjectRailHeader
        count={slides.length}
        mapOpen={mapOpen}
        onToggleMap={onToggleMap}
      />
      <ProjectRailList
        slides={slides}
        activeIndex={activeIndex}
        onSelect={onSelect}
      />
    </div>
  );
}

function MobileList({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: ProjectSlide[];
  activeIndex: number;
  onSelect: (index: number, trigger: HTMLButtonElement) => void;
}) {
  return (
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
          onClick={(event) => onSelect(i, event.currentTarget)}
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
  );
}

function MobileStrip({
  slides,
  activeIndex,
  playing,
  reduceMotion,
  autoplayLabel,
  onToggleAutoplay,
  onSelect,
}: {
  slides: ProjectSlide[];
  activeIndex: number;
  playing: boolean;
  reduceMotion: boolean;
  autoplayLabel: string;
  onToggleAutoplay: () => void;
  onSelect: (index: number, trigger: HTMLButtonElement) => void;
}) {
  return (
    <div
      className="hero-carousel__mobile-strip"
      aria-label="Featured project selector"
    >
      <PlayControl
        playing={playing}
        reduceMotion={reduceMotion}
        autoplayLabel={autoplayLabel}
        onClick={onToggleAutoplay}
        className="hero-carousel__mobile-play"
        iconClassName="hero-carousel__mobile-play-icon"
      />
      <span className="hero-carousel__mobile-counter" aria-live="polite">
        {String(activeIndex + 1).padStart(2, "0")} /{" "}
        {String(slides.length).padStart(2, "0")}
      </span>
      <MobileList
        slides={slides}
        activeIndex={activeIndex}
        onSelect={onSelect}
      />
    </div>
  );
}

function HeroNav({
  playing,
  reduceMotion,
  autoplayLabel,
  onToggleAutoplay,
}: {
  playing: boolean;
  reduceMotion: boolean;
  autoplayLabel: string;
  onToggleAutoplay: () => void;
}) {
  return (
    <nav className="hero-carousel__nav">
      <PlayControl
        playing={playing}
        reduceMotion={reduceMotion}
        autoplayLabel={autoplayLabel}
        onClick={onToggleAutoplay}
        className="hero-carousel__stop btn btn--icon btn--md"
        iconClassName="btn__icon"
      />
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
  );
}

function ScrollIndicator() {
  return (
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
  );
}

function initHeroSwiperEffect(
  containerRef: { current: HTMLDivElement | null },
  swiperRef: { current: Swiper | null },
  reduceMotionRef: { current: boolean },
  setReduceMotion: Dispatch<SetStateAction<boolean>>,
  setPlaying: Dispatch<SetStateAction<boolean>>,
  setActiveIndex: Dispatch<SetStateAction<number>>,
): () => void {
  let isMounted = true;
  let instance: Swiper | null = null;

  void (async () => {
    if (!containerRef.current) return;
    const [{ default: Swiper }, { Autoplay, EffectFade, Navigation }] =
      await Promise.all([import("swiper"), import("swiper/modules")]);
    if (!isMounted || !containerRef.current) return;
    const motion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reduceMotionRef.current = motion;
    setReduceMotion(motion);
    setPlaying(!motion);
    instance = new Swiper(containerRef.current, {
      modules: [Autoplay, EffectFade, Navigation],
      ...heroMotionOptions(motion),
      navigation: {
        prevEl: ".hero-carousel__prev",
        nextEl: ".hero-carousel__next",
      },
      loop: true,
    });
    instance.on(SLIDE_CHANGE_EVENT, () =>
      setActiveIndex(instance?.realIndex ?? 0),
    );
    swiperRef.current = instance;
  })();

  return () => {
    isMounted = false;
    instance?.destroy(true, true);
    swiperRef.current = null;
  };
}

function toggleHeroAutoplay(
  swiperRef: { current: Swiper | null },
  reduceMotionRef: { current: boolean },
  setPlaying: Dispatch<SetStateAction<boolean>>,
) {
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

function selectHeroProject(
  swiperRef: { current: Swiper | null },
  index: number,
  trigger: HTMLButtonElement | undefined,
  setPlaying: Dispatch<SetStateAction<boolean>>,
  setActiveIndex: Dispatch<SetStateAction<number>>,
) {
  const swiper = swiperRef.current;
  if (!swiper) return;
  swiper.slideToLoop(index);
  swiper.autoplay.stop();
  setPlaying(false);
  setActiveIndex(index);
  trigger?.blur();
}

function useHeroCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);
  const reduceMotionRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(
    () =>
      initHeroSwiperEffect(
        containerRef,
        swiperRef,
        reduceMotionRef,
        setReduceMotion,
        setPlaying,
        setActiveIndex,
      ),
    [],
  );

  const toggleAutoplay = () =>
    toggleHeroAutoplay(swiperRef, reduceMotionRef, setPlaying);
  const selectProject = (index: number, trigger?: HTMLButtonElement) =>
    selectHeroProject(swiperRef, index, trigger, setPlaying, setActiveIndex);

  return {
    containerRef,
    reduceMotion,
    playing,
    activeIndex,
    mapOpen,
    toggleAutoplay,
    selectProject,
    toggleMap: () => setMapOpen((open) => !open),
  };
}

function heroCarouselClass(fullscreen?: boolean): string {
  return fullscreen
    ? "hero-carousel hero-carousel--fullscreen"
    : "hero-carousel";
}

function HeroSwiper({
  containerRef,
  slides,
  releasedLabel,
  inDevelopmentLabel,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  slides: ProjectSlide[];
  releasedLabel: string;
  inDevelopmentLabel: string;
}) {
  return (
    <div ref={containerRef} className="swiper hero-carousel__swiper">
      <div className="swiper-wrapper">
        {slides.map((slide, i) => (
          <HeroSlide
            key={slide.image ?? `fallback-${i}`}
            slide={slide}
            index={i}
            releasedLabel={releasedLabel}
            inDevelopmentLabel={inDevelopmentLabel}
          />
        ))}
      </div>
    </div>
  );
}

interface HeroControlsProps {
  slides: ProjectSlide[];
  activeIndex: number;
  mapOpen: boolean;
  playing: boolean;
  reduceMotion: boolean;
  autoplayLabel: string;
  onToggleAutoplay: () => void;
  onSelect: (index: number, trigger: HTMLButtonElement) => void;
  onToggleMap: () => void;
  fullscreen?: boolean;
}

function HeroControls({
  slides,
  activeIndex,
  mapOpen,
  playing,
  reduceMotion,
  autoplayLabel,
  onToggleAutoplay,
  onSelect,
  onToggleMap,
  fullscreen,
}: HeroControlsProps) {
  return (
    <>
      <ProjectRail
        slides={slides}
        activeIndex={activeIndex}
        mapOpen={mapOpen}
        onToggleMap={onToggleMap}
        onSelect={onSelect}
      />
      <MobileStrip
        slides={slides}
        activeIndex={activeIndex}
        playing={playing}
        reduceMotion={reduceMotion}
        autoplayLabel={autoplayLabel}
        onToggleAutoplay={onToggleAutoplay}
        onSelect={onSelect}
      />
      <HeroNav
        playing={playing}
        reduceMotion={reduceMotion}
        autoplayLabel={autoplayLabel}
        onToggleAutoplay={onToggleAutoplay}
      />
      {fullscreen && <ScrollIndicator />}
    </>
  );
}

export default function HeroCarousel({
  slides,
  fullscreen,
  releasedLabel,
  inDevelopmentLabel,
}: Props) {
  const {
    containerRef,
    reduceMotion,
    playing,
    activeIndex,
    mapOpen,
    toggleAutoplay,
    selectProject,
    toggleMap,
  } = useHeroCarousel();
  const autoplayLabel = computeAutoplayLabel(reduceMotion, playing);

  return (
    <div className={heroCarouselClass(fullscreen)}>
      <HeroSwiper
        containerRef={containerRef}
        slides={slides}
        releasedLabel={releasedLabel}
        inDevelopmentLabel={inDevelopmentLabel}
      />
      <HeroControls
        slides={slides}
        activeIndex={activeIndex}
        mapOpen={mapOpen}
        playing={playing}
        reduceMotion={reduceMotion}
        autoplayLabel={autoplayLabel}
        onToggleAutoplay={toggleAutoplay}
        onSelect={selectProject}
        onToggleMap={toggleMap}
        fullscreen={fullscreen}
      />
    </div>
  );
}
