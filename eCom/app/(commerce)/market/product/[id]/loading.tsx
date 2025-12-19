export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="h-10 w-32 rounded-md bg-muted" />
        <div className="h-10 w-24 rounded-md bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 w-full rounded-md bg-muted/40" />
        <div className="space-y-4 rounded-md border bg-background p-6">
          <div className="h-7 w-3/4 rounded-md bg-muted" />
          <div className="h-5 w-1/2 rounded-md bg-muted" />
          <div className="h-24 w-full rounded-md bg-muted/40" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-10 w-full rounded-md bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
