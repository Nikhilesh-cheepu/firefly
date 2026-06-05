type Props = {
  title: string;
  hint?: string;
};

export function AdminDbError({ title, hint }: Props) {
  return (
    <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-6 text-red-100">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm opacity-90">
        {hint ?? (
          <>
            Run <code className="font-mono text-ff-glow">npm run db:push</code> against your production database,
            then refresh this page.
          </>
        )}
      </p>
    </div>
  );
}
