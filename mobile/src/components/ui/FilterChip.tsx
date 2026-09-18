import './FilterChip.css';

interface FilterChipProps {
  readonly label: string;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}

function FilterChip({
  label,
  selected = false,
  disabled = false,
  onClick,
}: FilterChipProps) {
  return (
    <button
      className={`zf-filter-chip${
        selected ? ' zf-filter-chip--selected' : ''
      }`}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default FilterChip;
