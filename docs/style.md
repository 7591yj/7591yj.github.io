# Style Components

This document outlines all custom CSS components available in `src/styles/components/`.

---

## Button (`button.css`)

Primary button styles for CTAs and navigation actions.

### Classes

| Class | Description |
|-------|-------------|
| `.button` | Primary button with dark background, rounded corners, and hover effect |
| `.back-nav-button` | Transparent navigation button with blur effect on hover |
| `.w-nav-button` | Mobile menu toggle button (hidden by default) |

### Usage

```html
<a class="button" href="#">Primary Action</a>
<a class="back-nav-button" href="#">Back</a>
```

---

## Typography (`typography.css`)

Global typography rules for headings, paragraphs, lists, tables, and code blocks.

### Headings

| Element | Style |
|---------|-------|
| `h1` | 4xl, light weight, text-balance |
| `h2` | 3xl, light weight, border-bottom |
| `h3` | 2xl, normal weight, mt-6 |
| `h4` | xl, normal weight, mt-6 |
| `h5` | lg, normal weight, mt-6 |

### Utility Classes

| Class | Description |
|-------|-------------|
| `.lead` | Extra large text (xl) |
| `.large` | Large semibold text |
| `.small` | Small medium-weight text |

### Code

Inline `code` elements receive monospace font with dark background (`#353535`).

---

## Chips (`chips.css`)

Technology tag chips for displaying tech stacks on project cards.

### Classes

| Class | Description |
|-------|-------------|
| `.chips-container` | Flex container with gap for chip layout |
| `.chips-container.chips-container-small-width` | Constrained width variant (max 380px) |
| `.single-chip` | Individual chip with monospace font |
| `.single-chip.small-chip` | Smaller chip variant |

### Usage

```html
<div class="chips-container">
  <span class="single-chip">TypeScript</span>
  <span class="single-chip">React</span>
  <span class="single-chip small-chip">CSS</span>
</div>
```

---

## Labels (`labels.css`)

Text labels for headings, descriptions, and metadata.

### Classes

| Class | Description |
|-------|-------------|
| `.label-white` | Primary white label (16px) |
| `.label-gray` | Secondary gray label (14px) |
| `.mini-label-white` | Small uppercase label with tracking |
| `.mini-label-white.gray-color` | Gray variant of mini label |

### Usage

```html
<div class="label-white">Project Title</div>
<div class="label-gray">A brief description</div>
<div class="mini-label-white">Category</div>
```

---

## Project Card (`project-card.css`)

Card for displaying project information on listing pages.

### Classes

| Class | Description |
|-------|-------------|
| `.project-card` | Card container with backdrop blur and shadow |

### Features

- Rounded corners (2xl)
- Semi-transparent background with blur effect
- Subtle border shadow for glass effect
- Styled headings (white), paragraphs (gray), and lists

### Usage

```html
<div class="project-card">
  <h4>Project Name</h4>
  <p>Project description goes here.</p>
  <div class="chips-container">
    <span class="single-chip">Tech</span>
  </div>
</div>
```

---

## Projects (`projects.css`)

Styles for project listings on the homepage and category pages.

### Classes

| Class | Description |
|-------|-------------|
| `.projects-container` | Flex container for project items |
| `.projects-section` | Section wrapper with vertical gap |
| `.single-projects-category` | Category item container |
| `.single-projects-content` | Content area within project item |
| `.projects-category-image` | Category icon (82x82px) |
| `.projects-category-image-container` | Glass-morphism container for category icon |
| `.project-desc` | Project description text |
| `.project-desc.project-desc-list` | List variant with negative margin |

### Responsive Behavior

- Mobile (< 768px): Stacks vertically, reduced icon size (64x64px)

---

## Sidebar (`sidebar.css`)

Main navigation sidebar containing profile info and navigation links.

### Classes

| Class | Description |
|-------|-------------|
| `.sidebar` | Sidebar container (280px max-width) |

### Responsive Behavior

- Tablet/Mobile (< 992px): Collapses to horizontal top bar

---

## Navigation (`nav.css`)

Navigation components including sidebar nav links and mobile menu.

### Classes

| Class | Description |
|-------|-------------|
| `.nav-content` | Navigation content container |
| `.nav-link-container` | Individual nav link wrapper |
| `.nav-link-container.w--current` | Active state styling |
| `.nav-link-text` | Nav link text |
| `.nav-link-image` | Nav link icon |
| `.niv-data` | Profile data container |
| `.niv-image` | Profile image |
| `.w-nav` | Navigation wrapper |
| `.w-nav-brand` | Logo/brand area |
| `.w-nav-menu` | Navigation menu container |
| `.w-nav-menu.is-open` | Mobile menu open state |

### Responsive Behavior

- Tablet (< 992px): Menu toggles visibility, nav links become full-width
- Mobile (< 768px): Adjusted padding

---

## Back Navigation (`back-nav.css`)

Navigation element for returning to parent pages.

### Classes

| Class | Description |
|-------|-------------|
| `.back-nav-container` | Container for back navigation |
| `.back-nav-img` | Back arrow icon (18px) |

### Usage

```html
<a class="back-nav-button" href="/">
  <div class="back-nav-container">
    <img class="back-nav-img" src="/arrow.svg" alt="Back" />
    <div>Home</div>
  </div>
</a>
```

---

## Import Order

All components are imported via `components.css`:

```css
@import "./button.css";
@import "./typography.css";
@import "./project-card.css";
@import "./sidebar.css";
@import "./projects.css";
@import "./nav.css";
@import "./back-nav.css";
@import "./chips.css";
@import "./labels.css";
```
