// ─────────────────────────────────────────────────────────────────────────────
// Assembles the assistant's system message from the "single source of truth"
// portfolio data (src/data/portfolio/*.json) and the dedicated system prompt
// (api/prompts/systemPrompt.ts).
// ─────────────────────────────────────────────────────────────────────────────
// @ts-nocheck — the JSON modules are plain data; dynamic access is intended.

import profile from "../../src/data/portfolio/profile.json";
import experience from "../../src/data/portfolio/experience.json";
import projects from "../../src/data/portfolio/projects.json";
import skills from "../../src/data/portfolio/skills.json";
import education from "../../src/data/portfolio/education.json";
import achievements from "../../src/data/portfolio/achievements.json";
import contact from "../../src/data/portfolio/contact.json";
import { SYSTEM_PROMPT_TEMPLATE } from "../prompts/systemPrompt";

export function buildKnowledge(): string {
  const lines: string[] = [];

  lines.push("## PROFILE");
  lines.push(`Name: ${profile.name}`);
  lines.push(`Title: ${profile.title}`);
  lines.push(`Tagline: ${profile.tagline}`);
  lines.push(`Years of experience: ${profile.yearsOfExperience}`);
  lines.push(`Availability: ${profile.availability}`);
  lines.push(`Expertise: ${profile.expertise.join(", ")}`);
  lines.push(`Location: ${profile.location}`);
  lines.push(`Philosophy: ${profile.philosophy}`);
  lines.push("About:");
  profile.about.forEach((p: string) => lines.push(`  - ${p}`));
  lines.push("Engineering principles:");
  profile.engineeringPrinciples.forEach(
    (p: { title: string; body: string }) => lines.push(`  - ${p.title}: ${p.body}`),
  );
  lines.push("Highlights:");
  profile.highlights.forEach((h: { value: string; label: string }) =>
    lines.push(`  - ${h.value} ${h.label}`),
  );

  lines.push("");
  lines.push("## EXPERIENCE");
  experience.forEach((e: Record<string, any>) => {
    lines.push(`- ${e.role} at ${e.company} (${e.period}, ${e.location})`);
    lines.push(`  Description: ${e.description}`);
    lines.push(`  Technologies: ${e.technologies.join(", ")}`);
    if (Array.isArray(e.details) && e.details.length) {
      lines.push(`  Key details: ${e.details.join(" | ")}`);
    }
  });

  lines.push("");
  lines.push("## SKILLS (by category)");
  Object.entries(skills.categories).forEach(([category, items]) => {
    lines.push(`- ${category}: ${(items as string[]).join(", ")}`);
  });

  lines.push("");
  lines.push("## PROJECTS");
  projects.forEach((p: Record<string, any>) => {
    lines.push(`- ${p.title} (${p.category})`);
    lines.push(`  Technologies: ${p.technologies.join(", ")}`);
    lines.push(`  Problem: ${p.problem}`);
    lines.push(`  Result/Summary: ${p.excerpt}`);
    if (p.link) lines.push(`  Link: ${p.link}`);
  });

  lines.push("");
  lines.push("## EDUCATION");
  if (Array.isArray(education) && education.length === 0) {
    lines.push("- No education information is currently provided in the portfolio.");
  } else {
    education.forEach((e: Record<string, any>) => {
      lines.push(`- ${e.degree} at ${e.institution} (${e.period})`);
    });
  }

  lines.push("");
  lines.push("## ACHIEVEMENTS / HIGHLIGHTS");
  if (Array.isArray(achievements) && achievements.length === 0) {
    lines.push("- No explicit achievements section is provided in the portfolio.");
  } else {
    (achievements as string[]).forEach((a) => lines.push(`- ${a}`));
  }

  lines.push("");
  lines.push("## CONTACT");
  lines.push(`Email: ${contact.email}`);
  lines.push(`LinkedIn: ${contact.linkedin}`);
  lines.push(`GitHub: ${contact.github}`);
  lines.push(`Resume: ${contact.resume}`);
  lines.push(`Note: ${contact.note}`);

  return lines.join("\n");
}

export function getSystemPrompt(): string {
  const knowledge = buildKnowledge();
  return SYSTEM_PROMPT_TEMPLATE.replaceAll("{{OWNER_NAME}}", profile.name).replaceAll(
    "{{KNOWLEDGE}}",
    knowledge,
  );
}
