import React from "react";
import { 
  type WorkspacePlaybookState, 
  type LeadDataState 
} from "@/lib/leads";
import { saveWorkspacePlaybook } from "@/app/actions";
import { getProposalPricingLayout, proposalServiceLineTemplates } from "@/lib/proposal-templates";

export function PlaybookWizard({ playbook, databaseStatus }: { playbook: WorkspacePlaybookState; databaseStatus: LeadDataState["status"] }) {
  const disabled = databaseStatus !== "connected";
  const selectedTemplate = proposalServiceLineTemplates.find((template) => template.id === playbook.branding.defaultServiceLine) ?? proposalServiceLineTemplates[0];
  const selectedPricingLayout = getProposalPricingLayout(selectedTemplate.id, playbook.branding.defaultNiche);
  return (
    <section className="rounded-2xl border border-[#d2cab7] bg-[#fffdf8] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[#176b5d]">Playbook</p>
          <h2 className="mt-1 text-2xl font-black">Product + ICP setup</h2>
        </div>
        <span className="rounded-full bg-[#f3faf7] px-3 py-1 text-[10px] font-black uppercase text-[#176b5d]">{playbook.status}</span>
      </div>
      <form action={saveWorkspacePlaybook} className="mt-6 space-y-4">
        <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
          <p className="text-sm font-black text-[#1e2521]">Workspace onboarding wizard</p>
          <p className="mt-2 text-sm leading-6 text-[#4f5a53]">Use this surface to define what the business sells, who it is for, what proof exists, and what tone the agents should preserve across discovery, audits, and outreach.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="product" placeholder="Product name" defaultValue={playbook.product} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
          <input name="idealCustomer" placeholder="Ideal customer" defaultValue={playbook.idealCustomer} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <textarea name="industries" defaultValue={playbook.industries.join("\n")} disabled={disabled} rows={4} placeholder="Industries" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
          <textarea name="pains" defaultValue={playbook.pains.join("\n")} disabled={disabled} rows={4} placeholder="Pain points" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <textarea name="proofPoints" defaultValue={playbook.proofPoints.join("\n")} disabled={disabled} rows={4} placeholder="Proof points" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
          <textarea name="positioning" defaultValue={playbook.positioning ?? ""} disabled={disabled} rows={4} placeholder="Positioning" className="rounded-md border border-[#d9d2c1] bg-white px-4 py-3 text-sm" />
        </div>
        <input name="tone" placeholder="Tone" defaultValue={playbook.tone} disabled={disabled} className="h-12 w-full rounded-md border border-[#d9d2c1] bg-white px-4 text-sm" />
        <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
          <p className="text-sm font-black text-[#1e2521]">Proposal branding customization</p>
          <p className="mt-2 text-sm leading-6 text-[#4f5a53]">This brand profile controls the visual identity, footer, signature, contact details, and commercial tone used by Proposal Generator exports.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="brandName" placeholder="Brand name" defaultValue={playbook.branding.brandName} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
            <input name="tagLine" placeholder="Brand tagline" defaultValue={playbook.branding.tagLine} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-xs font-black uppercase text-[#687169]">Primary color</span>
              <div className="mt-1 flex items-center gap-3 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 py-2">
                <input type="color" defaultValue={playbook.branding.primaryColor} disabled={disabled} className="h-9 w-12 rounded border-0 bg-transparent p-0" />
                <input name="primaryColor" defaultValue={playbook.branding.primaryColor} disabled={disabled} className="h-9 flex-1 bg-transparent text-sm outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-[#687169]">Secondary color</span>
              <div className="mt-1 flex items-center gap-3 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 py-2">
                <input type="color" defaultValue={playbook.branding.secondaryColor} disabled={disabled} className="h-9 w-12 rounded border-0 bg-transparent p-0" />
                <input name="secondaryColor" defaultValue={playbook.branding.secondaryColor} disabled={disabled} className="h-9 flex-1 bg-transparent text-sm outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase text-[#687169]">Accent color</span>
              <div className="mt-1 flex items-center gap-3 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-3 py-2">
                <input type="color" defaultValue={playbook.branding.accentColor} disabled={disabled} className="h-9 w-12 rounded border-0 bg-transparent p-0" />
                <input name="accentColor" defaultValue={playbook.branding.accentColor} disabled={disabled} className="h-9 flex-1 bg-transparent text-sm outline-none" />
              </div>
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select name="defaultServiceLine" defaultValue={playbook.branding.defaultServiceLine} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm">
              {proposalServiceLineTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <input name="defaultNiche" placeholder="Default niche" defaultValue={playbook.branding.defaultNiche} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="contactEmail" placeholder="Contact email" defaultValue={playbook.branding.contactEmail} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
            <input name="websiteUrl" placeholder="Website URL" defaultValue={playbook.branding.websiteUrl} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="signoffName" placeholder="Proposal signoff name" defaultValue={playbook.branding.signoffName} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
            <input name="proposalVoice" placeholder="Proposal voice" defaultValue={playbook.branding.proposalVoice} disabled={disabled} className="h-12 rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 text-sm" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <textarea name="pricingFootnote" defaultValue={playbook.branding.pricingFootnote} disabled={disabled} rows={4} placeholder="Pricing footnote" className="rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 py-3 text-sm" />
            <textarea name="legalFooter" defaultValue={playbook.branding.legalFooter} disabled={disabled} rows={4} placeholder="Legal footer" className="rounded-md border border-[#d9d2c1] bg-[#fffdf8] px-4 py-3 text-sm" />
          </div>
          <div className="mt-4 rounded-xl border border-[#d9d2c1] bg-[#fffaf1] p-4">
            <p className="text-xs font-black uppercase text-[#687169]">Live proposal kit preview</p>
            <div className="mt-3 rounded-2xl border p-4" style={{ borderColor: playbook.branding.accentColor, background: `linear-gradient(135deg, ${playbook.branding.primaryColor}, ${playbook.branding.secondaryColor})` }}>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Proposal cover</p>
              <p className="mt-3 text-2xl font-black text-white">{playbook.branding.brandName}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/88">{playbook.branding.tagLine}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black text-white/84">
                <span>{playbook.branding.contactEmail}</span>
                <span>•</span>
                <span>{playbook.branding.websiteUrl}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#d9d2c1] bg-white p-4">
            <p className="text-xs font-black uppercase text-[#687169]">Service-line template library</p>
            <div className="mt-3 grid gap-4 xl:grid-cols-3">
              {proposalServiceLineTemplates.map((template) => (
                <div key={template.id} className={`rounded-2xl border p-4 ${template.id === selectedTemplate.id ? "border-[#176b5d] bg-[#f7fffb]" : "border-[#e3dccd] bg-[#fffdf8]"}`}>
                  <p className="text-sm font-black text-[#1e2521]">{template.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{template.description}</p>
                  <p className="mt-3 text-xs font-black uppercase text-[#176b5d]">{template.pricingLayoutName}</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-[#4f5a53]">
                    {template.reusableSections.map((section) => (
                      <li key={section}>• {section}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-xl border border-[#e3dccd] bg-[#fffdf8] p-4">
                <p className="text-xs font-black uppercase text-[#176b5d]">Default guarantee language</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{selectedTemplate.guaranteeLanguage}</p>
              </div>
              <div className="rounded-xl border border-[#e3dccd] bg-[#fffdf8] p-4">
                <p className="text-xs font-black uppercase text-[#176b5d]">Default niche pricing layout</p>
                <p className="mt-2 text-sm font-black text-[#1e2521]">{selectedPricingLayout.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5a53]">{selectedPricingLayout.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPricingLayout.priceAnchors.map((anchor) => (
                    <span key={anchor} className="rounded-full bg-[#f3faf7] px-2 py-1 text-[10px] font-black uppercase text-[#176b5d]">{anchor}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
            <p className="text-xs font-black uppercase text-[#687169]">Offer setup</p>
            <p className="mt-2 text-sm leading-6 text-[#4f5a53]">Use `Product`, `Positioning`, and `Proof points` to capture your offer, pricing posture, outcome promise, and CTA direction until a dedicated offer model exists.</p>
          </div>
          <div className="rounded-xl border border-[#e3dccd] bg-white p-4">
            <p className="text-xs font-black uppercase text-[#687169]">Messaging guardrails</p>
            <p className="mt-2 text-sm leading-6 text-[#4f5a53]">Use `Tone`, `Pains`, and `Proof points` as the current source of truth for approved claims, banned fluff, and operator messaging rules.</p>
          </div>
        </div>
        <button type="submit" disabled={disabled} className="inline-flex h-11 items-center justify-center rounded-md bg-[#1e2521] px-5 text-sm font-black text-white disabled:bg-[#9da59f]">
          Save playbook
        </button>
      </form>
    </section>
  );
}
