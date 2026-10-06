/**
 * Compact tool index used by the assistant.
 *
 * The full tool definitions (SEO copy, FAQs, UI hints) live in the web app, so
 * this file only carries what the API needs: an id, search keywords and a short
 * usage hint. The client hydrates the complete definition by slug.
 */

export interface ToolIndexEntry {
  slug: string;
  label: string;
  category: string;
  hint: string;
  keywords: string[];
}

export const TOOL_INDEX: ToolIndexEntry[] = [
  {
    slug: "budget-planner",
    label: "বাজেট প্ল্যানার",
    category: "money",
    hint: "আয় বিভাজন, জমানি ও ব্যয়ের লক্ষ্য ঠিক করে মাসিক বাজেট তৈরি করে।",
    keywords: ["budget", "বাজেট", "আয়", "ব্যয়", "খরচের পরিকল্পনা", "মাসের খরচ", "টাকা ভাগ", "hisaab", "বাজেট প্ল্যানার"],
  },
  {
    slug: "expense-tracker",
    label: "খরচের হিসাব",
    category: "money",
    hint: "প্রতিদিনের খরচ ক্যাটাগরিভাবে লিখে রাখে এবং মাসের সারাংশ দেখায়।",
    keywords: ["expense", "খরচ", "খরচের হিসাব", "হিসাব", "টাকা খরচ", "খরচের তালিকা", "expense tracker"],
  },
  {
    slug: "savings-calculator",
    label: "সঞ্চয় ক্যালকুলেটর",
    category: "money",
    hint: "লক্ষ্যের জন্য কতদিন সঞ্চয় করতে হবে এবং মাসে কত টাকা জমাতে হবে হিসাব করে।",
    keywords: ["savings", "সঞ্চয়", "জমা", "লক্ষ্য", "সঞ্চয়ের লক্ষ্য", "কতদিন", "savings calculator"],
  },
  {
    slug: "loan-emi-calculator",
    label: "লোন EMI ক্যালকুলেটর",
    category: "money",
    hint: "ব্যাংক লোনের কিস্তি, সুদ ও মোট ফেরত দেখায়।",
    keywords: ["emi", "loan", "লোন", "কিস্তি", "ঋণ", "ব্যাংক লোন", "emi calculator", "চক্রবৃত্তি"],
  },
  {
    slug: "profit-loss-calculator",
    label: "লাভ-ক্ষতি ক্যালকুলেটর",
    category: "money",
    hint: "ব্যবসার আয় ও ব্যয় থেকে লাভ, ক্ষতি এবং মার্জিন বের করে।",
    keywords: ["profit", "loss", "লাভ", "ক্ষতি", "ব্যবসা", "মার্জিন", "profit loss", "laba"],
  },
  {
    slug: "cgpa-calculator",
    label: "CGPA ক্যালকুলেটর",
    category: "student",
    hint: "কোর্সভিত্তিক গ্রেড ও ক্রেডিট দিয়ে CGPA/GPA এবং সেমিস্টার ভিত্তিক ফলাফল হিসাব করে।",
    keywords: ["cgpa", "gpa", "গ্রেড", "ফলাফল", "পয়েন্ট", "কোর্স", "সেমিস্টার", "cgpa calculator"],
  },
  {
    slug: "study-planner",
    label: "পড়ার পরিকল্পনা",
    category: "student",
    hint: "বিষয় ও সময় ভাগ করে দৈনিক পড়ার রুটিন তৈরি করে।",
    keywords: ["study", "পড়া", "পড়ার প্ল্যানার", "রুটিন", "রিভিশন", "রিভিশনের পরিকল্পনা", "সিলেবাস", "study plan"],
  },
  {
    slug: "exam-countdown",
    label: "পরীক্ষা কাউন্ডাউন",
    category: "student",
    hint: "পরবর্তী পরীক্ষার তারিখ, বাকি দিন ও প্রস্তুতির অগ্রগতি দেখায়।",
    keywords: ["exam", "পরীক্ষা", "কাউন্ডাউন", "পরীক্ষার তারিখ", "কত দিন", "পরীক্ষার আগে"],
  },
  {
    slug: "assignment-planner",
    label: "অ্যাসাইনমেন্ট পরিকল্পনা",
    category: "student",
    hint: "অ্যাসাইনমেন্ট জমার তারিখ ধরে পেছন থেকে পরিকল্পনা করে (গবেষণা, খসড়া, জমা)।",
    keywords: ["assignment", "অ্যাসাইনমেন্ট", "জমা", "অ্যাসাইনমেন্টের তারিখ", "প্রজেক্ট", "deadline"],
  },
  {
    slug: "cv-builder",
    label: "CV বিল্ডার",
    category: "career",
    hint: "বাংলা বা ইংরেজিতে পরিষ্কার, প্রিন্টযোগ্য CV বানায়।",
    keywords: ["cv", "resume", "সিভি", "রিজিউমে", "জীবনবিবরণী", "cv builder", "আবেদন"],
  },
  {
    slug: "cover-letter-generator",
    label: "কভার লেটার জেনারেটর",
    category: "career",
    hint: "নির্দিষ্ট চাকরির জন্য সংক্ষিপ্ত কভার লেটার লেখে।",
    keywords: ["cover letter", "কভার লেটার", "চাকরির আবেদন", "চাকরির লেখা"],
  },
  {
    slug: "job-application-generator",
    label: "চাকরির আবেদন লেখক",
    category: "career",
    hint: "পোস্ট অনুযায়ী আবেদন ও মোট কভার লেটার তৈরি করে।",
    keywords: ["job", "চাকরি", "আবেদন", "job application", "পোস্ট", "নিয়োগ"],
  },
  {
    slug: "interview-questions",
    label: "ইন্টারভিউ প্রশ্ন",
    category: "career",
    hint: "প্রস্তুতির জন্য সাধারণ ও টেকনিক্যাল ইন্টারভিউ প্রশ্ন দেখায়।",
    keywords: ["interview", "ইন্টারভিউ", "প্রশ্ন", "সাক্ষাৎকার", "interview questions"],
  },
  {
    slug: "invoice-generator",
    label: "ইনভয়েস জেনারেটর",
    category: "documents",
    hint: "ভ্যাট ও ডিসকাউন্টসহ ব্যবসার ট্যাক্স ইনভয়েস তৈরি করে, PDF নামায়।",
    keywords: ["invoice", "ইনভয়েস", "বিল", "tax invoice", "ভ্যাট", "ট্যাক্স ইনভয়েস"],
  },
  {
    slug: "receipt-generator",
    label: "রসিদ জেনারেটর",
    category: "documents",
    hint: "টাকা পাওয়ার সঙ্গে সঙ্গে রসিদ ছাপিয়ে নেয়।",
    keywords: ["receipt", "রসিদ", "money receipt", "পেমেন্ট", "জমা দেওয়া"],
  },
  {
    slug: "quotation-generator",
    label: "কোটেশন জেনারেটর",
    category: "documents",
    hint: "ক্লায়েন্টকে পাঠানোর মতো দামের তালিকা (কোটেশন) তৈরি করে।",
    keywords: ["quotation", "কোটেশন", "দামের তালিকা", "estimate", "অনুমান"],
  },
  {
    slug: "image-compressor",
    label: "ইমেজ কম্প্রেসর",
    category: "documents",
    hint: "ছবির সাইজ ছোট করে ওয়েবসাইট বা হোয়াটসঅ্যাপে পাঠানোর জন্য প্রস্তুত করে।",
    keywords: ["image", "ছবি", "ইমেজ", "কম্প্রেস", "size", "ছবির সাইজ", "compress", "photo"],
  },
  {
    slug: "pdf-maker",
    label: "PDF মেকার",
    category: "documents",
    hint: "লেখা বা ছবি থেকে এক বা একাধিক পেজের PDF বানায়।",
    keywords: ["pdf", "পিডিএফ", "pdf maker", "ডকুমেন্ট", "ফাইল", "তৈরি"],
  },
  {
    slug: "travel-budget-planner",
    label: "ভ্রমণ বাজেট",
    category: "planning",
    hint: "ভ্রমণের খরচ, থাকা ও প্রতিদিনের বাজেট হিসাব করে।",
    keywords: ["travel", "ভ্রমণ", "ট্যুর", "trip", "ভ্রমণের খরচ", "টিকিট", "ভ্রমণ পরিকল্পনা"],
  },
  {
    slug: "event-planner",
    label: "ইভেন্ট পরিকল্পনা",
    category: "planning",
    hint: "বিয়ে, জন্মদিন বা যেকোনো আয়োজনের খরচ ও চেকলিস্ট সাজায়।",
    keywords: ["event", "ইভেন্ট", "আয়োজন", "বিয়ে", "জন্মদিন", "ওয়েডিং", "পার্টি", "event planner"],
  },
  {
    slug: "moving-checklist",
    label: "স্থানান্তর চেকলিস্ট",
    category: "planning",
    hint: "নতুন ঠিকানায় যাওয়ার আগে ও পরে কী কী করতে হবে তার চেকলিস্ট।",
    keywords: ["moving", "স্থানান্তর", "গেড়াউল", "বাসা", "চলে যাওয়া", "moving checklist"],
  },
  {
    slug: "shopping-list",
    label: "শপিং তালিকা",
    category: "planning",
    hint: "বাজারের লিস্ট, আনুমানিক দাম ও বাকি আইটেম মনে রাখে।",
    keywords: ["shopping", "শপিং", "বাজার", "কেনাকাটা", "লিস্ট", "shopping list"],
  },
  {
    slug: "to-do-planner",
    label: "টু-ডু পরিকল্পনা",
    category: "planning",
    hint: "দৈনিক কাজ, অগ্রাধিকার ও সময়সীমা দিয়ে টু-ডু লিস্ট সাজায়।",
    keywords: ["todo", "to do", "টুডু", "টু-ডু", "কাজের লিস্ট", "চেকলিস্ট", "অগ্রাধিকার"],
  },
];

export const TOOL_SLUGS = new Set(TOOL_INDEX.map((tool) => tool.slug));

export function findTool(slug: string): ToolIndexEntry | undefined {
  return TOOL_INDEX.find((tool) => tool.slug === slug);
}