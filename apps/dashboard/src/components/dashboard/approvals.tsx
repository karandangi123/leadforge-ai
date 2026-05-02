import React from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import { 
  type ApprovalQueueItem 
} from "@/lib/leads";
import { approveLeadWork, rejectLeadWork, editApprovalAsset } from "@/app/actions";
import { DetailRow } from "./shared";

export function ApprovalFilterBar({
  items,
  currentFilter,
}: {
  items: ApprovalQueueItem[];
  currentFilter: { approvalStatus: string; assetType: string };
}) {
  const assetTypes = Array.from(new Set(items.map((item) => item.assetType))).sort();
  return (
    <form className="grid gap-2 rounded-xl border border-[#e3dccd] bg-white p-3 lg:grid-cols-[1fr_1fr_auto]">
      <input type="hidden" name="view" value="outreach" />
      <select name="approvalStatus" defaultValue={currentFilter.approvalStatus} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <option value="ALL">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
      <select name="assetType" defaultValue={currentFilter.assetType} className="h-10 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm">
        <option value="ALL">All asset types</option>
        {assetTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1e2521] px-4 text-sm font-black text-white">
        <Filter size={14} /> Apply
      </button>
    </form>
  );
}

export function ApprovalQueueCard({
  item,
  disabled,
}: {
  item: ApprovalQueueItem;
  disabled: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-5 shadow-[0_18px_50px_rgba(45,38,20,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[#176b5d]">{item.assetType}</p>
          <h3 className="mt-1 text-xl font-black">{item.leadName}</h3>
          <p className="mt-2 text-sm text-[#687169]">{item.requestedAction}</p>
        </div>
        <span className="rounded-full bg-[#f3faf7] px-3 py-1 text-[10px] font-black uppercase text-[#176b5d]">{item.status}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#687169]">Content preview</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#4f5a53]">{item.contentPreview}</p>
          {item.notes ? (
            <p className="mt-3 rounded-lg bg-[#f7f5ef] px-3 py-3 text-xs leading-5 text-[#4f5a53]">
              <span className="font-black text-[#1e2521]">Reviewer note:</span> {item.notes}
            </p>
          ) : null}
        </div>
        <div className="space-y-3 rounded-xl border border-[#e3dccd] bg-white p-4">
          <DetailRow label="Lead stage" value={item.leadStage} />
          <DetailRow label="Created" value={item.createdAt} />
          <DetailRow label="Decision" value={item.decidedAt ?? "Pending"} />
          <div>
            <p className="text-xs font-black uppercase text-[#687169]">Sync preview</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[#4f5a53]">
              {item.syncPreview.map((detail) => (
                <li key={detail}>• {detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {item.diffPreview ? (
        <details className="mt-4 rounded-xl border border-[#e3dccd] bg-white" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-[#1e2521]">Approval diff view</summary>
          <div className="border-t border-[#e3dccd] p-4">
            <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-black uppercase">
              <span className="rounded-full bg-[#fff4eb] px-2 py-1 text-[#8a4b12]">{item.diffPreview.removedCount} removed lines</span>
              <span className="rounded-full bg-[#edf9f3] px-2 py-1 text-[#176b5d]">{item.diffPreview.addedCount} added lines</span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-[#e3dccd] bg-[#fffaf4] p-4">
                <p className="text-xs font-black uppercase text-[#8a4b12]">Original body</p>
                <div className="mt-3 space-y-1 font-mono text-xs leading-6 text-[#5f4732]">
                  {item.diffPreview.beforeSegments.map((segment) => (
                    <pre key={segment.id} className={segment.type === "removed" ? "rounded bg-[#fde7dc] px-2 py-1" : "px-2 py-1 whitespace-pre-wrap"}>{segment.text || " "}</pre>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#e3dccd] bg-[#f5fcf8] p-4">
                <p className="text-xs font-black uppercase text-[#176b5d]">Revised body</p>
                <div className="mt-3 space-y-1 font-mono text-xs leading-6 text-[#37584e]">
                  {item.diffPreview.afterSegments.map((segment) => (
                    <pre key={segment.id} className={segment.type === "added" ? "rounded bg-[#dff5e9] px-2 py-1" : "px-2 py-1 whitespace-pre-wrap"}>{segment.text || " "}</pre>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </details>
      ) : null}

      <details className="mt-4 rounded-xl border border-[#e3dccd] bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-[#1e2521]">Reviewer audit trail</summary>
        <div className="space-y-3 border-t border-[#e3dccd] p-4">
          {item.history.map((entry) => (
            <div key={entry.id} className="border-l-2 border-[#cfe7de] pl-3">
              <p className="text-sm font-black text-[#1e2521]">
                {entry.action}
                <span className="ml-2 text-xs font-medium text-[#687169]">{entry.timestamp}</span>
              </p>
              <p className="mt-1 text-xs font-black uppercase text-[#176b5d]">{entry.actor}</p>
              <p className="mt-1 text-sm leading-6 text-[#4f5a53]">{entry.detail}</p>
            </div>
          ))}
        </div>
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/leads/${item.leadId}?approval=${item.id}`} className="inline-flex h-10 items-center justify-center rounded-md border border-[#b9ddcf] px-4 text-sm font-black text-[#176b5d]">
          Open lead
        </Link>
        {item.status === "PENDING" ? (
          <>
            <form action={approveLeadWork}>
              <input type="hidden" name="leadId" value={item.leadId} />
              <input type="hidden" name="approvalId" value={item.id} />
              <input type="hidden" name="returnTo" value="/?view=outreach" />
              <button disabled={disabled} className="inline-flex h-10 items-center justify-center rounded-md bg-[#176b5d] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#9da59f]">
                Approve
              </button>
            </form>
            <form action={rejectLeadWork}>
              <input type="hidden" name="leadId" value={item.leadId} />
              <input type="hidden" name="approvalId" value={item.id} />
              <input type="hidden" name="returnTo" value="/?view=outreach" />
              <button disabled={disabled} className="inline-flex h-10 items-center justify-center rounded-md border border-[#d9d2c1] px-4 text-sm font-black text-[#1e2521] disabled:cursor-not-allowed disabled:text-[#9da59f]">
                Reject
              </button>
            </form>
          </>
        ) : null}
      </div>

      {item.status === "PENDING" ? (
        <details className="mt-4 rounded-xl border border-[#e3dccd] bg-white">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-[#1e2521]">Advanced approval editing</summary>
          <form action={editApprovalAsset} className="space-y-4 border-t border-[#e3dccd] p-4">
            <input type="hidden" name="leadId" value={item.leadId} />
            <input type="hidden" name="approvalId" value={item.id} />
            <input type="hidden" name="returnTo" value="/?view=outreach" />
            <label className="block">
              <span className="text-xs font-black uppercase text-[#687169]">Requested action</span>
              <input name="requestedAction" defaultValue={item.requestedAction} className="mt-1 h-11 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-[#687169]">Subject</span>
              <input name="subject" defaultValue={item.draftSubject ?? ""} className="mt-1 h-11 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-[#687169]">Editable asset body</span>
              <textarea
                name="body"
                defaultValue={item.draftBody}
                rows={7}
                className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-[#687169]">Reviewer note</span>
              <textarea
                name="reviewerNote"
                placeholder="Why you edited this, what changed, or what the operator should preserve."
                rows={3}
                className="mt-1 w-full rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 py-3 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                name="decision"
                value="approve"
                disabled={disabled}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#176b5d] px-4 text-sm font-black text-white disabled:bg-[#9da59f]"
              >
                Edit and approve
              </button>
              <button
                name="decision"
                value="revise"
                disabled={disabled}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#d9d2c1] px-4 text-sm font-black text-[#1e2521] disabled:text-[#9da59f]"
              >
                Send back for revision
              </button>
            </div>
          </form>
        </details>
      ) : null}
    </article>
  );
}
