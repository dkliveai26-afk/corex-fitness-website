export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-5xl">{title}</h2>
    </div>
  );
}
