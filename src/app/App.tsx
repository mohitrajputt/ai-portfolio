import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, useInView } from "motion/react";
import ChatWidget from "../components/chat/ChatWidget";
import {
  Github,
  Linkedin,
  Mail,
  Download,
  ArrowRight,
  Server,
  Database,
  Cloud,
  Cpu,
  BookOpen,
  Clock,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Activity,
  Layers,
  Globe,
  Zap,
  Shield,
  Tag,
  MapPin,
  TrendingUp,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "stories", label: "Stories" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

const EXPERIENCE = [
  {
    id: 1,
    company: "Regenesys Education",
    role: "Software Development Engineer@1",
    period: "May 2026 — present",
    location: "Bengaluru, India",
    color: "#22C55E",
    description:
      "Designed an end-to-end conversational AI pipeline connecting telephony, streaming STT, LLM inference, RAG retrieval, and TTS for real-time voice interactions.",
    tech: ["Python", "FastAPI", "RAG", "ChromaDB", "Gen & Agentic AI", "Langchain"],
    learnings: [
      "Optimized AI response latency through asynchronous processing, streaming pipelines, and efficient context retrieval.",
      "Built Retrieval-Augmented Generation (RAG) pipelines using vector databases and semantic search to enable context-aware responses from enterprise knowledge bases.",
      "Integrated Groq/OpenRouter-hosted LLMs with prompt orchestration and conversation memory for low-latency AI interactions",
    ],
  },
  {
    id: 2,
    company: "Tech Matpatra",
    role: "Software Development Engineer",
    period: "July 2024 — Apr 2026",
    location: "Gurugram, India",
    color: "#F97316",
    description:
      "Owned end-to-end feature development across frontend (React/TypeScript) and backend (NestJS, Node.js)",
    tech: ["Next.js", "Nest.js", "DynamoDB", "AWS Lambda", "Neo4j", "TypeScript", "Docker", "OpenSearch"],
    learnings: [
      "Owned end-to-end feature development across frontend (React/TypeScript) and backend (NestJS, Node.js)",
      "Designed and implemented backend services using REST APIs and microservice patterns",
      "Built serverless components on AWS (Lambda, DynamoDB), improving scalability and cost efficiency",
    ],
  },
  {
    id: 3,
    company: "Dabotics India",
    role: "Web Developer",
    period: "July 2023 — Sep 2023",
    location: "Remote",
    color: "var(--primary)",
    description:
      "Working on multiple projects, including a web application for managing drone operations and a real-time data visualization dashboard. Implemented user authentication, data storage, and API integrations to enhance functionality.",
    tech: ["Node.js", "Express.js", "MongoDB", "Git", "Postman", "EC2"],
    learnings: [
      " Enhanced overall application performance and usability by optimizing components and streamlining integration between frontend and backend.",
      "Collaborated with team members using Git/GitHub for version control and worked in Agile sprints with Jira to track progress and meet deadlines.",
      "Developed RESTful APIs with Node.js and Express.js, integrated MongoDB, and deployed applications on AWS EC2",
    ],
  },
];

const TECH_STACK: Record<string, { items: string[]; icon: React.ReactNode }> = {
  Backend: {
    items: ["Nest.js", "Python", "Node.js", "FastAPI", "WebSockets"],
    icon: <Server className="size-4" />,
  },
  "AI & ML": {
    items: ["LangChain", "OpenAI API", "Hugging Face", "PyTorch", "RAG", "Vector DBs", "Prompt Eng."],
    icon: <Cpu className="size-4" />,
  },
  Cloud: {
    items: ["AWS", "Docker", "Kubernetes", "Serverless", "CI/CD"],
    icon: <Cloud className="size-4" />,
  },
  Databases: {
    items: ["Redis", "Neo4j", "Elasticsearch", "ChromDB", "DynamoDB", "PostgreSQL"],
    icon: <Database className="size-4" />,
  },
  Architecture: {
    items: ["Microservices", "Event-Driven", "CAP Theorem"],
    icon: <Layers className="size-4" />,
  },
  Frontend: {
    items: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    icon: <Globe className="size-4" />,
  },
};

const STORIES = [
  {
    id: 1,
    title: "Rebuilding the Settlement Engine at Scale",
    context: "Distributed Systems",
    tags: ["Go", "PostgreSQL", "Kafka"],
    readTime: "12 min",
    problem:
      "Legacy reconciliation system processing 50M daily transactions was causing 3-hour delays in merchant settlements, losing Razorpay ₹2Cr/month in float.",
    excerpt:
      "When every second of delay has a dollar cost, you learn to think in microseconds. Here is how we rebuilt the settlement engine without taking the system offline.",
  },
  {
    id: 2,
    title: "Building a RAG System for Internal Knowledge",
    context: "AI Engineering",
    tags: ["Python", "LangChain", "Vector DBs", "OpenAI"],
    readTime: "9 min",
    problem:
      "Engineers spent 40% of their time searching internal wikis and Slack history for answers that already existed somewhere in the organization.",
    excerpt:
      "Retrieval-Augmented Generation sounds elegant in papers. In production, the devil lives in chunking strategies, embedding drift, and hallucination guardrails.",
  },
  {
    id: 3,
    title: "Designing an Event-Driven Notification System",
    context: "System Design",
    tags: ["Node.js", "Kafka", "DynamoDB", "AWS"],
    readTime: "15 min",
    problem:
      "Postman's alert system was a monolith running CRON jobs. It couldn't scale past 100K monitored endpoints without significant latency degradation.",
    excerpt:
      "How we moved from polling to streaming and reduced notification latency from 8 minutes to under 4 seconds for 20 million developers.",
  },
];

const BLOG_POSTS = [
  {
    id: 1,
    title: "Why I Stopped Using Progress Bars in Technical Interviews",
    date: "Jun 18, 2025",
    readTime: "6 min",
    tags: ["Career", "Engineering"],
    excerpt:
      "Progress bars signal confidence, not capability. Here is what I look for instead when evaluating backend engineers.",
  },
  {
    id: 2,
    title: "CAP Theorem Is Not a Theorem You Follow. It Is One You Navigate.",
    date: "May 30, 2025",
    readTime: "10 min",
    tags: ["System Design", "Databases"],
    excerpt:
      "Every distributed database decision is a CAP tradeoff. Most engineers understand the theory. Few understand the operational reality.",
  },
  {
    id: 3,
    title: "The Hidden Cost of Microservices Nobody Talks About",
    date: "Apr 22, 2025",
    readTime: "8 min",
    tags: ["Architecture", "Engineering"],
    excerpt:
      "We migrated to microservices and it took 18 months to recover. Here is the honest accounting of what went wrong.",
  },
  {
    id: 4,
    title: "From Prompt Engineering to Prompt Architecture",
    date: "Mar 15, 2025",
    readTime: "11 min",
    tags: ["AI", "LLMs"],
    excerpt:
      "Structuring LLM prompts for production systems requires the same discipline as designing APIs. Here is the framework I use.",
  },
];

const TERMINAL_LINES = [
  { text: "$ whoami", delay: 0, type: "cmd" as const },
  { text: "mohit.rajput — Backend & AI Engineer", delay: 550, type: "out" as const },
  { text: "$ cat expertise.txt", delay: 1300, type: "cmd" as const },
  { text: "distributed systems, API design, AI infra", delay: 1900, type: "out" as const },
  { text: "$ echo $PHILOSOPHY", delay: 2700, type: "cmd" as const },
  { text: '"Build to understand. Share what you learn."', delay: 3300, type: "out" as const },
  { text: "$ █", delay: 4100, type: "cursor" as const },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-12">
      <span
        className="text-xs font-mono tracking-[0.2em] uppercase"
        style={{ color: "var(--primary)" }}
      >
        {children}
      </span>
      <div className="h-px flex-1 max-w-[3rem]" style={{ background: "var(--border-soft)" }} />
    </div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [lines, setLines] = useState<typeof TERMINAL_LINES>([]);

  useEffect(() => {
    const timers = TERMINAL_LINES.map((line) =>
      setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, line.delay + 600)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(59,130,246,0.13) 0%, transparent 70%)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(transparent, var(--background))" }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-12 lg:items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {/* Status */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 border"
                style={{
                  borderColor: "var(--border-soft)",
                  background: "var(--hover-bg)",
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: "#22C55E",
                    boxShadow: "0 0 6px #22C55E",
                  }}
                />
                <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                  Ready for the Next Level · Remote-first
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.02] tracking-tight mb-6"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                <span className="text-foreground">Mohit</span>
                <br />
                <span style={{ color: "var(--hero-faded)" }}>Rajput</span>
              </h1>

              <p className="text-lg md:text-xl leading-relaxed mb-3 max-w-lg" style={{ color: "var(--text-secondary)" }}>
                Backend & AI Engineer. I design systems that don&#39;t just work at scale&nbsp;—
                they{" "}
                <em className="not-italic text-foreground font-medium">stay honest</em> under pressure.
              </p>

              <p className="text-sm mb-10 font-mono" style={{ color: "var(--muted-foreground)" }}>
                2+ years · Regenesys Education · Tech Matpatra 
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-14">
                <a
                  href="#stories"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all hover:gap-3"
                  style={{ background: "var(--primary)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background = "var(--primary-hover)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.background = "var(--primary)")
                  }
                >
                  Read Engineering Stories <ArrowRight className="size-4" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "var(--foreground)";
                    el.style.borderColor = "var(--border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "var(--text-secondary)";
                    el.style.borderColor = "var(--border-strong)";
                  }}
                >
                  Get in touch
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                {[
                  { value: "50M+", label: "Daily transactions" },
                  { value: "3", label: "Companies" },
                  { value: "2+", label: "Years backend" },
                  { value: "20M+", label: "Users impacted" },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-2xl font-bold text-foreground"
                      style={{ fontFamily: "'Geist', sans-serif" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="hidden lg:block mt-12 lg:mt-0"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid var(--border-soft)",
                background: "var(--terminal-bg)",
                backdropFilter: "blur(20px)",
                boxShadow: "var(--terminal-shadow)",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid var(--border-soft)" }}
              >
                <div className="size-3 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
                <div className="size-3 rounded-full" style={{ background: "rgba(234,179,8,0.6)" }} />
                <div className="size-3 rounded-full" style={{ background: "rgba(34,197,94,0.6)" }} />
                <span className="ml-2 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                  zsh — ~/workspace
                </span>
              </div>
              {/* Content */}
              <div className="p-5 font-mono text-sm space-y-1.5 min-h-[220px]">
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      color:
                        line.type === "cmd"
                          ? "var(--foreground)"
                          : line.type === "cursor"
                            ? "var(--primary)"
                            : "var(--text-secondary)",
                    }}
                    className={line.type === "cursor" ? "animate-pulse" : ""}
                  >
                    {line.text}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                border: "1px solid var(--primary-soft-border)",
                background: "var(--primary-soft-bg)",
              }}
            >
              <div className="size-2 rounded-full" style={{ background: "var(--primary)" }} />
              <span className="text-xs font-mono" style={{ color: "var(--primary-text)" }}>
                Currently building AI infra at Regenesys Education
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

function AboutSection() {
  const principles = [
    {
      icon: <Shield className="size-4" />,
      title: "Systems over syntax",
      body: "Technology choices are consequences of constraints. I start with the problem, not the tool.",
    },
    {
      icon: <TrendingUp className="size-4" />,
      title: "Make it boring",
      body: "The most reliable systems are the most predictable ones. Cleverness is a liability at 3am.",
    },
    {
      icon: <BookOpen className="size-4" />,
      title: "Public learning",
      body: "Writing about what I build sharpens my own thinking. Every post is a second draft of an architecture.",
    },
    {
      icon: <Zap className="size-4" />,
      title: "Instrument everything",
      body: "You cannot reason about systems you cannot observe. Observability is a precondition, not a feature.",
    },
  ];

  return (
    <section id="about" className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
      <FadeIn>
        <SectionLabel>About</SectionLabel>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <FadeIn>
            <h2
              className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-8"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
              I don&#39;t just write code.
              <br />
              <span style={{ color: "var(--heading-faded)" }}>I interrogate systems.</span>
            </h2>
          </FadeIn>

          {[
            "I spent the first year of my career obsessed with syntax and frameworks. Then a production outage at 2am taught me something no documentation had: systems fail in the gaps between what was documented and what was assumed.",
            "Since then, my approach has shifted. I spend more time in architecture reviews and postmortems than I do in feature PRs. The most important engineering decisions are invisible to users — they live in consistency models, failure modes, and deployment strategies.",
            "This portfolio is a public record of that process. Not a highlight reel — a working journal. The hard decisions, the wrong turns, the things I'd do differently.",
          ].map((para, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <p className="leading-relaxed mb-5 text-[15px]" style={{ color: "var(--text-secondary)" }}>
                {para}
              </p>
            </FadeIn>
          ))}
        </div>

        <div className="space-y-3">
          {principles.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <div
                className="p-5 rounded-2xl transition-all group cursor-default"
                style={{
                  border: "1px solid var(--border-soft)",
                  background: "var(--card)",
                }}
                onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor =
                  "var(--border-hover)")
                }
                onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor =
                  "var(--border-soft)")
                }
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5" style={{ color: "var(--primary)" }}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm mb-1.5">{p.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      {p.body}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Experience ──────────────────────────────────────────────────────────────

function ExperienceSection() {
  const [activeId, setActiveId] = useState(1);
  const active = EXPERIENCE.find((e) => e.id === activeId)!;

  return (
    <section id="experience" className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
      <FadeIn>
        <SectionLabel>Experience</SectionLabel>
        <h2
          className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-16"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Where I&#39;ve worked
        </h2>
      </FadeIn>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Sidebar */}
        <div className="space-y-2">
          {EXPERIENCE.map((exp, i) => (
            <FadeIn key={exp.id} delay={i * 0.07}>
              <button
                onClick={() => setActiveId(exp.id)}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  border:
                    activeId === exp.id
                      ? "1px solid var(--border-strong)"
                      : "1px solid transparent",
                  background: activeId === exp.id ? "var(--card)" : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full shrink-0" style={{ background: exp.color }} />
                  <div>
                    <div className="text-foreground font-medium text-sm">{exp.company}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {exp.period}
                    </div>
                  </div>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>

        {/* Detail */}
        <FadeIn>
          <motion.div
            key={activeId}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="p-8 rounded-2xl"
            style={{ border: "1px solid var(--border-soft)", background: "var(--card)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h3
                  className="text-foreground font-bold text-xl"
                  style={{ fontFamily: "'Geist', sans-serif" }}
                >
                  {active.role}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {active.company}
                  </span>
                  <span style={{ color: "var(--text-faint)" }}>·</span>
                  <span
                    className="text-sm flex items-center gap-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <MapPin className="size-3" />
                    {active.location}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                {active.period}
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              {active.description}
            </p>

            <div className="mb-6">
              <div
                className="text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Technologies
              </div>
              <div className="flex flex-wrap gap-2">
                {active.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg text-xs"
                    style={{
                      background: "var(--chip-bg)",
                      border: "1px solid var(--border-soft)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div
                className="text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Key Learnings
              </div>
              <ul className="space-y-2.5">
                {active.learnings.map((l, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <ChevronRight className="size-4 mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Tech Stack ──────────────────────────────────────────────────────────────

function TechStackSection() {
  return (
    <section id="stack" className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
      <FadeIn>
        <SectionLabel>Tech Stack</SectionLabel>
        <h2
          className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Tools I trust in production
        </h2>
        <p className="max-w-xl mb-16 text-[15px]" style={{ color: "var(--text-secondary)" }}>
          No progress bars. No ratings. These are technologies I have shipped with, debugged in
          production, and would reach for again.
        </p>
      </FadeIn>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(TECH_STACK).map(([category, { items, icon }], i) => (
          <FadeIn key={category} delay={i * 0.06}>
            <div
              className="p-6 rounded-2xl h-full transition-all"
              style={{
                border: "1px solid var(--border-soft)",
                background: "var(--card)",
              }}
              onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "var(--border-strong)")
              }
              onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "var(--border-soft)")
              }
            >
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: "var(--primary)" }}>{icon}</span>
                <span className="text-foreground font-semibold text-sm">{category}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg text-xs transition-colors cursor-default"
                    style={{
                      background: "var(--chip-bg)",
                      border: "1px solid var(--chip-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ─── Engineering Stories ──────────────────────────────────────────────────────

function StoriesSection() {
  return (
    <section id="stories" className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
      <FadeIn>
        <SectionLabel>Engineering Stories</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-foreground leading-tight"
            style={{ fontFamily: "'Geist', sans-serif" }}
          >
            Real problems.
            <br />
            Honest decisions.
          </h2>
          <span className="text-sm hidden md:block" style={{ color: "var(--muted-foreground)" }}>
            Not a portfolio of demos.
          </span>
        </div>
      </FadeIn>

      <div className="space-y-5">
        {STORIES.map((story, i) => (
          <FadeIn key={story.id} delay={i * 0.09}>
            <div
              className="group p-8 rounded-2xl cursor-pointer transition-all"
              style={{
                border: "1px solid var(--border-soft)",
                background: "var(--card)",
              }}
              onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "var(--border-hover)")
              }
              onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "var(--border-soft)")
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                      {story.context}
                    </span>
                    <span style={{ color: "var(--text-faint)" }}>·</span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <Clock className="size-3" />
                      {story.readTime} read
                    </span>
                  </div>

                  <h3
                    className="font-bold text-xl mb-3 leading-snug transition-colors"
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      color: "var(--foreground)",
                    }}
                  >
                    {story.title}
                  </h3>

                  <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
                    <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                      Problem:{" "}
                    </span>
                    {story.problem}
                  </p>

                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {story.excerpt}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4 shrink-0">
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {story.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: "var(--chip-bg)",
                          border: "1px solid var(--chip-border)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    Read full story <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

function BlogSection() {
  return (
    <section id="blog" className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
      <FadeIn>
        <SectionLabel>Blog</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-foreground leading-tight"
            style={{ fontFamily: "'Geist', sans-serif" }}
          >
            Engineering notes
          </h2>
          <button
            className="hidden md:flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "var(--primary)" }}
          >
            All posts <ArrowRight className="size-4" />
          </button>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-5">
        {BLOG_POSTS.map((post, i) => (
          <FadeIn key={post.id} delay={i * 0.07}>
            <article
              className="group p-6 rounded-2xl cursor-pointer transition-all flex flex-col h-full"
              style={{
                border: "1px solid var(--border-soft)",
                background: "var(--card)",
              }}
              onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor =
                "var(--border-hover)")
              }
              onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor =
                "var(--border-soft)")
              }
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                  {post.date}
                </span>
                <span style={{ color: "var(--text-faint)" }}>·</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <Clock className="size-3" />
                  {post.readTime}
                </span>
              </div>

              <h3
                className="font-semibold text-lg mb-3 leading-snug flex-1 transition-colors"
                style={{ color: "var(--foreground)", fontFamily: "'Geist', sans-serif" }}
              >
                {post.title}
              </h3>

              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--muted-foreground)" }}>
                {post.excerpt}
              </p>

              <div className="flex gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg text-xs flex items-center gap-1"
                    style={{
                      background: "var(--chip-bg)",
                      border: "1px solid var(--chip-border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <Tag className="size-3" />
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function ContactSection() {
  const links = [
    { icon: <Linkedin className="size-5" />, label: "LinkedIn", handle: "/in/mohit-rajputt", link: "https://www.linkedin.com/in/mohit-rajputt/" },
    { icon: <Github className="size-5" />, label: "GitHub", handle: "@mohitrajputt", link: "https://github.com/mohitrajputt" },
    { icon: <Mail className="size-5" />, label: "Email", handle: "999mohitrajput@gmail.com", link: "mailto:999mohitrajput@gmail.com" },
    { icon: <Download className="size-5" />, label: "Resume", handle: "Download PDF", link: "https://www.overleaf.com/read/tmshwywqfbkk#1b8794" },
  ];

  return (
    <section id="contact" className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
      <div className="max-w-2xl">
        <FadeIn>
          <SectionLabel>Contact</SectionLabel>
          <h2
            className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6"
            style={{ fontFamily: "'Geist', sans-serif" }}
          >
            Let&#39;s build something
            <br />
            <span style={{ color: "var(--heading-faded-strong)" }}>worth understanding.</span>
          </h2>
          <p className="leading-relaxed mb-12 text-[15px]" style={{ color: "var(--text-secondary)" }}>
            I am open to senior backend and AI infrastructure roles. If you are building something
            technically interesting and care about engineering culture, I&#39;d like to hear about it.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {links.map((link) => (
              <button
                key={link.label}
                className="flex flex-col items-center gap-2.5 p-5 rounded-2xl transition-all"
                style={{
                  border: "1px solid var(--border-soft)",
                  background: "var(--card)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "var(--border-hover)";
                  el.style.background = "var(--hover-bg)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "var(--border-soft)";
                  el.style.background = "var(--card)";
                }}
                onClick={() => window.open(link.link, "_blank")}
              >
                <span style={{ color: "var(--text-secondary)" }}>{link.icon}</span>
                <span className="text-foreground text-sm font-medium">{link.label}</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {link.handle}
                </span>
              </button>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Theme Toggle ────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark / light theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center justify-center p-2 rounded-xl transition-all"
      style={{
        color: "var(--text-secondary)",
        border: "1px solid var(--border-soft)",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "var(--border-hover)";
        el.style.color = "var(--foreground)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "var(--border-soft)";
        el.style.color = "var(--text-secondary)";
      }}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? doc.scrollTop / total : 0);

      const ids = NAV_ITEMS.map((n) => n.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 130) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${scrollProgress * 100}%`,
            background: "linear-gradient(90deg, var(--primary), #60A5FA)",
          }}
        />
      </div>

      {/* Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo("home")}
            className="font-bold text-sm tracking-tight text-foreground"
            style={{ fontFamily: "'Geist', sans-serif" }}
          >
            MR<span style={{ color: "var(--primary)" }}>.</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3.5 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  color: activeSection === item.id ? "var(--foreground)" : "var(--text-secondary)",
                  background:
                    activeSection === item.id ? "var(--border-soft)" : "transparent",
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => scrollTo("contact")}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-all"
              style={{ background: "var(--primary)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")
              }
            >
              Hire me
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="md:hidden px-6 py-4"
            style={{
              borderTop: "1px solid var(--border-soft)",
              background: "var(--mobile-bg)",
              backdropFilter: "blur(20px)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="w-full text-left py-3 text-sm transition-colors"
                style={{
                  borderBottom: "1px solid var(--chip-bg)",
                  color: activeSection === item.id ? "var(--foreground)" : "var(--text-secondary)",
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </header>

      {/* Main */}
      <main>
        <HeroSection />
        <div style={{ borderTop: "1px solid var(--chip-bg)" }} />
        <AboutSection />
        <div style={{ borderTop: "1px solid var(--chip-bg)" }} />
        <ExperienceSection />
        <div style={{ borderTop: "1px solid var(--chip-bg)" }} />
        <TechStackSection />
        <div style={{ borderTop: "1px solid var(--chip-bg)" }} />
        <StoriesSection />
        <div style={{ borderTop: "1px solid var(--chip-bg)" }} />
        <BlogSection />
        <div style={{ borderTop: "1px solid var(--chip-bg)" }} />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer
        className="py-8 px-6 lg:px-12"
        style={{ borderTop: "1px solid var(--chip-bg)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>
            © 2025 Mohit Rajput. Built with intention.
          </span>
          <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>
            Last updated · Jul 2025
          </span>
        </div>
      </footer>

      {/* AI Portfolio Assistant */}
      <ChatWidget />
    </div>
  );
}
