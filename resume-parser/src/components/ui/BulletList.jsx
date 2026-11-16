// A bulleted or numbered list. React escapes the text, so resume content can't inject markup.
export default function BulletList({ items, emptyText, ordered = false, className = "" }) {
  const Tag = ordered ? "ol" : "ul";
  const style = ordered ? "list-decimal" : "list-disc";
  const list = items.length ? items : [emptyText];
  return (
    <Tag className={`mt-3 ${style} space-y-2 pl-5 text-sm text-ink ${className}`}>
      {list.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </Tag>
  );
}
