interface StatCardProps {
  title: string;
  value: string;
  helperText?: string;
}

export function StatCard({ title, value, helperText }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {helperText ? <p className="mt-1 text-xs text-neutral-500">{helperText}</p> : null}
    </div>
  );
}
