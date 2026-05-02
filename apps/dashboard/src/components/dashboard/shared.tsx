import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-[var(--border-light)] px-4 py-3 shadow-sm hover:border-[var(--accent-cyan)] transition-colors">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-lg font-black text-[var(--foreground)]">{value}</p>
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
  isPro?: boolean;
}) {
  return (
    <section className={`relative rounded-2xl border bg-white/50 backdrop-blur-sm p-6 shadow-sm transition-all ${isPro ? "border-[#F59E0B]/30" : "border-[var(--border-light)]"}`}>
      {isPro && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[8px] font-black uppercase tracking-widest shadow-lg z-10">
          PRO
        </div>
      )}
      <div className="flex items-start gap-4 border-b border-[var(--border-light)] pb-5">
        <div className="w-10 h-10 rounded-xl bg-[var(--soft-cyan)] flex items-center justify-center shrink-0">
          <Icon className="text-[var(--accent-teal)]" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{subtitle}</p>
        </div>
      </div>
      <div className="pt-6">{children}</div>
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="group">
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--accent-teal)] transition-colors">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--foreground)] leading-relaxed">{value}</p>
    </div>
  );
}

export function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[var(--border-light)] bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">{title}</p>
      <ul className="space-y-3 text-sm font-medium text-[var(--text-secondary)]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] mt-1.5 shrink-0" />
            {item}
          </li>
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
  isPro?: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={`group relative flex flex-col justify-between rounded-xl border bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${isPro ? "border-[#F59E0B]/20 hover:border-[#F59E0B]" : "border-[var(--border-light)] hover:border-[var(--accent-teal)]"}`}
    >
      {isPro && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] text-[8px] font-black uppercase tracking-widest border border-[#F59E0B]/20">
          PRO
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-bold text-[var(--foreground)]">{title}</p>
          <ArrowUpRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-teal)] transition-colors" />
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{detail}</p>
      </div>
    </Link>
  );
}

export function TrustLine({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-light)] bg-white p-5 shadow-sm hover:border-[var(--accent-cyan)] transition-colors">
      <p className="text-sm font-bold text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{detail}</p>
    </div>
  );
}

export function ChecklistItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--border-light)] bg-white p-5 shadow-sm">
      <div className="w-6 h-6 rounded-full bg-[var(--soft-cyan)] flex items-center justify-center shrink-0 mt-0.5">
        <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--foreground)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{detail}</p>
      </div>
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
    <div className={`rounded-2xl border border-dashed border-[var(--border-light)] bg-white/30 text-[var(--text-secondary)] text-center ${compact ? "p-6 text-xs" : "p-10 text-sm font-medium"}`}>
      {text}
    </div>
  );
}

