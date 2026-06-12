type IconName = "clock" | "dumbbell" | "heart" | "spark" | "star" | "trainer";

export function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    dumbbell: "M6 7v10m12-10v10M3 10v4m18-4v4M6 12h12",
    heart: "M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.8 2.6Z",
    spark: "M13 2 4 14h7l-1 8 10-13h-7V2Z",
    star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z",
    trainer: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0"
  };

  return (
    <span className="grid size-12 place-items-center rounded-md bg-red-600/15 text-red-400 ring-1 ring-red-500/25">
      <svg
        aria-hidden="true"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d={paths[name]} />
      </svg>
    </span>
  );
}

export function StarRating() {
  return (
    <div aria-label="5 star rating" className="flex gap-1 text-red-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg aria-hidden="true" className="size-5 fill-current" key={index} viewBox="0 0 24 24">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      ))}
    </div>
  );
}
