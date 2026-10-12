/**
 * Central catalogue of every tool on Jhamela Nai.
 *
 * This registry is the single source of truth for:
 *  - navigation & the /tools directory
 *  - global search + keyword matching + AI intent fallback
 *  - per-tool SEO metadata, OpenGraph copy and JSON-LD
 *  - sitemap generation
 *  - "related tools" and "popular right now" rails
 *
 * Adding a tool = adding one entry here + one folder under src/features/.
 */

export type ToolCategorySlug =
  | "money"
  | "career"
  | "documents"
  | "planning"
  | "student";

export type ToolAccent =
  | "brand"
  | "accent"
  | "violet"
  | "sky"
  | "rose"
  | "amber";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  /** Short Bangla name used inside the UI. */
  nameBn: string;
  /** One-line promise. Shown on cards + hero suggestions. */
  tagline: string;
  /** Longer explanation used on the tool page and for SEO description. */
  description: string;
  category: ToolCategorySlug;
  icon: string;
  accent: ToolAccent;
  /** Ordered match weight — higher wins on ties. */
  weight: number;
  popular?: boolean;
  featured?: boolean;
  /** Needs an account to keep results permanently. */
  requiresSave?: boolean;
  /** Pure client-side — never calls the API. */
  clientOnly?: boolean;
  keywords: string[];
  /** Bangla keyword strings (Bangla script). */
  keywordsBn: string[];
  seoTitle: string;
  seoDescription: string;
  tips: string[];
  faq: ToolFaq[];
  related: string[];
}

export interface CategoryDefinition {
  slug: ToolCategorySlug;
  name: string;
  nameBn: string;
  emoji: string;
  icon: string;
  description: string;
  accent: ToolAccent;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    slug: "money",
    name: "Money",
    nameBn: "টাকা ও হিসাব",
    emoji: "",
    icon: "Wallet",
    description:
      "আয়-ব্যয়ের হিসাব, বাজেট, কিস্তি আর লাভ-ক্ষতি — সব হিসাব এক জায়গায়, মুহূর্তে।",
    accent: "brand",
  },
  {
    slug: "career",
    name: "Career",
    nameBn: "চাকরি ও ক্যারিয়ার",
    emoji: "💼",
    icon: "BriefcaseBusiness",
    description:
      "CV, cover letter, আবেদন ও interview প্রস্তুতি — চাকরির খোঁজায় এগিয়ে থাকুন।",
    accent: "sky",
  },
  {
    slug: "documents",
    name: "Documents",
    nameBn: "ডকুমেন্ট",
    emoji: "📄",
    icon: "FileText",
    description:
      "Invoice, receipt, quotation তৈরি করুন এবং ছবি-PDF ছোট করুন — PDF ডাউনলোড সহ।",
    accent: "accent",
  },
  {
    slug: "planning",
    name: "Planning",
    nameBn: "পরিকল্পনা",
    emoji: "✈️",
    icon: "CalendarDays",
    description:
      "ভ্রমণ, উৎসব, উঠানো, কেনাকাটা ও to-do — জীবনের প্রতিটি পরিকল্পনা গোছান।",
    accent: "violet",
  },
  {
    slug: "student",
    name: "Student",
    nameBn: "শিক্ষার্থী",
    emoji: "🎓",
    icon: "GraduationCap",
    description:
      "CGPA, পড়ার পরিকল্পনা, পরীক্ষার কাউন্টডাউন ও assignment ডেডলাইন ট্র্যাক।",
    accent: "rose",
  },
];

export const TOOLS: ToolDefinition[] = [
  /* ------------------------------------------------------------------ money */
  {
    slug: "budget-planner",
    name: "Budget Planner",
    nameBn: "বাজেট প্ল্যানার",
    tagline: "মাসের আয় কোথায় যাচ্ছে দেখুন",
    description:
      "মাসিক আয় থেকে ভাড়া, খাবার, যাতায়াত, বিল আর সঞ্চয়ের লক্ষ্য — সব কিছুর একটি পরিষ্কার বাজেট প্ল্যান বানান এবং কোথায় টাকা বেশি যাচ্ছে তা দেখুন।",
    category: "money",
    icon: "PiggyBank",
    accent: "brand",
    weight: 100,
    popular: true,
    featured: true,
    requiresSave: true,
    keywords: [
      "budget",
      "planner",
      "monthly",
      "income",
      "expense plan",
      "salary",
      "budget bangladesh",
      "kharcha",
      "bajet",
    ],
    keywordsBn: [
      "বাজেট",
      "আয়",
      "খরচের হিসাব",
      "মাসিক আয়",
      "বাজেট প্ল্যানার",
      "টাকা হিসাব",
    ],
    seoTitle: "Free Budget Planner Bangladesh — মাসিক বাজেট বানান",
    seoDescription:
      "বিনামূল্যে মাসিক বাজেট প্ল্যানার। আয়, ভাড়া, খাবার, বিল ও সঞ্চয়ের লক্ষ্য দিয়ে পরিষ্কার বাজেট ও খরচের ভাঙ্গন এক মুহূর্তে। ৳ টাকায়, বাংলাদেশের জন্য।",
    tips: [
      "প্রতিটি ঘরে বাস্তবসম্মত অঙ্গ দিন — খুব আশাবাদী বাজেট দুই সপ্তাহেই ভেঙে যায়।",
      "সঞ্চয় লক্ষ্য আয়ের ১০% দিয়ে শুরু করুন, তারপর ধাপে ধাপে বাড়ান।",
      "'Other' ঘরে যা লেখেন সেটাই আসল সমস্যা — সাধারণত সেখানেই সবচেয়ে বেশি লিকেজ।",
    ],
    faq: [
      {
        question: "বাজেট প্ল্যানার কি সম্পূর্ণ ফ্রি?",
        answer:
          "হ্যাঁ। হিসাব করা, চার্ট দেখা এবং PDF ডাউনলোড সম্পূর্ণ ফ্রি। শুধু ফলাফল সংরক্ষণ করতে (সব ডিভাইসে ফিরে পেতে) একটি ফ্রি অ্যাকাউন্ট লাগবে।",
      },
      {
        question: "টাকার অঙ্গ বাংলায় দেখাবে?",
        answer:
          "হ্যাঁ, ৳ সিম্বলসহ বাংলা নম্বরে (৳৩০,০০০) দেখানোর অপশন আছে। সাধারণত ইংরেজি নম্বর বেশি পড়ার ঝামেলা কম বলে মনে হয়।",
      },
      {
        question: "খরচ বেশি হয়ে গেলে কী করব?",
        answer:
          "চার্টে সবচেয়ে বড় ঘর দেখুন — সাধারণত সেটাই 'Other' বা 'Shopping'। সেখানে সীমা বসিয়ে দিলেই বাজেট আবার ঠিক জায়গায় চলে আসে।",
      },
    ],
    related: ["expense-tracker", "savings-calculator", "loan-emi-calculator"],
  },
  {
    slug: "expense-tracker",
    name: "Expense Tracker",
    nameBn: "খরচের হিসাব",
    tagline: "প্রতিদিনের আয়-ব্যয় রাখুন",
    description:
      "প্রতিদিনের আয় ও খরচ ক্যাটাগরি আর নোট সহ জমা রাখুন, মাসিক ব্যালেন্স আর ক্যাটাগরি ভাঙ্গন দেখুন। লগইন করলে ইতিহাস সব ডিভাইসে থাকে।",
    category: "money",
    icon: "ReceiptIndianRupee",
    accent: "brand",
    weight: 95,
    popular: true,
    requiresSave: true,
    keywords: [
      "expense",
      "tracker",
      "kharcha",
      "spend",
      "money tracker",
      "daily expense",
      "budget tracking",
      "baki hishab",
    ],
    keywordsBn: [
      "খরচ",
      "আয় ব্যয়",
      "খরচ ট্র্যাকার",
      "হিসাব রাখা",
      "প্রতিদিনের খরচ",
    ],
    seoTitle: "Free Expense Tracker Bangladesh — প্রতিদিনের খরচের হিসাব",
    seoDescription:
      "বিনামূল্যে expense tracker। প্রতিদিনের আয়-ব্যয় ক্যাটাগরি সহ জমা রাখুন, মাস ফিল্টার করুন, ব্যালেন্স ও ক্যাটাগরি ভাঙ্গন দেখুন। ৳ টাকায় বাংলাদেশের জন্য।",
    tips: [
      "খরচ লেখার সময়ই ক্যাটাগরি বেছে নিন — পরে মনে থাকে না, আর হিসাব ভুল হয়।",
      "প্রথম এক সপ্তাহ ডেটা জমা দিয়ে দেখুন, তারপর বাজেট সেই অনুযায়ী ঠিক করুন।",
      "মাস শেষে 'Shopping' আর 'Food' মিলিয়ে দেখুন — এই দুটোতেই বেশির ভাগ লিকেজ হয়।",
    ],
    faq: [
      {
        question: "আমার ডেটা কি অন্য কারও কাছে যায়?",
        answer:
          "না। ডেটা শুধু আপনার অ্যাকাউন্টেই থাকে। আমরা অপ্রয়োজনীয় ব্যক্তিগত তথ্য সংগ্রহ করি না এবং কোনো বিজ্ঞাপনের জন্য বিক্রি করি না।",
      },
      {
        question: "লগইন ছাড়া খরচের হিসাব রাখা যাবে?",
        answer:
          "হ্যাঁ — খরচ যোগ ও হিসাব দেখা সম্পূর্ণ ফ্রি, লগইন ছাড়াই হয়। ফ্রি অ্যাকাউন্ট তৈরি করলে ইতিহাস ডিভাইস থেকে চলে যাবে না।",
      },
      {
        question: "আগের মাসের হিসাব দেখা যাবে?",
        answer:
          "হ্যাঁ, উপরের মাস ফিল্টার ব্যবহার করে যেকোনো মাসের হিসাব দেখতে পারবেন।",
      },
    ],
    related: ["budget-planner", "profit-loss-calculator", "savings-calculator"],
  },
  {
    slug: "savings-calculator",
    name: "Savings Calculator",
    nameBn: "সঞ্চয় হিসাব",
    tagline: "লক্ষ্য পৌঁছাতে কত সময় লাগবে?",
    description:
      "প্রতিটি টাকা, প্রতিটি মাস, প্রতিটি বছর — আপনার সঞ্চয় লক্ষ্য পৌঁছাতে কত দিন লাগবে তা হিসাব করুন। সুদসহ চলক সঞ্চয়ও হিসাব করা যায়।",
    category: "money",
    icon: "TrendingUp",
    accent: "brand",
    weight: 88,
    keywords: [
      "savings",
      "calculator",
      "goal",
      "interest",
      "investment",
      "bachao",
      "sanchay",
      "future value",
    ],
    keywordsBn: ["সঞ্চয়", "সঞ্চয় হিসাব", "লক্ষ্য", "সুদের হিসাব", "জমানো"],
    seoTitle: "Free Savings Calculator Bangladesh — সঞ্চয় লক্ষ্যের হিসাব",
    seoDescription:
      "বিনামূল্যে savings calculator। মাসিক সঞ্চয় ও সুদের হিসাব করে জানুন লক্ষ্য পৌঁছাতে কত মাস লাগবে। বাংলাদেশের ব্যাংক সুদের হারে।",
    tips: [
      "'Emergency fund' হিসাব করলে প্রথমেই ৩-৬ মাসের খরচের লক্ষ্য ধরুন — এটাই সবচেয়ে দরকারি সঞ্চয়।",
      "আয় বাড়লেও সঞ্চয়ের হার না বাড়িয়ে দিলে লক্ষ্য আসতে দেরি হয়।",
      "মাস শেষে টাকা আসলেই সঞ্চয়ে জমা দিন — বাকি থাকলে খরচ হয়ে যায়।",
    ],
    faq: [
      {
        question: "সুদের হার কোনটা ব্যবহার করা হচ্ছে?",
        answer:
          "আপনি নিজে সুদের হার বসাতে পারেন। বাংলাদেশের সাধারণ সঞ্চয় অ্যাকাউন্টের হার প্রায় ৫-১০%, যা আপনি ব্যাংকের সাথে যাচাই করে বসাতে পারেন।",
      },
      {
        question: "একবারে বড় অঙ্ক জমা দিলে হিসাব কি আলাদা হবে?",
        answer:
          "হ্যাঁ, ক্যালকুলেটরে দুই ধরনের পদ্ধতি আছে — শুধু মাসিক জমা, অথবা প্রথমে একবারে বড় অঙ্ক জমা দিয়ে শুরু।",
      },
    ],
    related: ["budget-planner", "loan-emi-calculator", "expense-tracker"],
  },
  {
    slug: "loan-emi-calculator",
    name: "Loan / EMI Calculator",
    nameBn: "লোন / EMI হিসাব",
    tagline: "কিস্তি, সুদ আর মোট লোন জানুন",
    description:
      "ব্যাংক লোন বা কিস্তির হিসাব করুন — প্রতিটি মাসের EMI, মোট সুদ এবং ফেরত দিতে কত সময় লাগবে। পার্সোনাল লোন, গাড়ি লোন, বিজ্ঞাপন লোন সবকিছুর জন্য।",
    category: "money",
    icon: "Landmark",
    accent: "brand",
    weight: 90,
    keywords: [
      "emi",
      "loan",
      "interest",
      "instalment",
      "installment",
      "bank loan",
      "personal loan",
      "car loan",
      "kisti",
    ],
    keywordsBn: ["লোন", "EMI", "কিস্তি", "সুদের হিসাব", "ব্যাংক লোন", "ঋণ"],
    seoTitle: "Free Loan EMI Calculator Bangladesh — কিস্তির হিসাব",
    seoDescription:
      "বিনামূল্যে EMI calculator। ব্যাংক লোনের কিস্তি, মোট সুদ ও ক্রয়মূল্য হিসাব করুন। পার্সোনাল লোন, গাড়ি লোন, হোম লোন — ৳ টাকায়।",
    tips: [
      "ব্যাংকের EMI-র সাথে গার্ডিফার ও প্রসেসিং চার্জ যোগ করে নিন — আসল মাসিক খরচ একটু বেশি।",
      "কম সুদে দীর্ঘ মেয়াদ নিলে EMI কম হয়, কিন্তু মোট সুদ বাড়ে।",
      "সকালে ফেরত দিলে প্রায় ২০% পর্যন্ত সুদ বাঁচে — সম্ভব হলে চেষ্টা করুন।",
    ],
    faq: [
      {
        question: "সুদ কমানো যাবে?",
        answer:
          "হ্যাঁ। টাকা ফেরত দেওয়ার সাথে সাথে অগ্রিম ফেরত (prepayment) করলে সুদের পরিমাণ কমে যায়। ক্যালকুলেটরে অগ্রিম ফেরত যোগ করে দেখুন।",
      },
      {
        question: "চলতি হিসাবে এই EMI কত?",
        answer:
          "সরকারি চলতি হার সাধারণত ৭-১২%। ব্যবসায়িক লোনে এর চেয়ে কম সুদ পাওয়া যায়। সঠিক হার ব্যাংক নিজেই জানাবে।",
      },
      {
        question: "EMI বাড়লে কি মেয়াদ কমে?",
        answer:
          "না, কিস্তির পরিমাণ বাড়ালে মেয়াদ একই থাকে, শুধু মোট সুদ কমে আর ফেরত দিতে দ্রুত শেষ হয়।",
      },
    ],
    related: ["savings-calculator", "profit-loss-calculator", "budget-planner"],
  },
  {
    slug: "profit-loss-calculator",
    name: "Profit / Loss Calculator",
    nameBn: "লাভ-ক্ষতি হিসাব",
    tagline: "ব্যবসার লাভ কত, ক্ষতি কত?",
    description:
      "ক্রয়মূল্য ও বিক্রয়মূল্য থেকে লাভ-ক্ষতির হিসাব করুন — শতকরা হার, মার্জিন আর চাইলে ভ্যাট/ডিসকাউন্টসহ। দোকান ও ফ্রিল্যান্স দুজনের জন্যই।",
    category: "money",
    icon: "Scale",
    accent: "brand",
    weight: 85,
    keywords: [
      "profit",
      "loss",
      "margin",
      "business",
      "ecommerce",
      "reseller",
      "lab",
      "khosti",
    ],
    keywordsBn: [
      "লাভ",
      "ক্ষতি",
      "মুনাফা",
      "লাভ ক্ষতি হিসাব",
      "ব্যবসা",
      "মার্জিন",
    ],
    seoTitle: "Free Profit Loss Calculator Bangladesh — লাভ-ক্ষতি হিসাব",
    seoDescription:
      "বিনামূল্যে profit loss calculator। ক্রয়মূল্য ও বিক্রয়মূল্য দিয়ে লাভ-ক্ষতি, শতকরা হার ও মার্জিন হিসাব করুন। বাংলাদেশের ব্যবসার জন্য।",
    tips: [
      "ডিসকাউন্ট দিলে সেটা ক্রয়মূল্যের উপর দেওয়া, নাকি বিক্রয়মূল্যের উপর — ক্যালকুলেটরে দুটোই আলাদা করে দেখানো হয়েছে।",
      "ইনভয়েসে লাভ দেখানোর আগে ডেলিভারি চার্জ ও প্যাকেজিং খরচ যোগ করে নিন।",
      "প্রতিটি অর্ডারে এই হিসাবটা করলে কোন অর্ডারে লাভ কম, তা স্পষ্ট দেখা যায়।",
    ],
    faq: [
      {
        question: "গড় লাভ (average margin) কীভাবে বের হয়?",
        answer:
          "বিক্রয়মূল্য থেকে ক্রয়মূল্য বাদ দিয়ে যে অংশটুকু থাকে, সেটাই মার্জিন। শতকরা হার হিসাব করার জন্য বিক্রয়মূল্য বা ক্রয়মূল্য — যেটা আপনি ভিত্তি হিসাবে নিতে চান সেটি বেছে নিন।",
      },
      {
        question: "ভ্যাট/ট্যাক্স কি লাভের ভিত্তিতে ধরা হয়?",
        answer:
          "ক্যালকুলেটরে ট্যাক্স ও ডেলিভারি চার্জ আলাদা ঘরে থাকে, তাই 'আসল লাভ' দেখানো হয় — যেটা আপনি ব্যাংক বা কর্তৃপক্ষকে দেখান।",
      },
    ],
    related: ["expense-tracker", "invoice-generator", "savings-calculator"],
  },

  /* ----------------------------------------------------------------- career */
  {
    slug: "cv-builder",
    name: "CV Builder",
    nameBn: "CV বিল্ডার",
    tagline: "এক মিনিটে প্রফেশনাল CV",
    description:
      "আপনার তথ্য দিয়ে পরিষ্কার, ATS-ফ্রেন্ডলি CV বানান। আলাদা আলাদা টেমপ্লেট বেছে নিন, প্রিভিউ দেখুন এবং সরাসরি PDF ডাউনলোড করুন।",
    category: "career",
    icon: "FileUser",
    accent: "sky",
    weight: 98,
    popular: true,
    featured: true,
    requiresSave: true,
    keywords: [
      "cv",
      "resume",
      "curriculum vitae",
      "job",
      "cv builder",
      "bengali cv",
      "bio data",
      " biodata",
    ],
    keywordsBn: ["সিভি", "CV", "রিজিউমে", "জব", "চাকরি", "বায়োডাটা", "আবেদন"],
    seoTitle: "Free CV Builder Bangladesh — অনলাইনে CV তৈরি করুন",
    seoDescription:
      "বিনামূল্যে online CV builder। পরিষ্কার, ATS-ফ্রেন্ডলি টেমপ্লেটে প্রফেশনাল CV বানান এবং সরাসরি PDF ডাউনলোড করুন। বাংলাদেশের জন্য তৈরি।",
    tips: [
      "প্রতিটি অভিজ্ঞতার বর্ণনায় সংখ্যা দিন — '৩০% বিক্রি বৃদ্ধি' 'বেশি কাজ' এর চেয়ে অনেক শক্তিশালী।",
      "ফটো দরকার হলে প্রফেশনাল ব্যাকগ্রাউন্ডের ছবি ব্যবহার করুন; ছবি না থাকলেও ATS CV ভালো কাজ করে।",
      "কাজ শেষ হলে প্রতিটি টেমপ্লেটের PDF ডাউনলোড করে রাখুন — চাকরির আবেদনে বারবার লাগবে।",
    ],
    faq: [
      {
        question: "আমার তথ্য কি কোথাও সেভ হয়?",
        answer:
          "লগইন না করলে সব হিসাব আপনার ব্রাউজারেই থাকে, কোথাও পাঠানো হয় না। অ্যাকাউন্ট তৈরি করলে সেভ করা CV আপনার ড্যাশবোর্ডে থাকে, যাতে পরে সম্পাদনা করা যায়।",
      },
      {
        question: "ATS কী, এটা কি আমার জন্য জরুরি?",
        answer:
          "ATS হলো যে সফটওয়্যার বড় কোম্পানির আবেদন ফাইল পড়ে। সাধারণ এক-কলাম, টেবিল-বিহীন লেআউট ATS-এর জন্য সবচেয়ে নিরাপদ। বিল্ডারে একটি ATS-টেমপ্লেট রয়েছে।",
      },
      {
        question: "একাধিক পেজ হলে কি হয়?",
        answer:
          "CV এক পেজের চেয়ে দুই পেজ ভালো। বেশি লেখা থাকলে প্রভাব দেখানো অংশগুলো রাখুন — বিস্তারিত জীবনী নয়।",
      },
    ],
    related: [
      "cover-letter-generator",
      "job-application-generator",
      "interview-questions",
    ],
  },
  {
    slug: "cover-letter-generator",
    name: "Cover Letter Generator",
    nameBn: "কভার লেটার জেনারেটর",
    tagline: "চাকরির আবেদনে আলাদা করে ব্যথা দিন",
    description:
      "আপনার অভিজ্ঞতা ও চাকরির পোজিশন দিয়ে তৈরি হয়ে যায় এমন কভার লেটার লিখুন — বাংলা ও ইংরেজি উভয় ভাষায়, এক ক্লিকে কপি বা ডাউনলোড।",
    category: "career",
    icon: "Mail",
    accent: "sky",
    weight: 86,
    requiresSave: true,
    keywords: [
      "cover letter",
      "motivation",
      "job application letter",
      "apply",
      "letter",
    ],
    keywordsBn: ["কভার লেটার", "চাকরির আবেদন", "মোটিভেশন লেটার", "চিঠি"],
    seoTitle: "Free Cover Letter Generator Bangladesh — চাকরির আবেদন পত্র",
    seoDescription:
      "বিনামূল্যে cover letter generator। আপনার অভিজ্ঞতা থেকে পেশাদার কভার লেটার তৈরি করুন — বাংলা ও ইংরেজিতে। সরাসরি কপি ও ডাউনলোড করুন।",
    tips: [
      "প্রথম লাইনেই কেন আপনি এই পোজিশনে যাচ্ছেন — বলুন, পরে পড়ে কেউ কাজে লাগাবে না।",
      "কভার লেটার ছোট রাখুন: ২৫০-৪০০ শব্দের মধ্যে সবচেয়ে ভালো কাজ করে।",
      "ফার্মাল ভাষা ব্যবহার করুন, তবে নিজের ভাষায় লেখা 'perfect English' এর চেয়ে বিশ্বাসযোগ্য।",
    ],
    faq: [
      {
        question: "এটা কি পুরোনো পদ্ধতি?",
        answer:
          "বাংলাদেশে এখনও অনেক বড় প্রতিষ্ঠান চিঠি চায়। যেখানে চাই না, সেখানে কভার লেটার বাদ দিলেও সিভি পাঠানোর আগে তা ইমেইলের শরীরে হিসেবে ব্যবহার করতে পারেন।",
      },
      {
        question: "একই লেটার সব জায়গায় পাঠানো যায়?",
        answer:
          "না। প্রতিটি কোম্পানির জন্য একটি লাইন পরিবর্তন করলেই কভার লেটার অনেক বেশি প্রভাব ফেলে — এটাই এই টুলের কাজ।",
      },
    ],
    related: ["cv-builder", "job-application-generator", "interview-questions"],
  },
  {
    slug: "job-application-generator",
    name: "Job Application Generator",
    nameBn: "চাকরির আবেদন পত্র",
    tagline: "সঠিক ঠিকানায় সঠিক আবেদন",
    description:
      "কোন কোম্পানিতে কী লিখবেন, কোন ডকুমেন্ট লাগবে, কীভাবে পাঠাবেন — ধাপে ধাপে আবেদন পত্র তৈরি করে নিন এবং চেকলিস্ট পাবেন।",
    category: "career",
    icon: "Send",
    accent: "sky",
    weight: 84,
    requiresSave: true,
    keywords: [
      "job application",
      "apply",
      "cover letter",
      "application form",
      "email",
      "how to apply",
    ],
    keywordsBn: ["আবেদন", "আবেদন পত্র", "চাকরি আবেদন", "কীভাবে আবেদন"],
    seoTitle:
      "Free Job Application Generator Bangladesh — আবেদন পত্র ও চেকলিস্ট",
    seoDescription:
      "বিনামূল্যে job application generator। কোম্পানি অনুযায়ী আবেদন ইমেইল, প্রয়োজনীয় ডকুমেন্ট ও আবেদন চেকলিস্ট তৈরি করুন।",
    tips: [
      "আবেদন ইমেইলের সাবজেক্ট লাইনে পোজিশনের নাম লিখুন — HR-এর ইনবক্সে এটা খুঁজে পায়।",
      "ফাইলের নাম 'রশিদ_আলম_CV.pdf' রাখুন — 'final_final2.pdf' রাখবেন না।",
      "যেখানে 'কেন আপনি?' লেখা আছে, সেখানে অন্তত তিনটি নির্দিষ্ট উদাহরণ দিন।",
    ],
    faq: [
      {
        question: "একই ইমেইল সব কোম্পানিতে পাঠানো যাবে?",
        answer:
          "ভালো ফলাফলের জন্য প্রতিটি কোম্পানির খোঁজ নাম, কাজের ধরন ও তারা যা খুঁজছে তা মেনে ইমেইলটি বদলে নিন। এই টুল সেই কাঠামোটাই তৈরি করে দেয়।",
      },
      {
        question: "ফলো-আপ ইমেইল কখন পাঠাবো?",
        answer:
          "আবেদনের ৫-৭ দিন পরে একটি ছোট, ধার্যমূলক ফলো-আপ ইমেইল পাঠানো ভালো অভ্যাস।",
      },
    ],
    related: ["cv-builder", "cover-letter-generator", "interview-questions"],
  },
  {
    slug: "interview-questions",
    name: "Interview Question Generator",
    nameBn: "ইন্টারভিউ প্রশ্ন",
    tagline: "চাকরির ইন্টারভিউয়ের প্রস্তুতি",
    description:
      "পোজিশন অনুযায়ী সম্ভাব্য ইন্টারভিউ প্রশ্ন, উত্তরের কাঠামো ও আগের দিনের চেকলিস্ট তৈরি করুন — ফ্রিল্যান্স থেকে অফিস জব, সবকিছুর জন্য।",
    category: "career",
    icon: "MessagesSquare",
    accent: "sky",
    weight: 82,
    keywords: [
      "interview",
      "questions",
      "interview prep",
      "hr questions",
      "aptitude",
      "viva",
    ],
    keywordsBn: [
      "ইন্টারভিউ",
      "সাক্ষাৎকার",
      "প্রশ্ন",
      "চাকরির প্রস্তুতি",
      "ভাইভা",
    ],
    seoTitle:
      "Free Interview Question Generator Bangladesh — ইন্টারভিউ প্রস্তুতি",
    seoDescription:
      "বিনামূল্যে interview question generator। পোজিশন অনুযায়ী সম্ভাব্য প্রশ্ন, উত্তরের কাঠামো ও ইন্টারভিউয়ের আগের দিনের চেকলিস্ট পান।",
    tips: [
      "প্রতিটি প্রশ্নের উত্তর ৩০ সেকেন্ডে বলার অভ্যাস করুন — ইন্টারভিউয়ার ধৈর্য সীমিত।",
      "STAR পদ্ধতি ব্যবহার করুন: Situation, Task, Action, Result — ফলাফল সবসময় শেষে বলুন।",
      "যে প্রশ্নের উত্তর জানেন না, সেটা সরাসরি বলুন — ভুল বলার চেয়ে অনেক ভালো।",
    ],
    faq: [
      {
        question: "প্রশ্ন কি সব কোম্পানির জন্য আলাদা?",
        answer:
          "কোম্পানি নিজের প্রশ্ন বদলাতে পারে, কিন্তু বেশিরভাগ প্রশ্ন ভূমিকা ও শিল্পের উপর নির্ভর করে। এই টুল সেই অনুযায়ী প্রশ্ন বাছাই করে।",
      },
      {
        question: "নিজের উত্তরও কি দেখা যাবে?",
        answer:
          "হ্যাঁ। 'আমার উত্তর লিখুন' ঘরে নিজের উত্তর লিখে রাখতে পারবেন, ইন্টারভিউর আগে পড়ে নিতে পারবেন।",
      },
    ],
    related: [
      "cv-builder",
      "cover-letter-generator",
      "job-application-generator",
    ],
  },

  /* -------------------------------------------------------------- documents */
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    nameBn: "Invoice জেনারেটর",
    tagline: "পেশাদার invoice, এক মিনিটে",
    description:
      "ক্লায়েন্টের নাম, পণ্যের তালিকা, ডিসকাউন্ট ও ভ্যাট দিয়ে পেশাদার invoice তৈরি করুন এবং PDF ডাউনলোড করুন। অ্যাকাউন্ট ছাড়াই ব্যবহার করা যায়।",
    category: "documents",
    icon: "FileSpreadsheet",
    accent: "accent",
    weight: 97,
    popular: true,
    featured: true,
    keywords: [
      "invoice",
      "bill",
      "receipt",
      "tax invoice",
      "generate invoice",
      "chalan",
    ],
    keywordsBn: ["ইনভয়েস", "বিল", "চালান", "মূল্য তালিকা", "বাকি"],
    seoTitle: "Free Invoice Generator Bangladesh — অনলাইনে Invoice তৈরি",
    seoDescription:
      "বিনামূল্যে invoice generator। পণ্যের তালিকা, ডিসকাউন্ট ও ভ্যাটসহ পেশাদার invoice বানিয়ে PDF ডাউনলোড করুন। অ্যাকাউন্ট ছাড়াই ফ্রি।",
    tips: [
      "প্রতিটি invoice-এ একটি ইউনিক নম্বর ও তারিখ দিন — হিসাব রাখা অনেক সহজ হয়।",
      "কোম্পানির লেগো ও ঠিকানা যোগ করলে invoice অনেক বেশি বিশ্বাসযোগ্য দেখায়।",
      "ট্যাক্স আইড নম্বর থাকলে invoice-এ বসিয়ে দিন — ক্লায়েন্টের করা থেকে অনেক সময় সমস্যা এড়ায়।",
    ],
    faq: [
      {
        question: "অ্যাকাউন্ট ছাড়াই invoice বানানো যাবে?",
        answer:
          "হ্যাঁ। Invoice বানানো, প্রিভিউ ও PDF ডাউনলোড সম্পূর্ণ ফ্রি, কোনো লগইন ছাড়াই। শুধু সব invoice মনে রাখতে চাইলে ফ্রি অ্যাকাউন্ট ব্যবহার করুন।",
      },
      {
        question: "কয়েকটি পণ্যের লাইন যোগ করা যাবে?",
        answer:
          "হ্যাঁ, যত খুশি লাইন যোগ বা মুছে ফেলা যাবে। প্রতিটি লাইনে পরিমাণ, একক দাম ছাড়াও বিবিধ খরচও দেওয়া যায়।",
      },
    ],
    related: [
      "quotation-generator",
      "receipt-generator",
      "profit-loss-calculator",
    ],
  },
  {
    slug: "receipt-generator",
    name: "Receipt Generator",
    nameBn: "রসিদ জেনারেটর",
    tagline: "হাতে-লেখা রসিদের বদলে ডিজিটাল রসিদ",
    description:
      "জমা টাকার বস্তু, তারিখ ও পরিমাণ লিখে সরাসরি প্রিন্টযোগ্য রসিদ তৈরি করুন — ছোট ব্যবসা ও ব্যক্তিগত লেনদেনের জন্য আদর্শ।",
    category: "documents",
    icon: "ScrollText",
    accent: "accent",
    weight: 84,
    keywords: [
      "receipt",
      "rasid",
      "money receipt",
      "acknowledgement",
      "voucher",
    ],
    keywordsBn: ["রসিদ", "জমার রসিদ", "রসিদ ফরম", "পরিশোধ"],
    seoTitle: "Free Receipt Generator Bangladesh — অনলাইনে রসিদ তৈরি",
    seoDescription:
      "বিনামূল্যে receipt generator। জমার পরিমাণ, বস্তুর বিবরণ ও তারিখসহ প্রিন্টযোগ্য রসিদ বানান এবং PDF ডাউনলোড করুন।",
    tips: [
      "টাকা গ্রহণ করার সাথে সাথে রসিদ দিন — পরে মনে থাকলেও হিসাব মেলে না।",
      "জমাদাতা ও গ্রহণকারীর নাম ও স্বাক্ষরের জায়গা রাখলে রসিদটি বেশি কার্যকর হয়।",
      "ধার চাইলে 'পরিশোধিত' বাক্সটি খালি রাখুন, ফেরতের সময় আবার দেখাতে পারবেন।",
    ],
    faq: [
      {
        question: "রসিদ কি হাতে-লেখার রসিদের বিকল্প?",
        answer:
          "হ্যাঁ, ছোট ব্যবসায় ডিজিটাল রসিদ বেশি পরিষ্কার ও হিসাব রাখতে সুবিধাজনক। প্রয়োজনে সেটি প্রিন্ট করে স্বাক্ষরসহ হাতে দেওয়া যায়।",
      },
      {
        question: "ভ্যাট লাগবে?",
        answer:
          "রসিদে প্রয়োজন হলে ভ্যাটের হার ও বিষয়সহ সংশ্লিষ্ট অঙ্ক বসানোর অপশন আছে।",
      },
    ],
    related: ["invoice-generator", "quotation-generator", "expense-tracker"],
  },
  {
    slug: "quotation-generator",
    name: "Quotation Generator",
    nameBn: "কোটেশন জেনারেটর",
    tagline: "কাজের দরপত্র পাঠান প্রফেশনালভাবে",
    description:
      "ক্লায়েন্টের নাম ও কাজের বিবরণ দিয়ে বৈধ কোটেশন তৈরি করুন — মূল্য, মেয়াদ, শর্তসহ। PDF ডাউনলোড করে সরাসরি ইমেইল বা হোয়াটসঅ্যাপে পাঠান।",
    category: "documents",
    icon: "Handshake",
    accent: "accent",
    weight: 80,
    keywords: [
      "quotation",
      "quote",
      "estimate",
      "proposal",
      "daler",
      "darpokhon",
    ],
    keywordsBn: ["কোটেশন", "দরপত্র", "অফার", "মূল্য প্রস্তাব", "প্রপোজাল"],
    seoTitle: "Free Quotation Generator Bangladesh — কোটেশন / দরপত্র তৈরি",
    seoDescription:
      "বিনামূল্যে quotation generator। ক্লায়েন্টের জন্য মূল্য, মেয়াদ ও শর্তসহ প্রফেশনাল কোটেশন বানিয়ে PDF ডাউনলোড করুন।",
    tips: [
      "কোটেশনে কত সময় কার্যকর থাকবে সেটা লিখে দিন — অন্যরা কম দর দিলে আপনার সুযোগ চলে যায়।",
      "'ভ্যাটসহ' নাকি 'ভ্যাট বহীত' — পরিষ্কার লিখলে পরে কোনো তর্ক হয় না।",
      "ডিসকাউন্ট দেওয়ার সময় শর্ত লিখুন (যেমন: ২০% অগ্রিম পেইমেন্টে)।",
    ],
    faq: [
      {
        question: "কোটেশন কি invoice থেকে আলাদা?",
        answer:
          "হ্যাঁ। কোটেশন প্রস্তাব — কাজ হয়নি, টাকাও দেওয়া হয়নি। Invoice হলো কাজ শেষ হওয়ার পরের বিল। দুটোর মধ্যে বিভ্রান্তি এড়াতে কোটেশনে 'Quotation' শিরোনাম রাখুন।",
      },
      {
        question: "কোটেশনে কি লগো বসানো যায়?",
        answer: "হ্যাঁ, আপনার কোম্পানির লোগো আপলোড করে ব্যবহার করতে পারবেন।",
      },
    ],
    related: [
      "invoice-generator",
      "receipt-generator",
      "profit-loss-calculator",
    ],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    nameBn: "ইমেজ কম্প্রেসর",
    tagline: "ছবি ছোট করুন, পরিষ্কার রাখুন",
    description:
      "ছবির সাইজ কমান, কিন্তু চেহারা ঠিক রাখুন। একাধিক ছবি একসাথে কমপ্রেস করুন, আগে-পরের সাইজ দেখুন এবং ডাউনলোড নিন। সব হিসাব আপনার ব্রাউজারেই।",
    category: "documents",
    icon: "ImageDown",
    accent: "accent",
    weight: 94,
    popular: true,
    clientOnly: true,
    keywords: [
      "compress",
      "image",
      "resize",
      "photo size",
      "reduce size",
      "jpg",
      "png",
      "upay",
    ],
    keywordsBn: [
      "ইমেজ কম্প্রেসর",
      "ছবি ছোট",
      "ফটো সাইজ",
      "ইমেজ রেসাইজ",
      "কমপ্রেস",
    ],
    seoTitle: "Free Image Compressor Bangladesh — ছবির সাইজ কমান",
    seoDescription:
      "বিনামূল্যে image compressor। JPG ও PNG ছবি কমপ্রেস করে সাইজ কমান, আগে-পরের তুলনা দেখুন এবং ডাউনলোড করুন। ছবি আপলোড হয় না।",
    tips: [
      "ওয়েবসাইটে ব্যবহারের জন্য প্রায় ৮০% কোয়ালিটি প্রায় সবসময় যথেষ্ট — সাইজ কিন্তু অনেক কমে যায়।",
      "প্রয়োজনে প্রস্থ/উচ্চতা দিয়ে ছবির সাইজ নির্দিষ্ট করুন, সব ছবি এক ফাইলে রূপান্তরও করা যায়।",
      "ভবিষ্যতে আপলোড বা প্রিন্টের জন্য রেখে দিলে অরিজিনাল ফাইলটি আলাদা করে সংরক্ষণ করে রাখুন।",
    ],
    faq: [
      {
        question: "আমার ছবি কি কোথাও আপলোড হয়?",
        answer:
          "না। সম্পূর্ণ কম্প্রেসিং আপনার ব্রাউজারের ভিতরেই হয়, কোনো সার্ভারে ছবি পাঠানো হয় না। তাই ইন্টারনেট সংযোগ ছাড়াও কাজ করে।",
      },
      {
        question: "একসাথে কয়টি ছবি কমপ্রেস করা যায়?",
        answer:
          "একসাথে ২০টি পর্যন্ত ছবি নেওয়া যায়। প্রতিটির আগে-পরের সাইজ আলাদা করে দেখানো হয়।",
      },
    ],
    related: ["pdf-maker", "cv-builder", "invoice-generator"],
  },
  {
    slug: "pdf-maker",
    name: "PDF Maker",
    nameBn: "টেক্সট ও ছবি থেকে PDF",
    tagline: "ছবি আর লেখা এক PDF-এ",
    description:
      "টেক্সট লিখুন বা ছবি যোগ করুন, পেজ সাজান — পেজ নম্বর সহ পরিষ্কার PDF তৈরি করুন। জাতীয় পরীক্ষার অ্যাপ্লিকেশন, কভার পেজ বা রিজার্ভেশন ফরমের জন্য।",
    category: "documents",
    icon: "FileType",
    accent: "accent",
    weight: 78,
    clientOnly: true,
    keywords: [
      "pdf",
      "pdf maker",
      "jpg to pdf",
      "text to pdf",
      "convert",
      "document",
      "pdf banano",
    ],
    keywordsBn: [
      "পিডিএফ",
      "PDF বানানো",
      "ছবি থেকে পিডিএফ",
      "টেক্সট থেকে পিডিএফ",
      "কনভার্ট",
    ],
    seoTitle: "Free PDF Maker Bangladesh — ছবি ও টেক্সট থেকে PDF",
    seoDescription:
      "বিনামূল্যে PDF maker। ছবি, টেক্সট ও পেজ লেআউট থেকে সাজানো PDF তৈরি করুন, পেজ নম্বর দিন এবং ডাউনলোড করুন।",
    tips: [
      "স্ক্যান করা ছবি খুব বড় হয়ে গেলে আগে Image Compressor দিয়ে ছোট করে নিন।",
      "A4 সাইজে এক পেজে হবে না এমন ছবি হলে 'Fit to width' ব্যবহার করুন।",
      "ফাইল নামে বিষয় ও তারিখ লিখে রাখুন — পরে খুঁজে পাওয়া অনেক সহজ হয়।",
    ],
    faq: [
      {
        question: "এটা কি সব ধরনের PDF এডিট করতে পারে?",
        answer:
          "না। এটি নতুন PDF তৈরি করে — ছবি ও লেখা থেকে। আগের PDF এডিট বা পেজ মার্জ করার কাজ এখানে নেই।",
      },
      {
        question: "ছবি কি আপলোড হয়?",
        answer:
          "না, ছবি ও লেখা দুটোই আপনার ব্রাউজারেই প্রসেস হয়, সার্ভারে পাঠানো হয় না।",
      },
    ],
    related: ["image-compressor", "invoice-generator", "receipt-generator"],
  },

  /* --------------------------------------------------------------- planning */
  {
    slug: "travel-budget-planner",
    name: "Travel Budget Planner",
    nameBn: "ট্রাভেল বাজেট প্ল্যানার",
    tagline: "ভ্রমণের পুরো খরচ আগেই জানুন",
    description:
      "শেরপুর থেকে ঢাকা, সিলেট থেকে কক্সবাজার — গাড়ি, হোটেল, খাবার ও ঘোরার খরচ হিসাব করে মোট খরচ, প্রতি জনের খরচ ও দৈনিক গড় বের করুন।",
    category: "planning",
    icon: "Plane",
    accent: "violet",
    weight: 96,
    popular: true,
    featured: true,
    requiresSave: true,
    keywords: [
      "travel",
      "trip",
      "tour",
      "budget trip",
      "holiday",
      "kharcha",
      "journey",
      "tour plan",
    ],
    keywordsBn: ["ভ্রমণ", "ট্রাভেল", "ট্রিপ", "যাত্রা", "খরচ", "ট্যুর", "ঘোরা"],
    seoTitle: "Free Travel Budget Planner Bangladesh — ভ্রমণের খরচ হিসাব",
    seoDescription:
      "বিনামূল্যে travel budget planner। গাড়ি, হোটেল, খাবার ও ঘোরার খরচ হিসাব করে মোট খরচ ও প্রতি জনের খরচ বের করুন। ৳ টাকায়, বাংলাদেশের রুটে।",
    tips: [
      "সম্ভব হলে অফ-পিকের সময় ভ্রমণ করুন — বাস ও ভাড়া কাঠামো অনেক কম থাকে।",
      "প্রথমেই হোটেল বুকিং ও গাড়ির খরচ আলাদা করে বসান, নিচে বাকি খরচ বাজেটের জন্য জায়গা থাকে।",
      "প্রতি জন হিসাবটা আগে দেখে নিন — কত জন যাবে তার উপর পুরো ছুটির বাজেট নির্ভর করে।",
    ],
    faq: [
      {
        question: "টিকিটের দাম কি এতে যোগ হয়?",
        answer:
          "হ্যাঁ, 'Transport' ঘরে টিকিট, ভাড়া, ফুয়েল বা টোল সব মিলিয়ে বসান। ঢাকা-শেরপুর বাস বা ট্রেনের ভাড়া ছোট হলেও রাস্তার অতিরিক্ত খরচ মাথায় রাখুন।",
      },
      {
        question: "হিসাবটা কি সেভ করা যায়?",
        answer:
          "হ্যাঁ। ফ্রি অ্যাকাউন্ট থাকলে ছুটির পরিকল্পনা সেভ থাকে, তাই পরে সম্পাদনা বা শেয়ার করা যায়।",
      },
    ],
    related: ["budget-planner", "event-planner", "shopping-list"],
  },
  {
    slug: "event-planner",
    name: "Event Planner",
    nameBn: "অনুষ্ঠান পরিকল্পনা",
    tagline: "ওয়েডিং থেকে ইফতার — সব খরচ ও চেকলিস্ট",
    description:
      "অনুষ্ঠানের পুরো খরচ — জায়গা, খাবার, সাজসজ্জা, অতিথি — ক্যাটাগরি করে হিসাব করুন এবং ধাপে ধাপে পরিকল্পনার চেকলিস্ট সামলান।",
    category: "planning",
    icon: "PartyPopper",
    accent: "violet",
    weight: 78,
    requiresSave: true,
    keywords: [
      "event",
      "wedding",
      "party",
      "planning",
      "budget",
      "iftar",
      "mehendi",
      "ceremony",
    ],
    keywordsBn: [
      "অনুষ্ঠান",
      "বিয়ে",
      "ওয়েডিং",
      "পার্টি",
      "ইফতার",
      "মেহেংদি",
      "আয়োজন",
    ],
    seoTitle: "Free Event Planner Bangladesh — অনুষ্ঠানের খরচ ও পরিকল্পনা",
    seoDescription:
      "বিনামূল্যে event planner। বিয়ে, ইফতার বা পার্টির সম্পূর্ণ খরচ ক্যাটাগরি করে হিসাব করুন এবং পরিকল্পনার চেকলিস্ট সামলান।",
    tips: [
      "সাজসজ্জা ও খাবারের মোট খরচের ১০-১৫% জমিয়ে রাখুন — হঠাৎ করে খরচ বেড়ে যায়।",
      "তালিকায় প্রতিটি ভেন্ডরের সাথে লিখিত দর তুলনা করুন, শুধু কথার ভিত্তিতে নয়।",
      "অনুষ্ঠানের ২ সপ্তাহ আগে চেকলিস্ট শেষ করার চেষ্টা করুন — তখনই সময় থাকে সমস্যা সামলাতে।",
    ],
    faq: [
      {
        question: "অতিথি সংখ্যা কত হবে বুঝতে পারছি না, কী করব?",
        answer:
          "সাধারণ বিয়ে/ইফতারে প্রতি ৫-৭ জন অতিথি পরিবারে হিসাব করুন, বিয়ের দাওয়াতে ৫-৬ জন। এর উপর ১০% বাফার রাখলেই ভালো হয়।",
      },
      {
        question: "চেকলিস্টে কী কী থাকে?",
        answer:
          "ঠিকানা ও অতিথি তালিকা, সাজসজ্জা, খাবার, ফটোগ্রাফার, ডেকোরেশন, মিষ্টি ও রিসেপশন সেটআপ — প্রতিটি আইটেম ও তার দায়িত্ব এক জায়গায় থাকে।",
      },
    ],
    related: ["travel-budget-planner", "shopping-list", "budget-planner"],
  },
  {
    slug: "moving-checklist",
    name: "Moving Checklist",
    nameBn: "উঠানোর চেকলিস্ট",
    tagline: "নতুন ঠিকানায় যাওয়া হোক হিসেবে সহজ",
    description:
      "নতুন বাড়িতে উঠানোর আগে, দিনে ও পরের দিনের জন্য আলাদা চেকলিস্ট — কী কী নিতে হবে, কোথায় রাখবেন, কখন করবেন।",
    category: "planning",
    icon: "Truck",
    accent: "violet",
    weight: 72,
    keywords: [
      "moving",
      "shift",
      "house",
      "relocation",
      "checklist",
      "new home",
      "uthao",
    ],
    keywordsBn: [
      "উঠানো",
      "গেলে যাওয়া",
      "নতুন বাড়ি",
      "চেকলিস্ট",
      "স্থানান্তর",
    ],
    seoTitle: "Free Moving Checklist Bangladesh — নতুন বাড়িতে উঠানোর চেকলিস্ট",
    seoDescription:
      "বিনামূল্যে moving checklist। উঠানোর আগে, দিনে ও পরের দিনের জন্য আলাদা চেকলিস্ট ও প্যাকিং টিপস পান।",
    tips: [
      "গুরুত্বপূর্ণ কাগজপত্র ও ওষুধ আলাদা ব্যাগে রাখুন — হারিয়ে গেলে বিপদ।",
      "বাক্সে বস্তুর নাম লিখে রাখুন, না হলে নতুন বাড়িতে খুঁজতে অনেক সময় লাগে।",
      "নতুন ঠিকানার বিদ্যুৎ, গ্যাস ও পানির বিল আগের ঠিকানার নামেই চালু রাখতে ভুলবেন না।",
    ],
    faq: [
      {
        question: "চেকলিস্টে কী কী আছে?",
        answer:
          "আগের বাড়ির সাফাই, বিদ্যুৎ-গ্যাস-পানির বিল, স্কুল ও অফিসের ঠিকানা পরিবর্তন, ওয়াশিং মেশিন ও ফ্রিজ সরানো, নতুন বাড়িতে সাজানো এবং জরুরি নম্বর সংরক্ষণ।",
      },
    ],
    related: ["to-do-planner", "event-planner", "budget-planner"],
  },
  {
    slug: "shopping-list",
    name: "Shopping List",
    nameBn: "কেনাকাটার তালিকা",
    tagline: "বাজারের তালিকা ভুলে যাওয়া বন্ধ",
    description:
      "মাসিক বাজার, ঔষধের দোকান বা দৈনন্দিন কেনাকাটা — আইটেম, পরিমাণ ও দামসহ তালিকা রাখুন, কেনা হলে টিক দিন এবং আগের তালিকা থেকে আবার অর্ডার করুন।",
    category: "planning",
    icon: "ShoppingBasket",
    accent: "violet",
    weight: 74,
    keywords: [
      "shopping",
      "grocery",
      "list",
      "bazar",
      "kharidar",
      "market",
      "groceries",
    ],
    keywordsBn: ["কেনাকাটা", "বাজার", "তালিকা", "দোকান", "বাজারের লিস্ট"],
    seoTitle: "Free Shopping List Bangladesh — কেনাকাটার তালিকা",
    seoDescription:
      "বিনামূল্যে shopping list। আইটেম, পরিমাণ ও আনুমানিক দাম যোগ করুন, মোট খরচ দেখুন এবং আগের তালিকা থেকে আবার অর্ডার করুন।",
    tips: [
      "প্রতি সপ্তাহে একবার সব তালিকা করে নিন — বারবার দোকানে যাওয়ার চাপ কমে।",
      "তালিকা শেষ হয়ে গেলে 'আগের তালিকা থেকে আবার নিন' বোতামে এক ক্লিকে পুরো তালিকা ফিরে পাবেন।",
      "আনুমানিক দাম দিলে মোট খরচ দেখে বাজেট মেনে চলা সহজ হয়।",
    ],
    faq: [
      {
        question: "তালিকা কি ডিভাইসে সেভ হবে?",
        answer:
          "অ্যাকাউন্ট ছাড়া হলে তালিকা এই ব্রাউজারেই থাকে এবং পরের ভিজিটেও পাওয়া যায়। ফ্রি অ্যাকাউন্ট তৈরি করলে সব ডিভাইসে থাকবে।",
      },
    ],
    related: ["to-do-planner", "budget-planner", "event-planner"],
  },
  {
    slug: "to-do-planner",
    name: "To-do Planner",
    nameBn: "টু-ডো প্ল্যানার",
    tagline: "কাজগুলো এক জায়গায়, সময়সহ",
    description:
      "দৈনন্দিন কাজ লিখুন, তারিখ ও সময় দিন, গুরুত্ব অনুযায়ী সাজান এবং আজ কী কী বাকি আছে দেখুন। সহজ, দ্রুত, বিজ্ঞান নেই।",
    category: "planning",
    icon: "ListChecks",
    accent: "violet",
    weight: 76,
    keywords: [
      "todo",
      "to-do",
      "task",
      "planner",
      "checklist",
      "daily tasks",
      "kaaj",
    ],
    keywordsBn: [
      "টুডু",
      "কাজের তালিকা",
      "টাস্ক",
      "পরিকল্পনা",
      "চেকলিস্ট",
      "দৈনিক কাজ",
    ],
    seoTitle: "Free To-do Planner Bangladesh — দৈনিক কাজের তালিকা",
    seoDescription:
      "বিনামূল্যে to-do planner। কাজ লিখুন, সময় ও গুরুত্ব দিন, আজকের কাজ দেখুন এবং সম্পন্ন হিসাব দেখুন।",
    tips: [
      "দিনে তিনটির বেশি গুরুত্বপূর্ণ কাজ না রাখলে বাস্তবে সব শেষ হয়।",
      "বড় কাজকে দুই ভাগে ভাঙুন — শুরু করা সহজ হয়।",
      "যেটা শেষ হয়নি সেটা পরদিনে টানে নিন, নতুন করে পরিকল্পনা করবেন না।",
    ],
    faq: [
      {
        question: "আমার কাজ কি অন্য কারও দেখতে পাবে?",
        answer: "না। তালিকা শুধু আপনার জন্য। কোনো শেয়ার বা পাবলিক লিংক নেই।",
      },
    ],
    related: ["study-planner", "shopping-list", "moving-checklist"],
  },

  /* ---------------------------------------------------------------- student */
  {
    slug: "cgpa-calculator",
    name: "CGPA Calculator",
    nameBn: "সিজিপিএ ক্যালকুলেটর",
    tagline: "GPA থেকে CGPA, সেকেন্ডে",
    description:
      "প্রতিটি সাবজেক্টের ক্রেডিট ও গ্রেড বসিয়ে GPA এবং সেমিস্টার ভিত্তিক CGPA বের করুন — যেকোনো বিশ্ববিদ্যালয়ের নিয়মে।",
    category: "student",
    icon: "GraduationCap",
    accent: "rose",
    weight: 99,
    popular: true,
    featured: true,
    requiresSave: true,
    keywords: [
      "cgpa",
      "gpa",
      "grade",
      "point",
      "result",
      "marks",
      "semester",
      "transcript",
    ],
    keywordsBn: [
      "সিজিপিএ",
      "জিপিএ",
      "গ্রেড",
      "পয়েন্ট",
      "রেজাল্ট",
      "সেমিস্টার",
      "ট্রান্সক্রিপ্ট",
    ],
    seoTitle: "Free CGPA Calculator Bangladesh — GPA ও CGPA হিসাব",
    seoDescription:
      "বিনামূল্যে CGPA calculator। সাবজেক্টভিত্তিক ক্রেডিট ও গ্রেড দিয়ে GPA, ধাপে ধাপে CGPA এবং সেমিস্টার ভিত্তিক হিসাব করুন।",
    tips: [
      "CGPA একবার হিসাব করলেই হয় না — প্রতিটি সেমিস্টার শেষে আবার হিসাব করুন, কারণ ওজন বদলায়।",
      "প্রতিটি সেমিস্টারের ক্রেডিট যোগ করে দিন, না হলে CGPA ভুল আসবে।",
      "চূড়ান্ত CGPA-তে শুধু সেমিস্টর GPA-র সাধারণ গড় নয়, ক্রেডিটও ওজন হিসেবে ধরা হয়।",
    ],
    faq: [
      {
        question: "কোন গ্রেডিং স্কেল ব্যবহার করা হয়েছে?",
        answer:
          "ডিফল্টভাবে ৪.০ স্কেল ব্যবহার করা হয়েছে, যা বাংলাদেশের বেশিরভাগ বিশ্ববিদ্যালয়ের মতো। প্রয়োজন হলে 'Custom scale' থেকে নিজের বিশ্ববিদ্যালয়ের নিয়ম সেট করে নিতে পারবেন।",
      },
      {
        question: "মার্ক থেকে গ্রেড কীভাবে বের হবে?",
        answer:
          "প্রতিটি সাবজেক্টে মার্ক লিখে 'From marks' বাটন চাপলে অ্যাপ নিজে গ্রেড নির্ধারণ করে দেয় — আপনি চাইলে হাতেও বদলে দিতে পারেন।",
      },
    ],
    related: ["study-planner", "exam-countdown", "assignment-planner"],
  },
  {
    slug: "study-planner",
    name: "Study Planner",
    nameBn: "স্টাডি প্ল্যানার",
    tagline: "পড়ার রুটিন তৈরি করুন",
    description:
      "বিষয় অনুযায়ী পড়ার সময় ভাগ করুন, আজকের কাজ ও ডেডলাইন দেখুন এবং কতটা শেষ হলো তার হিসাব রাখুন।",
    category: "student",
    icon: "CalendarClock",
    accent: "rose",
    weight: 80,
    requiresSave: true,
    keywords: [
      "study",
      "study plan",
      "routine",
      "revision",
      "schedule",
      "porasonha",
    ],
    keywordsBn: ["পড়ার পরিকল্পনা", "স্টাডি", "রুটিন", "রিভিশন", "সময়সূচি"],
    seoTitle: "Free Study Planner Bangladesh — পড়ার পরিকল্পনা",
    seoDescription:
      "বিনামূল্যে study planner। বিষয়ভিত্তিক পড়ার সময় বাড়ান, আজকের কাজ ও ডেডলাইন দেখুন, অগ্রগতির হিসাব রাখুন।",
    tips: [
      "প্রতিটি বসায় ৪৫ মিনিট পড়ে ১০ মিনিট বিরতি নিন — এতে মন বসে থাকে।",
      "কঠিন বিষয়গুলো দিনের শুরুতে রাখুন, তখন মস্তিষ্ক সতেজ থাকে।",
      "সাপ্তাহিক ছুটির দিন রিভিশনের জন্য রাখুন, শুধু নতুন টপিক পড়বেন না।",
    ],
    faq: [
      {
        question: "কত সময় পড়া উচিত?",
        answer:
          "এটি নির্ভর করে পরীক্ষার তারিখ ও বিষয়ের উপর। সাধারণ নিয়মে — প্রতিদিন ২-৪ ঘণ্টা নিয়মিত পড়া এক বছরের জন্য এক মাসের চেষ্টার চেয়ে অনেক ভালো।",
      },
    ],
    related: ["cgpa-calculator", "exam-countdown", "to-do-planner"],
  },
  {
    slug: "exam-countdown",
    name: "Exam Countdown",
    nameBn: "পরীক্ষার কাউন্টডাউন",
    tagline: "কত দিন বাকি, কী পড়বেন",
    description:
      "পরীক্ষার তারিখ দিন, বাকি দিন ও প্রস্তুতির অগ্রগতি দেখুন। প্রতিটি পরীক্ষার জন্য আলাদা টাস্ক তালিকা রাখুন।",
    category: "student",
    icon: "Timer",
    accent: "rose",
    weight: 78,
    keywords: [
      "exam",
      "countdown",
      "schedule",
      "exam date",
      "preparation",
      "pariksha",
    ],
    keywordsBn: ["পরীক্ষা", "কাউন্টডাউন", "পরীক্ষার তারিখ", "প্রস্তুতি"],
    seoTitle: "Free Exam Countdown Bangladesh — পরীক্ষার কাউন্টডাউন",
    seoDescription:
      "বিনামূল্যে exam countdown। পরীক্ষার তারিখ ও প্রস্তুতির অগ্রগতি ট্র্যাক করুন, প্রতিটি পরীক্ষার জন্য আলাদা প্রস্তুতি তালিকা রাখুন।",
    tips: [
      "১০ দিনের কম বাকি থাকলে প্রতিদিন ৩-৪ বিষয় ভাগ করে পড়ুন — শেষ দিকে সব একসাথে পড়া যায় না।",
      "পরীক্ষার পরের দিনের জন্যও একটি ছোট পরিকল্পনা রাখুন — মাঝের দিনটা নষ্ট হয় না।",
    ],
    faq: [
      {
        question: "একাধিক পরীক্ষার তারিখ দেওয়া যাবে?",
        answer:
          "হ্যাঁ, যত খুশি পরীক্ষা যোগ করা যায়। প্রতিটির আলাদা টাস্ক তালিকা ও অগ্রগতির হিসাব থাকে।",
      },
    ],
    related: ["study-planner", "cgpa-calculator", "assignment-planner"],
  },
  {
    slug: "assignment-planner",
    name: "Assignment Planner",
    nameBn: "অ্যাসাইনমেন্ট প্ল্যানার",
    tagline: "ডেডলাইন ছাড়াবেন না",
    description:
      "অ্যাসাইনমেন্টের ধাপে ধাপে কাজ (রিসার্চ, ড্রাফট, রিভিশন, জমা) ভাগ করুন, ডেডলাইন ও অগ্রগতি দেখুন।",
    category: "student",
    icon: "ClipboardCheck",
    accent: "rose",
    weight: 76,
    keywords: ["assignment", "deadline", "project", "submission", "thesis"],
    keywordsBn: ["অ্যাসাইনমেন্ট", "অ্যাসাইন্ট", "ডেডলাইন", "প্রজেক্ট", "জমা"],
    seoTitle:
      "Free Assignment Planner Bangladesh — অ্যাসাইনমেন্ট ও ডেডলাইন প্ল্যানার",
    seoDescription:
      "বিনামূল্যে assignment planner। রিসার্চ, ড্রাফট, রিভিশন ও জমা — ধাপে ধাপে ডেডলাইন পরিকল্পনা করুন এবং অগ্রগতি দেখুন।",
    tips: [
      "ডেডলাইনের ২-৩ দিন আগেই ড্রাফট শেষ করে ফেলুন — শেষ দিনের চাপ এড়ানোর সবচেয়ে কার্যকর উপায়।",
      "রিসার্চের উপর থেকেই ফাইল নাম ঠিক করে নিন, পরে খুঁজতে সময় লাগে।",
      "প্রতিটি ধাপে একটি ছোট চেকলিস্ট রাখলে কোনো অংশ বাদ পড়ে যায় না।",
    ],
    faq: [
      {
        question: "অনেকগুলো অ্যাসাইনমেন্ট একসাথে হলে কী করব?",
        answer:
          "সবচেয়ে কাছের ডেডলাইন আগে, তারপর সবচেয়ে বেশি নম্বরের অ্যাসাইনমেন্ট — এই ক্রমে সাজান। প্ল্যানার স্বয়ংক্রিয়ভাবে ডেডলাইন অনুযায়ী সাজিয়ে দেখায়।",
      },
    ],
    related: ["study-planner", "exam-countdown", "to-do-planner"],
  },
];

/* ---------------------------------------------------------------- helpers */

export const TOOL_BY_SLUG: Record<string, ToolDefinition> = Object.fromEntries(
  TOOLS.map((tool) => [tool.slug, tool]),
);

export const CATEGORY_BY_SLUG: Record<string, CategoryDefinition> =
  Object.fromEntries(CATEGORIES.map((category) => [category.slug, category]));

export const POPULAR_TOOLS: ToolDefinition[] = TOOLS.filter(
  (tool) => tool.popular,
).sort((a, b) => b.weight - a.weight);

export const FEATURED_TOOLS: ToolDefinition[] = TOOLS.filter(
  (tool) => tool.featured,
).sort((a, b) => b.weight - a.weight);

export function toolsByCategory(slug: string): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.category === slug).sort(
    (a, b) => b.weight - a.weight,
  );
}

export function relatedTools(slug: string): ToolDefinition[] {
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) return [];
  const explicit = tool.related
    .map((related) => TOOL_BY_SLUG[related])
    .filter(Boolean);
  if (explicit.length >= 3) return explicit.slice(0, 3);
  const fallback = TOOLS.filter(
    (candidate) =>
      candidate.category === tool.category && candidate.slug !== slug,
  );
  return [...explicit, ...fallback].slice(0, 3);
}

/** Hero input placeholder suggestions, rotated on the client. */
export const SEARCH_EXAMPLES = [
  "এই মাসের খরচ কিভাবে ভাগ করব?",
  "একটা CV বানাতে চাই",
  "আমার trip-এর budget কত হতে পারে?",
  "একটা invoice বানাতে চাই",
  "CGPA হিসাব করতে চাই",
];

export const AI_ASSISTANT_EXAMPLES = [
  "আমার মাসিক budget বানাতে চাই",
  "আমার CV তৈরি করতে চাই",
  "Trip-এর খরচ হিসাব করতে চাই",
  "একটা invoice বানাতে চাই",
  "ব্যাংক লোনের EMI বের করতে চাই",
];
