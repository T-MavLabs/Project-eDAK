export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 mb-8">
        <div className="h-4 w-32 rounded-md vyapar-skeleton" />
        <div className="h-8 w-64 rounded-md vyapar-skeleton" />
        <div className="h-5 w-96 rounded-md vyapar-skeleton" />
      </div>

      <div className="mt-8 rounded-2xl border bg-muted/20 p-6 mb-10">
        <div className="h-6 w-48 rounded-md vyapar-skeleton mb-2" />
        <div className="h-4 w-72 rounded-md vyapar-skeleton" />
      </div>

      <div className="mt-10 mb-6">
        <div className="h-4 w-40 rounded-md vyapar-skeleton mb-2" />
        <div className="h-6 w-56 rounded-md vyapar-skeleton mb-2" />
        <div className="h-4 w-80 rounded-md vyapar-skeleton" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-background p-5">
            <div className="h-5 w-32 rounded-md vyapar-skeleton mb-2" />
            <div className="h-4 w-24 rounded-md vyapar-skeleton" />
          </div>
        ))}
      </div>

      <div className="mt-10 mb-6">
        <div className="h-4 w-40 rounded-md vyapar-skeleton mb-2" />
        <div className="h-6 w-56 rounded-md vyapar-skeleton mb-2" />
        <div className="h-4 w-80 rounded-md vyapar-skeleton" />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border bg-background overflow-hidden">
            <div className="h-52 w-full vyapar-skeleton" />
            <div className="p-5 space-y-3">
              <div className="h-6 w-3/4 rounded-md vyapar-skeleton" />
              <div className="h-4 w-24 rounded-md vyapar-skeleton" />
              <div className="h-5 w-1/2 rounded-md vyapar-skeleton" />
              <div className="h-9 w-full rounded-md vyapar-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
