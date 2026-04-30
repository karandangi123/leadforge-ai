import React from "react";
import Link from "next/link";

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f7f5ef] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#687169]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#1e2521]">{value}</p>
    </div>
  );
}

export function Panel({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5">
      <div className="flex items-start gap-3 border-b border-[#e3dccd] pb-4">
        <Icon className="mt-1 text-[#176b5d]" size={20} />
        <div>
          <h2 className="py-0.5 text-xl font-black leading-tight">{title}</h2>
          <p className="mt-1 text-sm text-[#687169]">{subtitle}</p>
        </div>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-[#687169]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[#4f5a53]">{value}</p>
    </div>
  );
}

export function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#687169]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a53]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function QuickActionCard({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href} className="rounded-xl border border-[#e3dccd] bg-white p-4 transition hover:border-[#176b5d] hover:bg-[#f9fffc]">
      <p className="text-sm font-black text-[#1e2521]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{detail}</p>
    </Link>
  );
}

export function TrustLine({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-sm font-black text-[#1e2521]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{detail}</p>
    </div>
  );
}

export function ChecklistItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
      <p className="text-sm font-black text-[#1e2521]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{detail}</p>
    </div>
  );
}

export function EmptyState({
  text,
  compact,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-dashed border-[#d2cab7] bg-white/70 text-[#687169] ${compact ? "p-4 text-xs" : "p-6 text-sm"}`}>
      {text}
    </div>
  );
}
