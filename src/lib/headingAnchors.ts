import { defineHastPlugin } from "satteri";
import Slugger from "github-slugger";

// Astro keeps these IDs; detail.client.ts uses headings as link targets.
export const headingAnchors = () => {
  const slugger = new Slugger();

  return defineHastPlugin({
    name: "heading-anchors",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node, ctx) {
        const existingId = node.properties?.id;
        const id =
          typeof existingId === "string"
            ? existingId
            : slugger.slug(ctx.textContent(node));

        ctx.setProperty(node, "id", id);
      },
    },
  });
};
