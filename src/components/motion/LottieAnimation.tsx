import Lottie from "lottie-react";
import type { LottieComponentProps } from "lottie-react";

interface Props {
  animationData: LottieComponentProps["animationData"];
  loop?: boolean;
  className?: string;
}

export default function LottieAnimation({
  animationData,
  loop = true,
  className,
}: Props) {
  return (
    <Lottie animationData={animationData} loop={loop} className={className} />
  );
}
