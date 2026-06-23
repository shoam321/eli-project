type StatusCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function StatusCard({ title, value, description }: StatusCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </article>
  );
}
