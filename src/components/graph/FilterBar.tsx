import { useState, useEffect, useRef } from "react";

interface Props {
  allTags: string[];
  allTechs: string[];
  activeTags: Set<string>;
  activeTechs: Set<string>;
  onToggleTag: (tag: string) => void;
  onToggleTech: (tech: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  allTags,
  allTechs,
  activeTags,
  activeTechs,
  onToggleTag,
  onToggleTech,
  onClear,
}: Props) {
  const hasActive = activeTags.size > 0 || activeTechs.size > 0;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const techCount = activeTechs.size;

  return (
    <div className="project-filter">
      <div className="project-filter__groups">
        <div className="project-filter__group">
          <span className="project-filter__label">Category</span>
          <div className="project-filter__chips">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`project-filter__chip ${activeTags.has(tag) ? "project-filter__chip--active" : ""}`}
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="project-filter__group">
          <span className="project-filter__label">Tech</span>
          <div className="project-filter__dropdown" ref={dropdownRef}>
            <button
              className={`project-filter__dropdown-trigger ${techCount > 0 ? "project-filter__dropdown-trigger--active" : ""}`}
              onClick={() => setOpen((v) => !v)}
            >
              {techCount > 0 ? `${techCount} selected` : "Select tech…"}
              <span aria-hidden>▾</span>
            </button>
            {open && (
              <div className="project-filter__dropdown-menu">
                {allTechs.map((tech) => (
                  <button
                    key={tech}
                    className="project-filter__dropdown-item"
                    onClick={() => onToggleTech(tech)}
                  >
                    <span
                      className={`project-filter__dropdown-check ${activeTechs.has(tech) ? "project-filter__dropdown-check--active" : ""}`}
                    />
                    <span>{tech}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasActive && (
        <button className="project-filter__clear" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
