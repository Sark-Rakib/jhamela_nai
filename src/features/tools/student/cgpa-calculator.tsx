"use client";

/**
 * CGPA / GPA ক্যালকুলেটর
 *
 * Covers the scales actually used in Bangladesh universities (4.00, 5.00 and
 * 10-point) plus the BUET-style letter table, and computes both semester GPA
 * and cumulative CGPA from completed semesters.
 */

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { EmptyResult, ResultCard, StatBlock, ToolLayout, ToolPanel } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";
import { useToolState } from "@/lib/use-tool-state";
import { parseNumber, round2, uid } from "@/lib/utils";

type ScaleKey = "4" | "5" | "10";

type ScaleField = "four" | "five" | "ten";

const SCALE_FIELD: Record<ScaleKey, ScaleField> = { "4": "four", "5": "five", "10": "ten" };

/** Letter grade → grade point, normalised per scale. */
const GRADE_TABLE: Record<string, { four: number; five: number; ten: number; label: string }> = {
  "A+": { four: 4.0, five: 5.0, ten: 10, label: "A+" },
  A: { four: 3.75, five: 4.75, ten: 9, label: "A" },
  "A-": { four: 3.5, five: 4.5, ten: 8.5, label: "A-" },
  "B+": { four: 3.25, five: 4.25, ten: 8, label: "B+" },
  B: { four: 3.0, five: 4.0, ten: 7, label: "B" },
  "B-": { four: 2.75, five: 3.75, ten: 6.5, label: "B-" },
  "C+": { four: 2.5, five: 3.5, ten: 6, label: "C+" },
  C: { four: 2.25, five: 3.25, ten: 5.5, label: "C" },
  "C-": { four: 2.0, five: 3.0, ten: 5, label: "C-" },
  D: { four: 1.5, five: 2.5, ten: 4, label: "D" },
  F: { four: 0, five: 0, ten: 0, label: "F" },
  I: { four: 0, five: 0, ten: 0, label: "I (অসম্পূর্ণ)" },
};

interface Course {
  id: string;
  name: string;
  credit: string;
  grade: keyof typeof GRADE_TABLE | "";
}

interface Semester {
  id: string;
  name: string;
  gpa: string;
  credits: string;
}

interface State {
  scale: ScaleKey;
  current: Course[];
  previous: Semester[];
}

const DEFAULT_STATE: State = {
  scale: "4",
  current: [
    { id: "c1", name: "বাংলা", credit: "3", grade: "A-" },
    { id: "c2", name: "ইংরেজি", credit: "3", grade: "B+" },
    { id: "c3", name: "হিসাববিদ্যা", credit: "4", grade: "A" },
    { id: "c4", name: "পরিষ্কারতা ও সুস্থতা", credit: "1", grade: "A+" },
  ],
  previous: [{ id: "s1", name: "সেমিস্টার ১", gpa: "3.42", credits: "21" }],
};

export function CgpaCalculator() {
  const { state, setState, reset } = useToolState<State>("cgpa-calculator", DEFAULT_STATE);

  const gradeOptions = Object.keys(GRADE_TABLE).map((key) => ({
    value: key,
    label: GRADE_TABLE[key].label,
  }));

  const { current: courses, previous: semesters } = state;
  const scaleField = SCALE_FIELD[state.scale];

  const semesterGpa = React.useMemo(() => {
    let credits = 0;
    let weighted = 0;
    let invalid = 0;

    for (const course of courses) {
      const credit = parseNumber(course.credit);
      const points = course.grade ? (GRADE_TABLE[course.grade]?.[scaleField] ?? null) : null;
      if (course.grade === "I") continue; // incomplete subject is excluded
      if (!course.name.trim() || credit <= 0 || points === null) {
        if (course.name.trim() || credit > 0) invalid += 1;
        continue;
      }
      credits += credit;
      weighted += credit * points;
    }

    return {
      gpa: credits > 0 ? round2(weighted / credits) : null,
      credits: round2(credits),
      invalid,
    };
  }, [courses, scaleField]);

  const cumulative = React.useMemo(() => {
    let credits = 0;
    let weighted = 0;
    let skipped = 0;

    for (const semester of semesters) {
      const gpa = parseNumber(semester.gpa);
      const credit = parseNumber(semester.credits);
      if (credit <= 0 || gpa < 0) {
        skipped += 1;
        continue;
      }
      credits += credit;
      weighted += credit * gpa;
    }

    const currentCredits = semesterGpa.credits ?? 0;
    const currentWeighted = (semesterGpa.gpa ?? 0) * currentCredits;

    const totalCredits = credits + currentCredits;
    return {
      cgpa: totalCredits > 0 ? round2((weighted + currentWeighted) / totalCredits) : null,
      totalCredits: round2(totalCredits),
      skipped,
    };
  }, [semesters, semesterGpa]);

  const maxPoints = state.scale === "4" ? 4 : state.scale === "5" ? 5 : 10;

  function updateCourse(id: string, patch: Partial<Course>) {
    setState((prev) => ({
      ...prev,
      current: prev.current.map((course) => (course.id === id ? { ...course, ...patch } : course)),
    }));
  }

  function updateSemester(id: string, patch: Partial<Semester>) {
    setState((prev) => ({
      ...prev,
      previous: prev.previous.map((semester) =>
        semester.id === id ? { ...semester, ...patch } : semester,
      ),
    }));
  }

  return (
    <ToolLayout
      form={
        <ToolPanel
          title="কোর্স ও গ্রেড"
          description="কোর্সের নাম, ক্রেডিট ও লেটার গ্রেড দিন।"
          onReset={reset}
          actions={
            <PdfButton targetId="cgpa-print" filename="cgpa-result" title="GPA / CGPA ফলাফল" />
          }
        >
          <div className="space-y-5">
            <Field label="গ্রেডিং স্কেল">
              <Select
                value={state.scale}
                onValueChange={(value) => setState((prev) => ({ ...prev, scale: value as ScaleKey }))}
                options={[
                  { value: "4", label: "৪.০০ স্কেল (সাধারণ)" },
                  { value: "5", label: "৫.০০ স্কেল" },
                  { value: "10", label: "১০ পয়েন্ট স্কেল" },
                ]}
                ariaLabel="গ্রেডিং স্কেল"
              />
            </Field>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">বর্তমান সেমিস্টারের কোর্স</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      current: [...prev.current, { id: uid("c"), name: "", credit: "3", grade: "" }],
                    }))
                  }
                >
                  <Plus aria-hidden />
                  কোর্স যোগ
                </Button>
              </div>

              <div className="mt-3 space-y-2.5">
                {state.current.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    কোর্স যোগ করুন।
                  </p>
                ) : null}

                {state.current.map((course, index) => (
                  <div key={course.id} className="grid grid-cols-[1fr_4.5rem_7rem_auto] items-center gap-2">
                    <label htmlFor={`course-${course.id}`} className="sr-only">
                      কোর্স {index + 1} এর নাম
                    </label>
                    <Input
                      id={`course-${course.id}`}
                      value={course.name}
                      onChange={(event) => updateCourse(course.id, { name: event.target.value })}
                      placeholder={`কোর্স ${index + 1}`}
                    />
                    <label htmlFor={`credit-${course.id}`} className="sr-only">
                      কোর্স {index + 1} এর ক্রেডিট
                    </label>
                    <Input
                      id={`credit-${course.id}`}
                      inputMode="decimal"
                      value={course.credit}
                      onChange={(event) => updateCourse(course.id, { credit: event.target.value })}
                      placeholder="ক্রেডিট"
                      className="text-center"
                    />
                    <Select
                      value={course.grade}
                      onValueChange={(value) =>
                        updateCourse(course.id, { grade: value as Course["grade"] })
                      }
                      options={[{ value: "", label: "গ্রেড" }, ...gradeOptions]}
                      placeholder="গ্রেড"
                      ariaLabel={`কোর্স ${index + 1} এর গ্রেড`}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          current: prev.current.filter((item) => item.id !== course.id),
                        }))
                      }
                      aria-label={`${course.name || `কোর্স ${index + 1}`} সরান`}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <details className="rounded-lg border border-border bg-surface-muted px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                আগের সেমিস্টর যোগ করুন (CGPA বের করতে হলে)
              </summary>
              <div className="mt-3 space-y-2.5">
                {state.previous.map((semester) => (
                  <div key={semester.id} className="grid grid-cols-[1fr_5rem_5rem_auto] items-center gap-2">
                    <Input
                      value={semester.name}
                      onChange={(event) => updateSemester(semester.id, { name: event.target.value })}
                      placeholder="সেমিস্টার ১"
                      aria-label="সেমিস্টারের নাম"
                    />
                    <Input
                      inputMode="decimal"
                      value={semester.gpa}
                      onChange={(event) => updateSemester(semester.id, { gpa: event.target.value })}
                      placeholder="GPA"
                      className="text-center"
                      aria-label="জিপিএ"
                    />
                    <Input
                      inputMode="decimal"
                      value={semester.credits}
                      onChange={(event) =>
                        updateSemester(semester.id, { credits: event.target.value })
                      }
                      placeholder="ক্রেডিট"
                      className="text-center"
                      aria-label="ক্রেডিট"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          previous: prev.previous.filter((item) => item.id !== semester.id),
                        }))
                      }
                      aria-label={`${semester.name} সরান`}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      previous: [
                        ...prev.previous,
                        { id: uid("s"), name: `সেমিস্টার ${prev.previous.length + 1}`, gpa: "", credits: "" },
                      ],
                    }))
                  }
                >
                  <Plus aria-hidden />
                  আগের সেমিস্টর যোগ
                </Button>
              </div>
            </details>

            <SaveButton slug="cgpa-calculator" state={state} />
            <GuestHint slug="cgpa-calculator" />
          </div>
        </ToolPanel>
      }
      results={
        <div id="cgpa-print" className="space-y-4">
          {semesterGpa.gpa !== null ? (
            <>
              <ResultCard title="ফলাফল">
                <div className="space-y-3">
                  <StatBlock
                    label="এই সেমিস্টারের GPA"
                    value={`${semesterGpa.gpa.toFixed(2)} / ${maxPoints}`}
                    tone="brand"
                    hint={`মোট ক্রেডিট ${semesterGpa.credits}`}
                  />
                  {cumulative.cgpa !== null ? (
                    <StatBlock
                      label="সর্বমোট CGPA"
                      value={`${cumulative.cgpa.toFixed(2)} / ${maxPoints}`}
                      hint={`সব সেমিস্টার মিলিয়ে ${cumulative.totalCredits} ক্রেডিট`}
                      tone="accent"
                    />
                  ) : null}
                </div>
              </ResultCard>

              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted text-2xs uppercase tracking-wide text-faint-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">কোর্স</th>
                      <th className="px-3 py-2 text-center font-medium">ক্রেডিট</th>
                      <th className="px-3 py-2 text-center font-medium">গ্রেড</th>
                      <th className="px-3 py-2 text-right font-medium">পয়েন্ট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.current.map((course) => {
                      const points = course.grade ? (GRADE_TABLE[course.grade]?.[scaleField] ?? null) : null;
                      return (
                        <tr key={course.id} className="border-t border-border">
                          <td className="px-3 py-2 font-medium">{course.name || "—"}</td>
                          <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">
                            {course.credit || "0"}
                          </td>
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            {course.grade || "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums">
                            {points === null ? "—" : points.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {maxPoints === 4
                  ? "ভালো চাকরির জন্য সাধারণত CGPA ৩.০০+ চাওয়া হয়; ৩.৫০+ হলে প্রায় সব জায়গায় প্রযোগ্যতা থাকে।"
                  : maxPoints === 5
                    ? "এই স্কেলে ৪.০০+ খুব ভালো ফলাফল।"
                    : "৮০%+ সাধারণত A বা A+ পর্যায়ে পড়ে।"}
                {semesterGpa.invalid > 0
                  ? ` ${semesterGpa.invalid}টি কোর্সের ক্রেডিট বা গ্রেড অসম্পূর্ণ, তাই হিসাবে ধরা হয়নি।`
                  : ""}
              </p>
            </>
          ) : (
            <EmptyResult message="অন্তত একটি কোর্সের ক্রেডিট ও গ্রেড দিলে GPA দেখুন।" />
          )}
        </div>
      }
    />
  );
}