export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 w-2/3 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-40 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
