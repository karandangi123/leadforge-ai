"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";

import { importLeadsCsv, type CsvImportState } from "@/app/actions";

const initialCsvImportState: CsvImportState = {
  message: "",
  results: [],
};

export function CsvImportForm({
  disabled,
}: {
  disabled: boolean;
}) {
  const [state, action, pending] = useActionState(importLeadsCsv, initialCsvImportState);

  return (
    <div className="rounded-xl border border-[#d9d2c1] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#1e2521]">CSV import</p>
          <p className="mt-1 text-xs leading-5 text-[#687169]">
            Supported columns: `company`, `website`, `contactName`, `contactEmail`, `segment`, `owner`, `tags`, `notes`.
          </p>
        </div>
      </div>

      <form action={action} className="mt-4 space-y-3">
        <input
          type="file"
          name="csvFile"
          accept=".csv,text/csv"
          disabled={disabled || pending}
          className="block w-full text-sm text-[#4f5a53] file:mr-4 file:rounded-md file:border-0 file:bg-[#176b5d] file:px-4 file:py-2 file:text-sm file:font-black file:text-white disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled || pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1e2521] px-4 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9da59f]"
        >
          <Upload size={16} /> {pending ? "Importing..." : "Import CSV"}
        </button>
      </form>

      {state.message ? <p className="mt-3 text-sm font-medium text-[#4f5a53]">{state.message}</p> : null}

      {state.results.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-[#e3dccd]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f5ef] text-[#687169]">
              <tr>
                <th className="px-3 py-2 font-black">Row</th>
                <th className="px-3 py-2 font-black">Company</th>
                <th className="px-3 py-2 font-black">Result</th>
                <th className="px-3 py-2 font-black">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee8db] bg-white">
              {state.results.map((result) => (
                <tr key={`${result.row}-${result.company}`}>
                  <td className="px-3 py-2 text-[#687169]">{result.row}</td>
                  <td className="px-3 py-2 font-bold text-[#1e2521]">{result.company}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-[#f3faf7] px-2 py-1 font-black text-[#176b5d]">{result.status}</span>
                  </td>
                  <td className="px-3 py-2 text-[#4f5a53]">{result.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
