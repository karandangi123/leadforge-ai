import React from "react";
import { Terminal, Save, RotateCcw } from "lucide-react";
import { TrustLine } from "./shared";

const promptCategories = [
  { id: "RESEARCH", label: "Research Agent" },
  { id: "WEBSITE_AUDIT", label: "Website Audit" },
  { id: "OUTREACH", label: "Outreach Agent" },
  { id: "REVIEWER", label: "Reviewer Agent" },
];

export function PromptLab() {
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr] animate-fade-in">
      <div className="space-y-6">
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 border-b border-[#e3dccd] pb-6 mb-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf4ef] text-[#176b5d]">
              <Terminal size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Prompt Lab</h2>
              <p className="text-sm text-[#687169]">Customise the core instructions for your autonomous agents</p>
            </div>
          </div>

          <div className="space-y-6">
            {promptCategories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-[#e3dccd] bg-[#fdfdfc] p-6 group transition-all hover:border-[#176b5d]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black">{category.label}</h3>
                  <div className="flex gap-2">
                    <button className="premium-button h-9 border border-[#d9d2c1] bg-white px-3 text-xs">
                      <RotateCcw size={14} /> Reset
                    </button>
                    <button className="premium-button-primary h-9 px-4 text-xs">
                      <Save size={14} /> Save v2
                    </button>
                  </div>
                </div>
                <textarea 
                  className="w-full min-h-[200px] premium-input py-4 leading-relaxed font-mono text-[13px]"
                  placeholder={`Enter instructions for ${category.label}...`}
                  defaultValue={`# Instructions for ${category.label}\n\nYou are an expert agent specialising in...\n\n## Constraints\n- Always return structured JSON\n- Maintain a professional tone\n- Fact-check all citations`}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="premium-card p-6 bg-[#f9fafb]/50">
          <h3 className="text-lg font-black text-[#1e2521]">Prompt Engineering Guide</h3>
          <p className="mt-2 mb-6 text-sm text-[#687169]">Master the &quot;Operator-First&quot; instruction set</p>
          
          <div className="space-y-4">
            <TrustLine title="Explicit Constraints" detail="Agents perform better when told what NOT to do. Explicitly block specific sources or styles." />
            <TrustLine title="Dynamic Injection" detail="LeadForge automatically injects your Playbook context into every run. You don't need to repeat it here." />
            <TrustLine title="JSON Boundary" detail="The system enforces JSON schema. Focus your prompt on the *quality* of content within that schema." />
          </div>
        </section>

        <div className="rounded-[24px] bg-[#176b5d] p-6 text-white overflow-hidden relative">
          <Terminal className="absolute -right-4 -top-4 opacity-10" size={120} />
          <h4 className="text-lg font-black relative z-10">Production Safety</h4>
          <p className="mt-1 text-sm text-emerald-100 relative z-10">Changes to prompts are versioned. You can roll back any agent behavior instantly from the trace engine.</p>
        </div>
      </div>
    </div>
  );
}
