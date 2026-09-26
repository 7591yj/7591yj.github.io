import { defineHastPlugin } from "satteri";
import Slugger from "github-slugger";

// Runs before Astro's heading-ids plugin, which keeps any id set here. The
// anchor stays empty (the "#" is drawn in CSS) so the table of contents
// doesn't pick it up as heading text.
export const headingAnchors = () => {
  const slugger = new Slugger();

  return defineHastPlugin({
    name: "heading-anchors",
    element: {
      filter: ["h1", "h2","h3", "h4", "h5", "h6"],
      visit(node, ctx) {
        const existingId = node.properties?.id;
        const id =
          typeof existingId === "string"
            ? existingId
            : slugger.slug(ctx.textContent(node));

        ctx.setProperty(node, "id", id);
        ctx.appendChild(node, {
          type: "element",
          tagName: "a",
          properties: {
            className: ["heading-anchor"],
            ariaHidden: "true",
            tabIndex: -1,
            href: `#${id}`,
          },
          children: [],
        });
      },
    },
  });
};
