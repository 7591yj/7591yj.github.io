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
          <div className="project-filter__chips">
            {allTechs.map((tech) => (
              <button
                key={tech}
                className={`project-filter__chip ${activeTechs.has(tech) ? "project-filter__chip--active" : ""}`}
                onClick={() => onToggleTech(tech)}
              >
                {tech}
              </button>
            ))}
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
