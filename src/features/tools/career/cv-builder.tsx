"use client";

/**
 * CV builder.
 *
 * A plain, ATS-friendly one-page CV composer: no templates, no drag-and-drop
 * canvas. Everything the visitor types is mirrored into a print-safe sheet that
 * can be exported to PDF, copied as text, or synced to an account.
 */

import * as React from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Separator } from "@/components/ui/card";
import { useToolState } from "@/lib/use-tool-state";
import { copyToClipboard, downloadText } from "@/lib/export";
import { trackDownload, trackToolCompleted } from "@/lib/analytics";
import { uid, isValidBDBoMobile, isValidEmail } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "cv-builder";

interface Experience {
  id: string;
  role: string;
  company: string;
  from: string;
  to: string;
  current: boolean;
  bullets: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  result: string;
}

interface State {
  name: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  summary: string;
  skills: string;
  experience: Experience[];
  education: Education[];
  languages: string;
}

const EMPTY_EXPERIENCE: Experience = {
  id: "",
  role: "",
  company: "",
  from: "",
  to: "",
  current: false,
  bullets: "",
};

const DEFAULT_STATE: State = {
  name: "",
  title: "",
  phone: "",
  email: "",
  location: "",
  summary: "",
  skills: "",
  experience: [],
  education: [],
  languages: "ইংরেজি — পড়া ও লেখা",
};

function newExperience(): Experience {
  return { ...EMPTY_EXPERIENCE, id: uid("exp") };
}

function newEducation(): Education {
  return { id: uid("edu"), degree: "", institution: "", year: "", result: "" };
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.replace(/^[-•*\d.\s]+/, "").trim())
    .filter(Boolean);
}

function asPlainText(state: State): string {
  const out: string[] = [];
  out.push(state.name || "আপনার নাম", state.title, "");
  const contact = [state.phone, state.email, state.location].filter(Boolean).join(" | ");
  if (contact) out.push(contact);
  if (state.summary) out.push("", "সারসংক্ষেপ", state.summary);
  if (state.skills) out.push("", "দক্ষতা", state.skills);

  if (state.experience.length > 0) {
    out.push("", "কর্মজীবনের অভিজ্ঞতা");
    for (const item of state.experience) {
      if (!item.role && !item.company) continue;
      const period = [item.from, item.current ? "বর্তমান" : item.to].filter(Boolean).join(" – ");
      out.push(`${item.role}${item.company ? ` — ${item.company}` : ""}${period ? ` (${period})` : ""}`);
      for (const bullet of lines(item.bullets)) out.push(`• ${bullet}`);
    }
  }

  if (state.education.length > 0) {
    out.push("", "শিক্ষাগত যোগ্যতা");
    for (const item of state.education) {
      if (!item.degree && !item.institution) continue;
      out.push(
        `${item.degree}${item.institution ? ` — ${item.institution}` : ""}${
          item.year ? ` (${item.year})` : ""
        }${item.result ? ` — ${item.result}` : ""}`,
      );
    }
  }

  if (state.languages) out.push("", "ভাষা", state.languages);
  return out.join("\n");
}

export function CvBuilder() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  function patch<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function patchExperience(id: string, next: Partial<Experience>) {
    setState((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, ...next } : item)),
    }));
  }

  function patchEducation(id: string, next: Partial<Education>) {
    setState((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...next } : item)),
    }));
  }

  const plain = asPlainText(state);
  const experienceCount = state.experience.filter((item) => item.role || item.company).length;
  const educationCount = state.education.filter((item) => item.degree || item.institution).length;
  const skillsList = state.skills
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const isReady = Boolean(state.name && state.title && (state.phone || state.email));

  return (
    <>
      <ToolLayout
        form={
          <div className="space-y-5">
            <ToolPanel
              title="ব্যক্তিগত তথ্য"
              description="যেটুকুই দেবেন CV-তে ততটুকুই আসবে — কোনো বানানো তথ্য যোগ হবে না।"
              onReset={reset}
              actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="পূর্ণ নাম" required htmlFor="cv-name">
                  <Input
                    id="cv-name"
                    value={state.name}
                    onChange={(event) => patch("name", event.target.value)}
                    placeholder="যেমন: রহিম উদ্দিন"
                  />
                </Field>
                <Field label="পদবি" required htmlFor="cv-title" hint="যেমন: অ্যাকাউন্ট্যান্ট">
                  <Input
                    id="cv-title"
                    value={state.title}
                    onChange={(event) => patch("title", event.target.value)}
                    placeholder="যেমন: অ্যাকাউন্ট্যান্ট"
                  />
                </Field>
                <Field
                  label="মোবাইল"
                  htmlFor="cv-phone"
                  error={
                    state.phone && !isValidBDBoMobile(state.phone) ? "১১ ডিজিটের বাংলাদেশি নম্বর দিন" : undefined
                  }
                >
                  <Input
                    id="cv-phone"
                    value={state.phone}
                    inputMode="tel"
                    onChange={(event) => patch("phone", event.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </Field>
                <Field
                  label="ইমেইল"
                  htmlFor="cv-email"
                  error={state.email && !isValidEmail(state.email) ? "ইমেইল ঠিকানাটি সঠিক নয়" : undefined}
                >
                  <Input
                    id="cv-email"
                    type="email"
                    value={state.email}
                    onChange={(event) => patch("email", event.target.value)}
                    placeholder="name@example.com"
                  />
                </Field>
                <Field label="ঠিকানা" htmlFor="cv-location" className="sm:col-span-2">
                  <Input
                    id="cv-location"
                    value={state.location}
                    onChange={(event) => patch("location", event.target.value)}
                    placeholder="যেমন: ধানমন্ডি, ঢাকা"
                  />
                </Field>
                <Field
                  label="সারসংক্ষেপ"
                  htmlFor="cv-summary"
                  className="sm:col-span-2"
                  hint="২–৩ লাইনে আপনার মূল যোগ্যতা"
                >
                  <Textarea
                    id="cv-summary"
                    rows={3}
                    value={state.summary}
                    onChange={(event) => patch("summary", event.target.value)}
                    placeholder="যেমন: ৫ বছরের অভিজ্ঞতাধারী অ্যাকাউন্ট্যান্ট, Tally ও Excel-এ দক্ষ…"
                  />
                </Field>
              </div>
            </ToolPanel>

            <ToolPanel
              title="কর্মজীবনের অভিজ্ঞতা"
              description="সবচেয়ে সাম্প্রতিকটা আগে লিখুন।"
              actions={
                <Button variant="outline" size="sm" onClick={() => patch("experience", [...state.experience, newExperience()])}>
                  <Plus aria-hidden />
                  যোগ করুন
                </Button>
              }
            >
              {state.experience.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  এখনো কোনো অভিজ্ঞতা যোগ করা হয়নি। চাকরি না থাকলেও ইন্টার্নশিপ বা ফ্রিল্যান্স কাজও লেখা যায়।
                </p>
              ) : (
                <ul className="space-y-4">
                  {state.experience.map((item, index) => (
                    <li key={item.id} className="rounded-xl border border-border p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-faint-foreground">
                          অভিজ্ঞতা {index + 1}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`অভিজ্ঞতা ${index + 1} মুছে ফেলুন`}
                          onClick={() =>
                            patch(
                              "experience",
                              state.experience.filter((row) => row.id !== item.id),
                            )
                          }
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="পদবি" htmlFor={`exp-role-${item.id}`}>
                          <Input
                            id={`exp-role-${item.id}`}
                            value={item.role}
                            onChange={(event) => patchExperience(item.id, { role: event.target.value })}
                            placeholder="যেমন: সিনিয়র অ্যাকাউন্ট্যান্ট"
                          />
                        </Field>
                        <Field label="প্রতিষ্ঠান" htmlFor={`exp-company-${item.id}`}>
                          <Input
                            id={`exp-company-${item.id}`}
                            value={item.company}
                            onChange={(event) => patchExperience(item.id, { company: event.target.value })}
                            placeholder="যেমন: বিকাশ প্লাস"
                          />
                        </Field>
                        <Field label="শুরু" htmlFor={`exp-from-${item.id}`} hint="যেমন: ০১/২০২২">
                          <Input
                            id={`exp-from-${item.id}`}
                            value={item.from}
                            onChange={(event) => patchExperience(item.id, { from: event.target.value })}
                            placeholder="০১/২০২২"
                          />
                        </Field>
                        <Field label="শেষ" htmlFor={`exp-to-${item.id}`}>
                          <Input
                            id={`exp-to-${item.id}`}
                            value={item.to}
                            disabled={item.current}
                            onChange={(event) => patchExperience(item.id, { to: event.target.value })}
                            placeholder="১২/২০২৪"
                          />
                        </Field>
                        <Field label="দায়িত্ব ও অর্জন" htmlFor={`exp-bullets-${item.id}`} className="sm:col-span-2">
                          <Textarea
                            id={`exp-bullets-${item.id}`}
                            rows={4}
                            value={item.bullets}
                            onChange={(event) => patchExperience(item.id, { bullets: event.target.value })}
                            placeholder={"প্রতি লাইনে একটি কাজ লিখুন\nযেমন: মাসিক ৩০০+ ইনভয়েস প্রসেস করেছি"}
                          />
                        </Field>
                      </div>
                      <label className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border accent-primary"
                          checked={item.current}
                          onChange={(event) => patchExperience(item.id, { current: event.target.checked })}
                        />
                        এখনো এখানে কর্মরত আছি
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </ToolPanel>

            <ToolPanel
              title="শিক্ষাগত যোগ্যতা"
              actions={
                <Button variant="outline" size="sm" onClick={() => patch("education", [...state.education, newEducation()])}>
                  <Plus aria-hidden />
                  যোগ করুন
                </Button>
              }
            >
              {state.education.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  সর্বশেষ ডিগ্রি বা সার্টিফিকেট যোগ করুন।
                </p>
              ) : (
                <ul className="space-y-4">
                  {state.education.map((item, index) => (
                    <li key={item.id} className="rounded-xl border border-border p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-faint-foreground">
                          শিক্ষা {index + 1}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`শিক্ষা ${index + 1} মুছে ফেলুন`}
                          onClick={() =>
                            patch(
                              "education",
                              state.education.filter((row) => row.id !== item.id),
                            )
                          }
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="ডিগ্রি / সার্টিফিকেট" htmlFor={`edu-degree-${item.id}`}>
                          <Input
                            id={`edu-degree-${item.id}`}
                            value={item.degree}
                            onChange={(event) => patchEducation(item.id, { degree: event.target.value })}
                            placeholder="যেমন: বিবিএ (অনার্স)"
                          />
                        </Field>
                        <Field label="শিক্ষাপ্রতিষ্ঠান" htmlFor={`edu-inst-${item.id}`}>
                          <Input
                            id={`edu-inst-${item.id}`}
                            value={item.institution}
                            onChange={(event) => patchEducation(item.id, { institution: event.target.value })}
                            placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                          />
                        </Field>
                        <Field label="সময়কাল" htmlFor={`edu-year-${item.id}`}>
                          <Input
                            id={`edu-year-${item.id}`}
                            value={item.year}
                            onChange={(event) => patchEducation(item.id, { year: event.target.value })}
                            placeholder="যেমন: ২০১৮–২০২২"
                          />
                        </Field>
                        <Field label="ফলাফল" htmlFor={`edu-result-${item.id}`}>
                          <Input
                            id={`edu-result-${item.id}`}
                            value={item.result}
                            onChange={(event) => patchEducation(item.id, { result: event.target.value })}
                            placeholder="যেমন: GPA 3.62"
                          />
                        </Field>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ToolPanel>

            <ToolPanel title="দক্ষতা ও ভাষা">
              <div className="grid gap-4">
                <Field
                  label="দক্ষতা"
                  htmlFor="cv-skills"
                  hint="কমা দিয়ে আলাদা করুন"
                >
                  <Textarea
                    id="cv-skills"
                    rows={2}
                    value={state.skills}
                    onChange={(event) => patch("skills", event.target.value)}
                    placeholder="Tally, MS Excel, বাংলা টাইপিং, সাপোর্ট"
                  />
                </Field>
                <Field label="ভাষা" htmlFor="cv-languages">
                  <Textarea
                    id="cv-languages"
                    rows={2}
                    value={state.languages}
                    onChange={(event) => patch("languages", event.target.value)}
                    placeholder="বাংলা — মাতৃভাষা, ইংরেজি — মধ্যম"
                  />
                </Field>
              </div>
            </ToolPanel>
          </div>
        }
        results={
          <div className="space-y-4">
            <ResultCard title="প্রস্তুতির অবস্থা">
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="অভিজ্ঞতা" value={`${experienceCount}`} />
                <StatBox label="শিক্ষা" value={`${educationCount}`} />
                <StatBox label="দক্ষতা" value={`${skillsList.length}`} />
                <StatBox
                  label="পূর্ণতা"
                  value={isReady ? "শুরু করুন" : "অসম্পূর্ণ"}
                  tone={isReady ? "brand" : "default"}
                />
              </div>
              <p className="mt-3 text-2xs leading-relaxed text-faint-foreground">
                নাম ও পদবি ছাড়া একটি চাকরির আবেদনপত্রও বিশ্বাসযোগ্য নয়।
              </p>
            </ResultCard>

            <div
              id="cv-sheet"
              className="rounded-xl border border-border bg-white p-6 text-slate-800 shadow-sm print:border-0 print:p-0 print:shadow-none"
            >
              <h3 className="text-xl font-bold tracking-tight">{state.name || "আপনার নাম"}</h3>
              {state.title ? <p className="mt-0.5 text-sm font-medium text-slate-600">{state.title}</p> : null}
              <p className="mt-2 text-xs text-slate-600">
                {[state.phone, state.email, state.location].filter(Boolean).join("  •  ") ||
                  "যোগাযোগের তথ্য যোগ করুন"}
              </p>

              <CvSection title="সারসংক্ষেপ">
                <p className="text-xs leading-relaxed">{state.summary || "সারসংক্ষেপ লিখুন।"}</p>
              </CvSection>

              <CvSection title="দক্ষতা">
                {skillsList.length > 0 ? (
                  <p className="text-xs leading-relaxed">{skillsList.join(" • ")}</p>
                ) : (
                  <p className="text-xs text-slate-500">দক্ষতা লিখুন।</p>
                )}
              </CvSection>

              <CvSection title="কর্মজীবনের অভিজ্ঞতা">
                {experienceCount > 0 ? (
                  <ul className="space-y-3">
                    {state.experience
                      .filter((item) => item.role || item.company)
                      .map((item) => (
                        <li key={item.id}>
                          <p className="text-xs font-semibold">
                            {item.role || "পদবি"}{" "}
                            {item.company ? <span className="font-normal text-slate-600">— {item.company}</span> : null}
                          </p>
                          <p className="text-2xs text-slate-500">
                            {[item.from, item.current ? "বর্তমান" : item.to].filter(Boolean).join(" – ")}
                          </p>
                          <ul className="mt-1 space-y-0.5 pl-4">
                            {lines(item.bullets).map((bullet) => (
                              <li key={bullet} className="list-disc text-xs leading-relaxed text-slate-700">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">অভিজ্ঞতা যোগ করুন।</p>
                )}
              </CvSection>

              <CvSection title="শিক্ষাগত যোগ্যতা">
                {educationCount > 0 ? (
                  <ul className="space-y-2">
                    {state.education
                      .filter((item) => item.degree || item.institution)
                      .map((item) => (
                        <li key={item.id}>
                          <p className="text-xs font-semibold">
                            {item.degree || "ডিগ্রি"}{" "}
                            {item.institution ? (
                              <span className="font-normal text-slate-600">— {item.institution}</span>
                            ) : null}
                          </p>
                          <p className="text-2xs text-slate-500">
                            {[item.year, item.result].filter(Boolean).join("  •  ")}
                          </p>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">শিক্ষাগত যোগ্যতা যোগ করুন।</p>
                )}
              </CvSection>

              <CvSection title="ভাষা" last>
                <p className="text-xs leading-relaxed">{state.languages || "—"}</p>
              </CvSection>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PdfButton
                targetId="cv-sheet"
                filename="cv"
                title={state.name ? `${state.name} — সিভি` : "সিভি"}
                disabled={!isReady}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!isReady}
                onClick={async () => {
                  const ok = await copyToClipboard(plain);
                  if (ok) {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                    toast.success("সিভি টেক্সট কপি হয়েছে।");
                  } else {
                    toast.error("কপি করা যায়নি। ফাইলটি সরাসরি নাম দিয়ে সংরক্ষণ করুন।");
                  }
                }}
              >
                <Copy aria-hidden />
                {copied ? "কপি হয়েছে" : "টেক্সট কপি"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!isReady}
                onClick={() => {
                  downloadText("cv", plain);
                  trackDownload(SLUG, { format: "txt" });
                  toast.success("টেক্সট ফাইল ডাউনলোড হয়েছে।");
                }}
              >
                TXT
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={!isReady}
                onClick={() => {
                  trackToolCompleted(SLUG, { sections: experienceCount + educationCount });
                  toast.success("CV প্রস্তুত। এখন PDF নিয়ে পাঠাতে পারেন।");
                }}
              >
                CV প্রস্তুত
              </Button>
              <GuestHint slug={SLUG} />
            </div>
          </div>
        }
      />
    </>
  );
}

function StatBox({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "brand" }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-2xs uppercase tracking-wide text-faint-foreground">{label}</p>
      <p
        className={
          tone === "brand" ? "mt-1 text-base font-bold text-primary" : "mt-1 text-base font-bold text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}

function CvSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={last ? "mt-4" : "mt-4 border-t border-slate-200 pt-3"}>
      <h4 className="mb-1.5 text-2xs font-bold uppercase tracking-widest text-slate-500">{title}</h4>
      {children}
    </section>
  );
}