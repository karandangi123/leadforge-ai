import { Plus, Sparkles } from "lucide-react";

import { addLead, createSampleLead } from "@/app/actions";
import { CsvImportForm } from "@/app/csv-import-form";

export function AddLeadForm({
  databaseStatus,
}: {
  databaseStatus: "connected" | "not_configured" | "unavailable";
}) {
  const disabled = databaseStatus !== "connected";

  return (
    <section id="add-lead" className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8]">
      <div className="border-b border-[#e3dccd] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase text-[#176b5d]">Lead intake</p>
            <h2 className="mt-1 text-xl font-black">Add or import leads</h2>
            <p className="mt-2 text-sm leading-6 text-[#687169]">
              Save a company, attach owner context, then move it into the research and approval workflow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={createSampleLead}>
              <button
                type="submit"
                disabled={disabled}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#b9ddcf] bg-white px-4 text-sm font-black text-[#176b5d] transition hover:bg-[#f3faf7] disabled:cursor-not-allowed disabled:border-[#d2cab7] disabled:bg-[#f1eee5] disabled:text-[#687169]"
              >
                <Sparkles size={16} /> Create sample lead
              </button>
            </form>
            <p className="text-xs font-bold uppercase text-[#687169]">{disabled ? "Database required" : "Ready to save"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-xl border border-[#d9d2c1] bg-white p-4">
          <form action={addLead} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Company" name="company" placeholder="Acme Health" required disabled={disabled} />
              <Field label="Website" name="website" placeholder="https://acme.com" disabled={disabled} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Contact" name="contactName" placeholder="Maya Chen" disabled={disabled} />
              <Field label="Email" name="contactEmail" placeholder="maya@acme.com" disabled={disabled} />
              <Field label="Segment" name="segment" placeholder="Healthcare ops" disabled={disabled} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Owner" name="ownerName" placeholder="Karan Dangi" disabled={disabled} />
              <Field label="Tags" name="tags" placeholder="healthcare, high-fit, approval" disabled={disabled} />
            </div>
            <Area label="Notes" name="notes" placeholder="Why this lead matters, objections, or operator context." disabled={disabled} />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[#687169]">
                {disabled
                  ? "Connect Postgres and run the Prisma migration before saving leads."
                  : "New leads enter the research queue and stay fully editable."}
              </p>
              <button
                type="submit"
                disabled={disabled}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#176b5d] px-5 text-sm font-black text-white transition hover:bg-[#115247] disabled:cursor-not-allowed disabled:bg-[#9da59f]"
              >
                <Plus size={16} /> Add lead
              </button>
            </div>
          </form>
        </div>

        <CsvImportForm disabled={disabled} />
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
  disabled,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-bold uppercase text-[#687169]">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="mt-1 h-11 w-full rounded-md border border-[#d9d2c1] bg-white px-3 text-sm outline-none transition placeholder:text-[#9a9488] focus:border-[#176b5d] focus:ring-4 focus:ring-[#d7eee6] disabled:bg-[#f1eee5]"
      />
    </label>
  );
}

function Area({
  label,
  name,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-[#687169]">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-white px-3 py-3 text-sm outline-none transition placeholder:text-[#9a9488] focus:border-[#176b5d] focus:ring-4 focus:ring-[#d7eee6] disabled:bg-[#f1eee5]"
      />
    </label>
  );
}
