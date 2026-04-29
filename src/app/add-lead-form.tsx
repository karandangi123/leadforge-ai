import { Plus } from "lucide-react";

import { addLead } from "@/app/actions";

export function AddLeadForm({
  databaseStatus,
}: {
  databaseStatus: "connected" | "not_configured" | "unavailable";
}) {
  const disabled = databaseStatus !== "connected";

  return (
    <form id="add-lead" action={addLead} className="border-t border-[#e3dccd] bg-[#fbfaf7] p-4">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-black">Add lead</h2>
          <p className="text-sm text-[#687169]">Create a lead record and queue it for research.</p>
        </div>
        <p className="text-xs font-bold uppercase text-[#687169]">{disabled ? "Database required" : "Ready to save"}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Field label="Company" name="company" placeholder="Acme Health" required disabled={disabled} />
        <Field label="Website" name="website" placeholder="https://acme.com" disabled={disabled} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Field label="Contact" name="contactName" placeholder="Maya Chen" disabled={disabled} />
        <Field label="Email" name="contactEmail" placeholder="maya@acme.com" disabled={disabled} />
        <Field label="Segment" name="segment" placeholder="Healthcare ops" disabled={disabled} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-[#687169]">
          {disabled
            ? "Connect a Postgres DATABASE_URL before saving leads."
            : "Saved leads enter the research queue."}
        </p>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#176b5d] px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#115247] hover:shadow-[0_12px_28px_rgba(23,107,93,0.22)] disabled:cursor-not-allowed disabled:bg-[#9da59f] disabled:shadow-none"
        >
          <Plus size={16} /> Add lead
        </button>
      </div>
    </form>
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
    <label className="block min-w-0 flex-1">
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
