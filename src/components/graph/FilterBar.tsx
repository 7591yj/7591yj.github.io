import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";
import { triggerHaptic } from "../../haptics-instance";
import { TICK } from "../../haptics";

interface Props {
  allTags: string[];
  allTechs: string[];
  activeTags: Set<string>;
  activeTechs: Set<string>;
  onToggleTag: (tag: string) => void;
  onToggleTech: (tech: string) => void;
  onClear: () => void;
  selectTechLabel: string;
  techSelectedTemplate: string;
  clearLabel: string;
}

const CHIP_CLASS = "project-filter__chip";
const DROPDOWN_TRIGGER_CLASS = "project-filter__dropdown-trigger";
const DROPDOWN_CHECK_CLASS = "project-filter__dropdown-check";
const COUNT_PLACEHOLDER = "{count}";

function optionalClass(enabled: boolean, className: string): string {
  return enabled ? className : "";
}

function className(parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

function hasSelections(
  activeTags: Set<string>,
  activeTechs: Set<string>,
): boolean {
  return activeTags.size + activeTechs.size > 0;
}

function chipClassName(active: boolean): string {
  return className([
    CHIP_CLASS,
    optionalClass(active, "project-filter__chip--active"),
  ]);
}

function dropdownTriggerClassName(active: boolean): string {
  return className([
    DROPDOWN_TRIGGER_CLASS,
    optionalClass(active, "project-filter__dropdown-trigger--active"),
  ]);
}

function dropdownCheckClassName(active: boolean): string {
  return className([
    DROPDOWN_CHECK_CLASS,
    optionalClass(active, "project-filter__dropdown-check--active"),
  ]);
}

function techButtonLabel(
  selectedCount: number,
  selectedTemplate: string,
  fallbackLabel: string,
): string {
  if (selectedCount === 0) return fallbackLabel;
  return selectedTemplate.replace(COUNT_PLACEHOLDER, String(selectedCount));
}

function tick() {
  triggerHaptic(TICK);
}

function targetIsInside(
  ref: RefObject<HTMLDivElement | null>,
  target: EventTarget | null,
): boolean {
  return ref.current?.contains(target as Node) === true;
}

function useOutsideClose(
  open: boolean,
  ref: RefObject<HTMLDivElement | null>,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (!targetIsInside(ref, event.target)) onClose();
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, ref, onClose]);
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onToggle: (value: string) => void;
}

function FilterChip({ label, active, onToggle }: FilterChipProps) {
  const handleClick = () => {
    onToggle(label);
    tick();
  };

  return (
    <button className={chipClassName(active)} onClick={handleClick}>
      {label}
    </button>
  );
}

interface CategoryGroupProps {
  allTags: string[];
  activeTags: Set<string>;
  onToggleTag: (tag: string) => void;
}

function CategoryGroup({
  allTags,
  activeTags,
  onToggleTag,
}: CategoryGroupProps) {
  return (
    <div className="project-filter__group">
      <span className="project-filter__label">Category</span>
      <div className="project-filter__chips">
        {allTags.map((tag) => (
          <FilterChip
            key={tag}
            label={tag}
            active={activeTags.has(tag)}
            onToggle={onToggleTag}
          />
        ))}
      </div>
    </div>
  );
}

interface TechDropdownTriggerProps {
  selectedCount: number;
  selectedTemplate: string;
  fallbackLabel: string;
  onClick: () => void;
}

function TechDropdownTrigger({
  selectedCount,
  selectedTemplate,
  fallbackLabel,
  onClick,
}: TechDropdownTriggerProps) {
  return (
    <button
      className={dropdownTriggerClassName(selectedCount > 0)}
      onClick={onClick}
    >
      {techButtonLabel(selectedCount, selectedTemplate, fallbackLabel)}
      <span aria-hidden>▾</span>
    </button>
  );
}

interface TechDropdownItemProps {
  tech: string;
  active: boolean;
  onToggleTech: (tech: string) => void;
}

function TechDropdownItem({
  tech,
  active,
  onToggleTech,
}: TechDropdownItemProps) {
  const handleClick = () => {
    onToggleTech(tech);
    tick();
  };

  return (
    <button className="project-filter__dropdown-item" onClick={handleClick}>
      <span className={dropdownCheckClassName(active)} />
      <span>{tech}</span>
    </button>
  );
}

interface TechDropdownMenuProps {
  open: boolean;
  allTechs: string[];
  activeTechs: Set<string>;
  onToggleTech: (tech: string) => void;
}

function TechDropdownMenu({
  open,
  allTechs,
  activeTechs,
  onToggleTech,
}: TechDropdownMenuProps) {
  if (!open) return null;

  return (
    <div className="project-filter__dropdown-menu">
      {allTechs.map((tech) => (
        <TechDropdownItem
          key={tech}
          tech={tech}
          active={activeTechs.has(tech)}
          onToggleTech={onToggleTech}
        />
      ))}
    </div>
  );
}

interface TechGroupProps {
  allTechs: string[];
  activeTechs: Set<string>;
  open: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  selectTechLabel: string;
  techSelectedTemplate: string;
  onToggleOpen: () => void;
  onToggleTech: (tech: string) => void;
}

function TechGroup({
  allTechs,
  activeTechs,
  open,
  dropdownRef,
  selectTechLabel,
  techSelectedTemplate,
  onToggleOpen,
  onToggleTech,
}: TechGroupProps) {
  return (
    <div className="project-filter__group">
      <span className="project-filter__label">Tech</span>
      <div className="project-filter__dropdown" ref={dropdownRef}>
        <TechDropdownTrigger
          selectedCount={activeTechs.size}
          selectedTemplate={techSelectedTemplate}
          fallbackLabel={selectTechLabel}
          onClick={onToggleOpen}
        />
        <TechDropdownMenu
          open={open}
          allTechs={allTechs}
          activeTechs={activeTechs}
          onToggleTech={onToggleTech}
        />
      </div>
    </div>
  );
}

interface ClearButtonProps {
  visible: boolean;
  label: string;
  onClear: () => void;
}

function ClearButton({ visible, label, onClear }: ClearButtonProps) {
  if (!visible) return null;
  return (
    <button className="project-filter__clear" onClick={onClear}>
      {label}
    </button>
  );
}

export default function FilterBar({
  allTags,
  allTechs,
  activeTags,
  activeTechs,
  onToggleTag,
  onToggleTech,
  onClear,
  selectTechLabel,
  techSelectedTemplate,
  clearLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setOpen(false), []);
  const toggleDropdown = useCallback(() => setOpen((value) => !value), []);

  useOutsideClose(open, dropdownRef, closeDropdown);

  return (
    <div className="project-filter">
      <div className="project-filter__groups">
        <CategoryGroup
          allTags={allTags}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
        <TechGroup
          allTechs={allTechs}
          activeTechs={activeTechs}
          open={open}
          dropdownRef={dropdownRef}
          selectTechLabel={selectTechLabel}
          techSelectedTemplate={techSelectedTemplate}
          onToggleOpen={toggleDropdown}
          onToggleTech={onToggleTech}
        />
      </div>
      <ClearButton
        visible={hasSelections(activeTags, activeTechs)}
        label={clearLabel}
        onClear={onClear}
      />
    </div>
  );
}
