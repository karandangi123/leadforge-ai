import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ProposalOutcomeStatus = "OPEN" | "WON" | "LOST" | "STALLED";

export type ProposalMemoryRecord = {
  id: string;
  proposalTitle: string;
  clientName: string;
  clientType: string;
  templateName: string;
  serviceLine: string;
  niche: string;
  primaryPriceAnchor: string;
  outcome: ProposalOutcomeStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TraceSavedView = {
  id: string;
  name: string;
  search: string;
  agent: string;
  status: string;
  pinned: boolean;
  createdAt: string;
};

type OpsMemoryStore = {
  proposalMemory: ProposalMemoryRecord[];
  traceSavedViews: TraceSavedView[];
};

type WorkspaceOpsStore = Record<string, OpsMemoryStore>;

const OPS_FILE = path.join(process.cwd(), "data", "workspace-ops-memory.json");

function emptyStore(): OpsMemoryStore {
  return {
    proposalMemory: [],
    traceSavedViews: [],
  };
}

async function readAllStores(): Promise<WorkspaceOpsStore> {
  try {
    const raw = await readFile(OPS_FILE, "utf-8");
    return JSON.parse(raw) as WorkspaceOpsStore;
  } catch {
    return {};
  }
}

async function writeAllStores(store: WorkspaceOpsStore) {
  await mkdir(path.dirname(OPS_FILE), { recursive: true });
  await writeFile(OPS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function readWorkspaceOpsMemory(workspaceSlug: string): Promise<OpsMemoryStore> {
  const all = await readAllStores();
  return all[workspaceSlug] ?? emptyStore();
}

export async function createProposalMemoryRecord(
  workspaceSlug: string,
  input: Omit<ProposalMemoryRecord, "id" | "createdAt" | "updatedAt">,
) {
  const all = await readAllStores();
  const workspace = all[workspaceSlug] ?? emptyStore();
  const now = new Date().toISOString();

  workspace.proposalMemory = [
    {
      id: `proposal-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      ...input,
    },
    ...workspace.proposalMemory,
  ].slice(0, 50);

  all[workspaceSlug] = workspace;
  await writeAllStores(all);
}

export async function updateProposalMemoryRecord(
  workspaceSlug: string,
  id: string,
  patch: Pick<ProposalMemoryRecord, "outcome" | "notes">,
) {
  const all = await readAllStores();
  const workspace = all[workspaceSlug] ?? emptyStore();
  workspace.proposalMemory = workspace.proposalMemory.map((record) =>
    record.id === id
      ? {
          ...record,
          outcome: patch.outcome,
          notes: patch.notes,
          updatedAt: new Date().toISOString(),
        }
      : record,
  );
  all[workspaceSlug] = workspace;
  await writeAllStores(all);
}

export async function saveTraceSavedView(
  workspaceSlug: string,
  input: Omit<TraceSavedView, "id" | "createdAt">,
) {
  const all = await readAllStores();
  const workspace = all[workspaceSlug] ?? emptyStore();
  const next: TraceSavedView = {
    id: `trace-view-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  };

  workspace.traceSavedViews = [next, ...workspace.traceSavedViews]
    .filter((view, index, arr) => arr.findIndex((candidate) => candidate.name === view.name) === index)
    .slice(0, 20);
  all[workspaceSlug] = workspace;
  await writeAllStores(all);
}

export async function deleteTraceSavedView(workspaceSlug: string, id: string) {
  const all = await readAllStores();
  const workspace = all[workspaceSlug] ?? emptyStore();
  workspace.traceSavedViews = workspace.traceSavedViews.filter((view) => view.id !== id);
  all[workspaceSlug] = workspace;
  await writeAllStores(all);
}
