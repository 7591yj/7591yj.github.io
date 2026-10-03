/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-strict-value"],
  ignoreFiles: ["dist/**", "node_modules/**", "public/**"],
  rules: {
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      [
        "rgb",
        "rgba",
        "hsl",
        "hsla",
        "hwb",
        "lab",
        "lch",
        "oklab",
        "oklch",
        "cubic-bezier",
      ],
      { message: (fn) => `Use a token from tokens.css instead of ${fn}()` },
    ],
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "fill", "stroke", "z-index"],
      {
        ignoreValues: [
          "currentcolor",
          "currentColor",
          "transparent",
          "inherit",
          "none",
          "auto",
          "/^-?\\d$/",
        ],
        disableFix: true,
      },
    ],

    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "custom-variant",
          "utility",
          "variant",
          "apply",
          "reference",
        ],
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      { ignorePseudoClasses: ["global"] },
    ],

    "selector-class-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
      {
        message: (selector) =>
          `Expected class "${selector}" to be BEM-style kebab-case`,
      },
    ],

    "no-descending-specificity": null,

    "alpha-value-notation": null,
    "color-function-alias-notation": null,
    "color-function-notation": null,
    "color-hex-length": null,
    "custom-property-empty-line-before": null,
    "declaration-empty-line-before": null,
    "font-family-name-quotes": null,
    "import-notation": "string",
    "length-zero-no-unit": null,
    "media-feature-range-notation": null,
    "property-no-vendor-prefix": null,
    "rule-empty-line-before": null,
    "value-keyword-case": null,
  },
  overrides: [
    {
      files: ["**/*.astro"],
      customSyntax: "postcss-html",
    },
    {
      files: [
        "src/styles/tokens.css",
        "src/components/content/*Logo/*.astro",
        "src/content/**/*.css",
      ],
      rules: {
        "color-no-hex": null,
        "color-named": null,
        "function-disallowed-list": null,
        "scale-unlimited/declaration-strict-value": null,
      },
    },
  ],
};
