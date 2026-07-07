import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
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

const CONTENT_AUTOPLAY_DELAY_MS = 5000;

function contentMotionOptions(reduceMotion: boolean) {
  return reduceMotion
    ? { speed: 0, autoplay: false as const }
    : {
        speed: 300,
        autoplay: { delay: CONTENT_AUTOPLAY_DELAY_MS, disableOnInteraction: false },
      };
}

function createContentSwiper(
  container: HTMLDivElement,
  prev: HTMLButtonElement,
  next: HTMLButtonElement,
  reduceMotion: boolean,
  onChange: (realIndex: number) => void,
) {
  return new Swiper(container, {
    modules: [Autoplay, Navigation],
    ...contentMotionOptions(reduceMotion),
    navigation: { prevEl: prev, nextEl: next },
    loop: true,
    on: {
      slideChange(swiper) {
        onChange(swiper.realIndex);
      },
    },
  });
}

function ContentSlide({ img }: { img: { src: string; alt?: string } }) {
  return (
    <div className="swiper-slide">
      <img
        src={img.src}
        alt={img.alt ?? ""}
        className="content-carousel__image"
      />
    </div>
  );
}

function ContentPlayButton({
  playing,
  reduceMotion,
  onClick,
}: {
  playing: boolean;
  reduceMotion: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="content-carousel__btn"
      aria-label={playing ? "Pause autoplay" : "Resume autoplay"}
      disabled={reduceMotion}
      data-haptic="nudge"
      onClick={onClick}
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
  );
}

function ContentNavButton({
  ref,
  label,
  path,
}: {
  ref: RefObject<HTMLButtonElement | null>;
  label: string;
  path: string;
}) {
  return (
    <button
      ref={ref}
      className="content-carousel__btn"
      aria-label={label}
      data-haptic="nudge"
    >
      <svg
        className="content-carousel__btn-icon"
        viewBox="0 0 32 32"
        fill="currentColor"
      >
        <path d={path} />
      </svg>
    </button>
  );
}

function ContentNavButtons({
  prevRef,
  nextRef,
}: {
  prevRef: RefObject<HTMLButtonElement | null>;
  nextRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <>
      <ContentNavButton
        ref={prevRef}
        label="Previous slide"
        path="M20.3 24.7L11.6 16l8.7-8.7 1.4 1.4L13.4 16l7.3 7.3z"
      />
      <ContentNavButton
        ref={nextRef}
        label="Next slide"
        path="M11.7 24.7l-1.4-1.4 7.3-7.3-7.3-7.3 1.4-1.4 8.7 8.7z"
      />
    </>
  );
}

function ContentBar({
  activeIndex,
  total,
  playing,
  reduceMotion,
  onToggleAutoplay,
  prevRef,
  nextRef,
}: {
  activeIndex: number;
  total: number;
  playing: boolean;
  reduceMotion: boolean;
  onToggleAutoplay: () => void;
  prevRef: RefObject<HTMLButtonElement | null>;
  nextRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="content-carousel__bar">
      <span className="content-carousel__counter">
        {activeIndex} / {total}
      </span>
      <div className="content-carousel__controls">
        <ContentPlayButton
          playing={playing}
          reduceMotion={reduceMotion}
          onClick={onToggleAutoplay}
        />
        <ContentNavButtons prevRef={prevRef} nextRef={nextRef} />
      </div>
    </div>
  );
}

function toggleContentAutoplay(
  swiperRef: RefObject<Swiper | null>,
  reduceMotionRef: RefObject<boolean>,
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

function initContentSwiperEffect(
  containerRef: RefObject<HTMLDivElement | null>,
  prevRef: RefObject<HTMLButtonElement | null>,
  nextRef: RefObject<HTMLButtonElement | null>,
  swiperRef: RefObject<Swiper | null>,
  reduceMotionRef: RefObject<boolean>,
  setReduceMotion: Dispatch<SetStateAction<boolean>>,
  setPlaying: Dispatch<SetStateAction<boolean>>,
  setActiveIndex: Dispatch<SetStateAction<number>>,
): () => void {
  const container = containerRef.current;
  const prev = prevRef.current;
  const next = nextRef.current;
  if (!container || !prev || !next) return () => {};

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  reduceMotionRef.current = motion;
  setReduceMotion(motion);
  setPlaying(!motion);

  const instance = createContentSwiper(container, prev, next, motion, (i) =>
    setActiveIndex(i + 1),
  );
  swiperRef.current = instance;

  return () => {
    instance.destroy(true, true);
    swiperRef.current = null;
  };
}

function useContentCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);
  const reduceMotionRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(
    () =>
      initContentSwiperEffect(
        containerRef,
        prevRef,
        nextRef,
        swiperRef,
        reduceMotionRef,
        setReduceMotion,
        setPlaying,
        setActiveIndex,
      ),
    [],
  );

  const toggleAutoplay = () =>
    toggleContentAutoplay(swiperRef, reduceMotionRef, setPlaying);

  return {
    containerRef,
    prevRef,
    nextRef,
    reduceMotion,
    playing,
    activeIndex,
    toggleAutoplay,
  };
}

export default function ContentCarousel({ images, size = "xl" }: Props) {
  const {
    containerRef,
    prevRef,
    nextRef,
    reduceMotion,
    playing,
    activeIndex,
    toggleAutoplay,
  } = useContentCarousel();

  return (
    <div className={`content-carousel ${sizeClass[size]}`}>
      <div ref={containerRef} className="swiper content-carousel__swiper">
        <div className="swiper-wrapper">
          {images.map((img, i) => (
            <ContentSlide key={`${img.src}-${i}`} img={img} />
          ))}
        </div>
      </div>

      <ContentBar
        activeIndex={activeIndex}
        total={images.length}
        playing={playing}
        reduceMotion={reduceMotion}
        onToggleAutoplay={toggleAutoplay}
        prevRef={prevRef}
        nextRef={nextRef}
      />
    </div>
  );
}
