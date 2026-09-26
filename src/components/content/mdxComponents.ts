import Accordion from "./Accordion.astro";
import ColorText from "./ColorText.astro";
import ContentImage from "./ContentImage.astro";
import ImageGrid from "./ImageGrid.astro";
import TerminalBlock from "./TerminalBlock.astro";
import ImageContainer from "../ui/ImageContainer.astro";

// Available in every entry under src/content without an import. Components
// that hydrate (`client:*`) still have to be imported where they are used.
export const mdxComponents = {
  Accordion,
  ColorText,
  ContentImage,
  ImageContainer,
  ImageGrid,
  TerminalBlock,
};
