import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

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
  return (
    <Swiper
      modules={[Autoplay, EffectFade, Pagination]}
      effect="fade"
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      className="w-full aspect-[16/9] rounded-lg overflow-hidden"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.image}>
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          {(slide.title || slide.subtitle) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              {slide.title && (
                <h3 className="text-xl font-bold text-white">{slide.title}</h3>
              )}
              {slide.subtitle && (
                <p className="text-sm text-white/70 mt-1">{slide.subtitle}</p>
              )}
            </div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
