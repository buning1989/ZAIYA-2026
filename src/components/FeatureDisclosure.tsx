function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-line" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function FeatureDisclosure({
  label = "查看具体产品体现",
  items,
}: {
  label?: string;
  items: string[];
}) {
  return (
    <details className="group mt-5">
      <summary className="w-fit cursor-pointer select-none list-none text-[13px] font-medium text-ink-faint transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">{label} +</span>
        <span className="hidden group-open:inline">收起 −</span>
      </summary>
      <div className="mt-3">
        <FeatureList items={items} />
      </div>
    </details>
  );
}
