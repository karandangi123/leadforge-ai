"use client";

import React, { useState, useTransition } from "react";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Clock, 
  CheckSquare, 
  Plus, 
  MoreVertical,
  GripVertical,
  X,
  Play,
  Save,
  Trash2,
  Calendar,
  Sparkles
} from "lucide-react";

import { createOutreachSequence } from "@/app/actions/multichannel";

type StepType = "EMAIL" | "LINKEDIN_CONNECTION" | "LINKEDIN_MESSAGE" | "SMS" | "PHONE_CALL" | "WAIT" | "TASK";

interface SequenceStep {
  id: string;
  type: StepType;
  delayDays: number;
  delayHours: number;
  content?: string;
  subject?: string;
}

const LinkedInIcon = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="#0A66C2"
    className={className}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GmailIcon = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
  >
    <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
    <path fill="#4285F4" d="M24 5.457v6.273L18.545 16.64V21h3.819c.904 0 1.636-.732 1.636-1.636V5.457z"/>
    <path fill="#34A853" d="M0 5.457v6.273L5.455 16.64V21h-3.819A1.636 1.636 0 0 1 0 19.366V5.457z"/>
    <path fill="#FBBC04" d="M18.545 16.64L24 11.73V5.457c0-2.023-2.309-3.178-3.927-1.964L18.545 4.64z"/>
    <path fill="#EA4335" d="M5.455 16.64L0 11.73V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64z"/>
  </svg>
);

const STEP_DEFINITIONS = {
  EMAIL: { label: "Automated Email", icon: GmailIcon, color: "text-[#EA4335]", bg: "bg-red-50", border: "border-red-200" },
  LINKEDIN_CONNECTION: { label: "LinkedIn Connection", icon: LinkedInIcon, color: "text-[#0A66C2]", bg: "bg-blue-50", border: "border-blue-200" },
  LINKEDIN_MESSAGE: { label: "LinkedIn Message", icon: LinkedInIcon, color: "text-[#0A66C2]", bg: "bg-blue-50", border: "border-blue-200" },
  SMS: { label: "Automated SMS", icon: MessageSquare, color: "text-[#176b5d]", bg: "bg-[#f3faf7]", border: "border-[#cfe7de]" },
  PHONE_CALL: { label: "Call Task", icon: Phone, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  WAIT: { label: "Time Delay", icon: Clock, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
  TASK: { label: "Manual Task", icon: CheckSquare, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
};

export function SequenceBuilder() {
  const [steps, setSteps] = useState<SequenceStep[]>([
    { id: "1", type: "EMAIL", delayDays: 0, delayHours: 0, subject: "Quick question", content: "Hi {{firstName}},\n\nI noticed you are leading the team at {{company}}..." },
    { id: "2", type: "WAIT", delayDays: 2, delayHours: 0 },
    { id: "3", type: "LINKEDIN_CONNECTION", delayDays: 0, delayHours: 0, content: "Hi {{firstName}}, looking forward to connecting!" }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>("1");
  const [isPending, startTransition] = useTransition();

  const handleActivate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", "Enterprise RevOps Sequence");
      formData.append("description", "Multi-channel outbound flow targeting VP-level buyers");
      formData.append("targetSegment", "RevOps / VP");
      formData.append("stepsJson", JSON.stringify(steps.map((s, i) => ({
        stepNumber: i + 1,
        kind: s.type,
        delayDays: s.delayDays,
        delayHours: s.delayHours,
        subject: s.subject,
        bodyTemplate: s.content,
        taskNote: s.type === "TASK" || s.type === "PHONE_CALL" ? s.content : undefined
      }))));
      
      await createOutreachSequence(formData);
    });
  };

  const addStep = (type: StepType) => {
    const newStep: SequenceStep = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      delayDays: type === "WAIT" ? 2 : 0,
      delayHours: 0,
      content: "",
      subject: type === "EMAIL" ? "" : undefined,
    };
    setSteps([...steps, newStep]);
    setActiveStepId(newStep.id);
    setIsAdding(false);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
    if (activeStepId === id) setActiveStepId(null);
  };

  const updateStep = (id: string, updates: Partial<SequenceStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const activeStep = steps.find(s => s.id === activeStepId);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl border border-[#d9d2c1] bg-[#fffdf8] shadow-sm">
      {/* Sequence Flow Area */}
      <div className="flex-1 overflow-y-auto border-r border-[#d9d2c1] bg-[#f7f5ef] p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1e2521]">Enterprise RevOps Sequence</h2>
              <p className="mt-1 text-sm text-[#687169]">Multi-channel outbound flow targeting VP-level buyers</p>
            </div>
            <button 
              onClick={handleActivate}
              disabled={isPending}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-white transition-colors ${isPending ? "bg-[#115247]/50" : "bg-[#176b5d] hover:bg-[#115247]"}`}
            >
              <Play size={16} /> {isPending ? "Activating..." : "Activate Sequence"}
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const def = STEP_DEFINITIONS[step.type];
              const Icon = def.icon;
              const isActive = activeStepId === step.id;

              if (step.type === "WAIT") {
                return (
                  <div key={step.id} className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-px bg-dashed bg-[#d9d2c1]"></div>
                    </div>
                    <div 
                      className={`relative z-10 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold shadow-sm transition-all ${
                        isActive ? "border-[#176b5d] bg-white ring-2 ring-[#176b5d]/20" : "border-[#d9d2c1] bg-white hover:border-[#a39b8b]"
                      }`}
                      onClick={() => setActiveStepId(step.id)}
                    >
                      <Clock size={14} className="text-[#687169]" />
                      <span className="text-[#4f5a53]">Wait {step.delayDays} days {step.delayHours > 0 ? `${step.delayHours} hours` : ""}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={step.id}
                  className={`group relative flex cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all ${
                    isActive ? "border-[#176b5d] ring-1 ring-[#176b5d]" : "border-[#e3dccd] hover:border-[#a39b8b]"
                  }`}
                  onClick={() => setActiveStepId(step.id)}
                >
                  <div className="mr-4 mt-1 flex cursor-grab text-[#d9d2c1] hover:text-[#687169]">
                    <GripVertical size={16} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${def.bg} ${def.border}`}>
                          <Icon size={16} className={def.color} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-[#687169]">Step {index + 1}</p>
                          <p className="text-sm font-bold text-[#1e2521]">{def.label}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                        className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 ml-11">
                      {step.type === "EMAIL" && (
                        <div className="truncate text-sm font-bold text-[#1e2521]">
                          Subject: <span className="font-medium text-[#4f5a53]">{step.subject || "(No subject)"}</span>
                        </div>
                      )}
                      <div className="mt-1 line-clamp-2 text-xs text-[#687169]">
                        {step.content || <span className="italic">Empty message template</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Step Button Area */}
            <div className="relative pt-4">
              {isAdding ? (
                <div className="rounded-xl border border-[#d9d2c1] bg-white p-2 shadow-lg animate-fade-in">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(Object.keys(STEP_DEFINITIONS) as StepType[]).map((type) => {
                      const def = STEP_DEFINITIONS[type];
                      const Icon = def.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => addStep(type)}
                          className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-[#f7f5ef] transition-colors"
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${def.bg} ${def.border}`}>
                            <Icon size={20} className={def.color} />
                          </div>
                          <span className="text-xs font-bold text-[#4f5a53]">{def.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 border-t border-[#f0ece3] pt-2 text-center">
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="text-xs font-bold text-[#687169] hover:text-[#1e2521]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[#a39b8b] bg-white text-[#687169] shadow-sm transition-all hover:border-[#176b5d] hover:bg-[#176b5d] hover:text-white hover:shadow-md"
                  >
                    <Plus size={20} className="transition-transform group-hover:scale-110" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-[480px] overflow-y-auto bg-white p-6 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        {activeStep ? (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e3dccd] pb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${STEP_DEFINITIONS[activeStep.type].bg} ${STEP_DEFINITIONS[activeStep.type].border}`}>
                {React.createElement(STEP_DEFINITIONS[activeStep.type].icon as React.ElementType, { size: 20, className: STEP_DEFINITIONS[activeStep.type].color })}
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1e2521]">{STEP_DEFINITIONS[activeStep.type].label}</h3>
                <p className="text-xs text-[#687169]">Configure step behavior and content</p>
              </div>
            </div>

            {activeStep.type === "WAIT" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-[#687169]">Wait duration</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          value={activeStep.delayDays}
                          onChange={(e) => updateStep(activeStep.id, { delayDays: parseInt(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-[#e3dccd] p-3 pr-12 text-sm font-bold shadow-sm focus:border-[#176b5d] focus:outline-none focus:ring-1 focus:ring-[#176b5d]"
                        />
                        <span className="absolute right-4 top-3.5 text-xs font-bold text-[#9a9488]">Days</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          value={activeStep.delayHours}
                          onChange={(e) => updateStep(activeStep.id, { delayHours: parseInt(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-[#e3dccd] p-3 pr-12 text-sm font-bold shadow-sm focus:border-[#176b5d] focus:outline-none focus:ring-1 focus:ring-[#176b5d]"
                        />
                        <span className="absolute right-4 top-3.5 text-xs font-bold text-[#9a9488]">Hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {activeStep.type === "EMAIL" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase text-[#687169]">Subject Line</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Quick idea for {{company}}"
                      value={activeStep.subject || ""}
                      onChange={(e) => updateStep(activeStep.id, { subject: e.target.value })}
                      className="w-full rounded-xl border border-[#e3dccd] p-3 text-sm shadow-sm focus:border-[#176b5d] focus:outline-none focus:ring-1 focus:ring-[#176b5d]"
                    />
                  </div>
                )}
                
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-[#687169]">Message Template</label>
                    <span className="text-[10px] font-bold text-[#176b5d] cursor-pointer hover:underline">Insert Variable {`{}`}</span>
                  </div>
                  <textarea 
                    rows={12}
                    placeholder={`Hi {{firstName}},...`}
                    value={activeStep.content || ""}
                    onChange={(e) => updateStep(activeStep.id, { content: e.target.value })}
                    className="w-full resize-y rounded-xl border border-[#e3dccd] p-3 text-sm leading-relaxed shadow-sm focus:border-[#176b5d] focus:outline-none focus:ring-1 focus:ring-[#176b5d]"
                  />
                </div>

                <div className="rounded-xl border border-[#cfe7de] bg-[#f3faf7] p-4">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase text-[#176b5d]">
                    <Sparkles size={14} /> AI Personalization
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-[#4f5a53]">
                    When this step runs, the LeadForge agent will customize the template using the approved research dossier and buying signals.
                  </p>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-[#e3dccd] flex justify-end">
               <button className="inline-flex items-center gap-2 rounded-xl bg-[#1e2521] px-4 py-2 text-sm font-black text-white hover:bg-[#323d36] transition-colors">
                  <Save size={16} /> Save Step
               </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ece3]">
              <Calendar size={24} className="text-[#a39b8b]" />
            </div>
            <p className="text-lg font-black text-[#1e2521]">No step selected</p>
            <p className="mt-2 text-sm text-[#687169]">Click a step in the sequence to configure its details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
