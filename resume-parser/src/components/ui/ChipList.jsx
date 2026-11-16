import Chip from "./Chip.jsx";

// A wrapped row of chips. Shows `emptyText` as a neutral chip when there are no items.
export default function ChipList({ items, tone, emptyText }) {
  if (!items.length) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip>{emptyText}</Chip>
      </div>
    );
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <Chip key={item} tone={tone}>
          {item}
        </Chip>
      ))}
    </div>
  );
}
