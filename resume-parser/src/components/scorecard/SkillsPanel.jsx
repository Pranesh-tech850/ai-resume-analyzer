import Card from "../ui/Card.jsx";
import ChipList from "../ui/ChipList.jsx";

// One card with a primary chip group and an optional secondary group underneath.
export default function SkillsPanel({ title, titleTone, items, tone, emptyText, secondary }) {
  return (
    <Card>
      <h3 className={`font-semibold ${titleTone}`}>{title}</h3>
      <ChipList items={items} tone={tone} emptyText={emptyText} />

      {secondary && (
        <>
          <h3 className={`mt-6 font-semibold ${secondary.titleTone ?? "text-ink"}`}>
            {secondary.title}
          </h3>
          <ChipList items={secondary.items} tone={secondary.tone} emptyText={secondary.emptyText} />
        </>
      )}
    </Card>
  );
}
