export function SectionSkeleton({ label }: { label: string }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-serif text-[22px] font-bold text-fg">{label}</h2>
        <div className="h-px flex-1 bg-rule" />
      </div>
      <div className="grid auto-rows-[260px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-pulse rounded-lg bg-rule sm:col-span-2 sm:row-span-2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-rule" />
        ))}
      </div>
    </section>
  );
}
