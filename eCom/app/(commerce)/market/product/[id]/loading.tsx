export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="h-10 w-32 rounded-md vyapar-skeleton" />
        <div className="h-10 w-24 rounded-md vyapar-skeleton" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 w-full rounded-xl vyapar-skeleton" />
        <div className="space-y-4 rounded-xl border bg-background p-6">
          <div className="h-7 w-3/4 rounded-md vyapar-skeleton" />
          <div className="h-5 w-1/2 rounded-md vyapar-skeleton" />
          <div className="h-24 w-full rounded-md vyapar-skeleton" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-10 w-full rounded-md vyapar-skeleton" />
            <div className="h-10 w-full rounded-md vyapar-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
