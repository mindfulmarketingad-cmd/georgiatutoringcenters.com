import {
  bulletList,
  dateRange,
  fullName,
  hasJob,
  hasSchool,
  skillList,
  templates,
  tidyUrl,
  type ResumeData,
  type TemplateKey,
} from "@/lib/resume";

/**
 * Plain-text version for pasting into an online application box, where
 * formatting is stripped anyway and a clean layout beats a styled one.
 */
export function resumeText(data: ResumeData): string {
  const out: string[] = [];
  const name = fullName(data);
  if (name) out.push(name.toUpperCase());
  if (data.jobTitle.trim()) out.push(data.jobTitle.trim());

  const contacts = [
    data.email.trim(),
    data.phone.trim(),
    data.linkedin.trim() ? tidyUrl(data.linkedin) : "",
  ].filter(Boolean);
  if (contacts.length) out.push(contacts.join(" | "));

  if (data.summary.trim()) {
    out.push("", "PROFESSIONAL SUMMARY", data.summary.trim());
  }

  const jobs = data.jobs.filter(hasJob);
  if (jobs.length) {
    out.push("", "EXPERIENCE");
    for (const job of jobs) {
      const dates = dateRange(job);
      out.push([job.title.trim(), dates].filter(Boolean).join(" | "));
      const place = [job.employer.trim(), job.location.trim()].filter(Boolean).join(", ");
      if (place) out.push(place);
      for (const bullet of bulletList(job.duties)) out.push(`- ${bullet}`);
      out.push("");
    }
  }

  const skills = skillList(data.skills);
  if (skills.length) out.push("SKILLS", skills.join(", "));

  const schools = data.schools.filter(hasSchool);
  if (schools.length) {
    out.push("", "EDUCATION");
    for (const school of schools) {
      out.push([school.credential.trim(), school.year.trim()].filter(Boolean).join(" | "));
      const place = [school.school.trim(), school.location.trim()].filter(Boolean).join(", ");
      if (place) out.push(place);
      if (school.detail.trim()) out.push(school.detail.trim());
      out.push("");
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** A file name that is safe on every platform. */
export function resumeFileName(data: ResumeData, extension: string): string {
  const base = fullName(data).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${(base || "resume").toLowerCase()}-resume.${extension}`;
}

/**
 * Word opens an HTML document with inline styles and keeps the formatting,
 * which gets a genuinely editable .doc out of the same content without a
 * document library. Word's CSS support is narrow, so this stays with the
 * properties it honors: fonts, sizes, weights, borders and table layout.
 */
export function resumeDoc(data: ResumeData, template: TemplateKey): string {
  const serif = template === "classic";
  const font = serif ? "Georgia, 'Times New Roman', serif" : "Calibri, Arial, sans-serif";
  const accent = template === "modern" || template === "executive" ? "#2e6b34" : "#1d1d1d";
  const centered = serif ? "center" : "left";
  const rule = template === "minimal" ? "none" : `1px solid ${template === "classic" ? "#8a8a8a" : "#cfcfcf"}`;
  const bodySize = template === "compact" ? "10pt" : "11pt";

  const name = fullName(data) || "Your Name";
  const contacts = [
    data.email.trim(),
    data.phone.trim(),
    data.linkedin.trim() ? tidyUrl(data.linkedin) : "",
  ].filter(Boolean);

  const heading = (text: string) =>
    `<p style="font-size:10pt;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${accent};border-bottom:${rule};padding-bottom:3pt;margin:14pt 0 6pt;">${escape(text)}</p>`;

  const parts: string[] = [
    `<p style="font-size:${template === "compact" ? "18pt" : "21pt"};font-weight:bold;margin:0;text-align:${centered};${serif ? "letter-spacing:2px;text-transform:uppercase;" : ""}">${escape(name)}</p>`,
  ];

  if (data.jobTitle.trim()) {
    parts.push(
      `<p style="font-size:12pt;font-weight:bold;color:#555;margin:2pt 0 0;text-align:${centered};">${escape(data.jobTitle.trim())}</p>`
    );
  }
  if (contacts.length) {
    parts.push(
      `<p style="font-size:10pt;color:#555;margin:6pt 0 0;text-align:${centered};">${contacts.map(escape).join(" &nbsp;|&nbsp; ")}</p>`
    );
  }

  if (data.summary.trim()) {
    parts.push(heading("Professional Summary"));
    for (const line of data.summary.trim().split("\n")) {
      parts.push(`<p style="margin:0 0 5pt;">${escape(line)}</p>`);
    }
  }

  const jobs = data.jobs.filter(hasJob);
  if (jobs.length) {
    parts.push(heading("Experience"));
    for (const job of jobs) {
      const dates = dateRange(job);
      parts.push(
        `<p style="margin:0;"><b>${escape(job.title.trim() || "Role")}</b>${dates ? `<span style="color:#555;"> &nbsp;&mdash;&nbsp; ${escape(dates)}</span>` : ""}</p>`
      );
      const place = [job.employer.trim(), job.location.trim()].filter(Boolean).join(", ");
      if (place) {
        parts.push(`<p style="margin:0 0 3pt;color:#555;font-style:italic;">${escape(place)}</p>`);
      }
      const bullets = bulletList(job.duties);
      if (bullets.length) {
        parts.push(
          `<ul style="margin:0 0 8pt;padding-left:18pt;">${bullets
            .map((bullet) => `<li style="margin:0 0 2pt;">${escape(bullet)}</li>`)
            .join("")}</ul>`
        );
      }
    }
  }

  const skills = skillList(data.skills);
  if (skills.length) {
    parts.push(heading("Skills"));
    parts.push(`<p style="margin:0;">${skills.map(escape).join(" &nbsp;&bull;&nbsp; ")}</p>`);
  }

  const schools = data.schools.filter(hasSchool);
  if (schools.length) {
    parts.push(heading("Education"));
    for (const school of schools) {
      parts.push(
        `<p style="margin:0;"><b>${escape(school.credential.trim() || "Credential")}</b>${school.year.trim() ? `<span style="color:#555;"> &nbsp;&mdash;&nbsp; ${escape(school.year.trim())}</span>` : ""}</p>`
      );
      const place = [school.school.trim(), school.location.trim()].filter(Boolean).join(", ");
      if (place) {
        parts.push(`<p style="margin:0;color:#555;font-style:italic;">${escape(place)}</p>`);
      }
      if (school.detail.trim()) {
        parts.push(`<p style="margin:0 0 6pt;">${escape(school.detail.trim())}</p>`);
      }
    }
  }

  return `<!doctype html><html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escape(name)}</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>@page{margin:0.6in;}body{font-family:${font};font-size:${bodySize};color:#1d1d1d;line-height:1.4;}</style></head><body>${parts.join("")}</body></html>`;
}

export const templateName = (key: TemplateKey) =>
  templates.find((entry) => entry.key === key)?.name ?? "Classic";
