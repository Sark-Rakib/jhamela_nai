"use client";

/**
 * Tool implementation registry.
 *
 * `src/lib/tools.ts` is the *catalogue* (SEO, keywords, copy); this map is the
 * *behaviour*. Keeping them separate means a tool can be documented and routed
 * long before its UI lands, and the page shell stays identical for all of them.
 */

import type * as React from "react";

import { TOOLS } from "@/lib/tools";

import { BudgetPlanner } from "./money/budget-planner";
import { ExpenseTracker } from "./money/expense-tracker";
import { LoanEmiCalculator } from "./money/loan-emi-calculator";
import { ProfitLossCalculator } from "./money/profit-loss-calculator";
import { SavingsCalculator } from "./money/savings-calculator";
import { AssignmentPlanner } from "./student/assignment-planner";
import { CgpaCalculator } from "./student/cgpa-calculator";
import { ExamCountdown } from "./student/exam-countdown";
import { StudyPlanner } from "./student/study-planner";

import { CoverLetterGenerator } from "./career/cover-letter-generator";
import { CvBuilder } from "./career/cv-builder";
import { InterviewQuestions } from "./career/interview-questions";
import { JobApplicationGenerator } from "./career/job-application-generator";

import { ImageCompressor } from "./documents/image-compressor";
import { InvoiceGenerator } from "./documents/invoice-generator";
import { PdfMaker } from "./documents/pdf-maker";
import { QuotationGenerator } from "./documents/quotation-generator";
import { ReceiptGenerator } from "./documents/receipt-generator";

import { EventPlanner } from "./planning/event-planner";
import { MovingChecklist } from "./planning/moving-checklist";
import { ShoppingList } from "./planning/shopping-list";
import { ToDoPlanner } from "./planning/to-do-planner";
import { TravelBudgetPlanner } from "./planning/travel-budget-planner";

const IMPLEMENTATIONS: Record<string, React.ComponentType> = {
  "budget-planner": BudgetPlanner,
  "expense-tracker": ExpenseTracker,
  "savings-calculator": SavingsCalculator,
  "loan-emi-calculator": LoanEmiCalculator,
  "profit-loss-calculator": ProfitLossCalculator,
  "cgpa-calculator": CgpaCalculator,
  "study-planner": StudyPlanner,
  "exam-countdown": ExamCountdown,
  "assignment-planner": AssignmentPlanner,
  "cv-builder": CvBuilder,
  "cover-letter-generator": CoverLetterGenerator,
  "job-application-generator": JobApplicationGenerator,
  "interview-questions": InterviewQuestions,
  "invoice-generator": InvoiceGenerator,
  "receipt-generator": ReceiptGenerator,
  "quotation-generator": QuotationGenerator,
  "image-compressor": ImageCompressor,
  "pdf-maker": PdfMaker,
  "travel-budget-planner": TravelBudgetPlanner,
  "event-planner": EventPlanner,
  "moving-checklist": MovingChecklist,
  "shopping-list": ShoppingList,
  "to-do-planner": ToDoPlanner,
};

export function isToolReady(slug: string): boolean {
  return Boolean(IMPLEMENTATIONS[slug]);
}

export function ToolUi({ slug }: { slug: string }) {
  const Component = IMPLEMENTATIONS[slug];
  if (!Component) return <ToolPending slug={slug} />;
  return <Component />;
}

function ToolPending({ slug }: { slug: string }) {
  const tool = TOOLS.find((item) => item.slug === slug);
  const alternatives = TOOLS.filter((item) => item.slug !== slug)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
      <p className="text-base font-semibold text-foreground">
        {tool?.nameBn ?? "এই টুল"} শীঘ্রই যোগ হচ্ছে
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        এই টুলটির কাজ এখনো প্রকাশ করা হয়নি। ততক্ষণে নিচের টুলগুলো ব্যবহার করতে পারেন।
      </p>
      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {alternatives.map((item) => (
          <li key={item.slug}>
            <a
              href={`/tools/${item.slug}`}
              className="inline-flex rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {item.nameBn}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}