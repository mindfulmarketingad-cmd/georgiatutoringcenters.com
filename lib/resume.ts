/**
 * Resume builder data model.
 *
 * Everything here runs in the visitor's browser. The builder never posts an
 * answer anywhere: the only persistence is localStorage on the visitor's own
 * device, so names, phone numbers and employment history stay with them.
 */

export type Job = {
  id: string;
  title: string;
  employer: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  duties: string;
};

export type School = {
  id: string;
  credential: string;
  school: string;
  location: string;
  year: string;
  detail: string;
};

export type ResumeData = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  jobs: Job[];
  skills: string;
  schools: School[];
  summary: string;
};

export const emptyJob = (id: string): Job => ({
  id,
  title: "",
  employer: "",
  location: "",
  start: "",
  end: "",
  current: false,
  duties: "",
});

export const emptySchool = (id: string): School => ({
  id,
  credential: "",
  school: "",
  location: "",
  year: "",
  detail: "",
});

/**
 * Fixed ids so the server render and the first browser render agree. Rows
 * added later are only ever created in the browser.
 */
export const emptyResume = (): ResumeData => ({
  firstName: "",
  lastName: "",
  jobTitle: "",
  email: "",
  phone: "",
  linkedin: "",
  jobs: [emptyJob("job-1")],
  skills: "",
  schools: [emptySchool("school-1")],
  summary: "",
});

/* ------------------------------------------------------------------ steps */

export type StepKind = "text" | "jobs" | "skills" | "schools" | "summary";

export type Step = {
  key: string;
  kind: StepKind;
  /** The question itself, phrased the way a person would ask it. */
  question: string;
  /** Short field name for the form label, so the heading is not repeated. */
  label?: string;
  help: string;
  field?: keyof ResumeData;
  inputType?: "text" | "email" | "tel" | "url";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

export const steps: Step[] = [
  {
    key: "first-name",
    kind: "text",
    field: "firstName",
    question: "What is your first name?",
    label: "First name",
    help: "Use the name you want an employer to call you, not a nickname.",
    inputType: "text",
    placeholder: "Jordan",
    autoComplete: "given-name",
    required: true,
  },
  {
    key: "last-name",
    kind: "text",
    field: "lastName",
    question: "And your last name?",
    label: "Last name",
    help: "Your first and last name together become the heading of the resume.",
    inputType: "text",
    placeholder: "Ellis",
    autoComplete: "family-name",
    required: true,
  },
  {
    key: "job-title",
    kind: "text",
    field: "jobTitle",
    question: "What job title are you going for?",
    label: "Desired job title",
    help: "Match the wording in the posting you are applying to. It sits under your name and tells a reader in one line what this resume is for.",
    inputType: "text",
    placeholder: "Math Tutor",
    autoComplete: "organization-title",
    required: true,
  },
  {
    key: "email",
    kind: "text",
    field: "email",
    question: "What email address should employers use?",
    label: "Email address",
    help: "Use an address you check daily. A plain firstname.lastname address reads better than an old school or gaming handle.",
    inputType: "email",
    placeholder: "jordan.ellis@example.com",
    autoComplete: "email",
    required: true,
  },
  {
    key: "phone",
    kind: "text",
    field: "phone",
    question: "What phone number should they call?",
    label: "Phone number",
    help: "Optional, but most hiring managers reach for the phone first. Make sure the voicemail on it is set up.",
    inputType: "tel",
    placeholder: "(404) 555-0134",
    autoComplete: "tel",
  },
  {
    key: "linkedin",
    kind: "text",
    field: "linkedin",
    question: "Do you have a LinkedIn profile?",
    label: "LinkedIn profile",
    help: "Optional. Paste the full address of your profile, or leave this blank and skip ahead.",
    inputType: "url",
    placeholder: "linkedin.com/in/jordanellis",
    autoComplete: "url",
  },
  {
    key: "employment",
    kind: "jobs",
    question: "Where have you worked?",
    help: "Start with your most recent role and work backwards. Tutoring, camp counseling, retail and volunteer work all count, especially early on.",
  },
  {
    key: "skills",
    kind: "skills",
    question: "What are you good at?",
    help: "List the skills a person in this job actually needs. One per line, or separated by commas.",
  },
  {
    key: "education",
    kind: "schools",
    question: "What is your education?",
    help: "Degrees, certificates, licenses and coursework in progress. If you are still in school, say the year you expect to finish.",
  },
  {
    key: "summary",
    kind: "summary",
    question: "How would you sum yourself up?",
    help: "Two or three sentences at the top of the resume: who you are, what you do well and what you are looking for. Write it last, when everything else is on the page.",
  },
];

/* -------------------------------------------------------------- templates */

export type TemplateKey = "classic" | "modern" | "minimal" | "executive" | "compact";

export type Template = {
  key: TemplateKey;
  name: string;
  blurb: string;
  best: string;
  /**
   * Single-column layouts survive automated applicant tracking systems far
   * better than sidebars do, so the picker says which is which rather than
   * leaving it to chance.
   */
  atsSafe: boolean;
};

export const templates: Template[] = [
  {
    key: "classic",
    name: "Classic",
    blurb: "Serif type, a centered name and ruled section headings.",
    best: "Schools, districts, government and anywhere conservative.",
    atsSafe: true,
  },
  {
    key: "modern",
    name: "Modern",
    blurb: "Clean sans-serif with a green rule under your name.",
    best: "Tutoring centers, startups and most private employers.",
    atsSafe: true,
  },
  {
    key: "minimal",
    name: "Minimal",
    blurb: "No rules or shading. Generous white space, text only.",
    best: "Design-conscious employers and very short resumes.",
    atsSafe: true,
  },
  {
    key: "executive",
    name: "Executive",
    blurb: "Two columns, with contact details and skills in a sidebar.",
    best: "Print and email. Avoid it for large online application portals.",
    atsSafe: false,
  },
  {
    key: "compact",
    name: "Compact",
    blurb: "Tighter type and spacing to keep a long history on one page.",
    best: "Ten or more years of work to fit in a single page.",
    atsSafe: true,
  },
];

/* ----------------------------------------------------------------- helpers */

export const fullName = (data: ResumeData) =>
  [data.firstName, data.lastName].filter(Boolean).join(" ").trim();

export const skillList = (skills: string) =>
  skills
    .split(/[\n,;]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);

export const bulletList = (duties: string) =>
  duties
    .split("\n")
    .map((line) => line.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean);

export const dateRange = (job: Job) => {
  const end = job.current ? "Present" : job.end.trim();
  return [job.start.trim(), end].filter(Boolean).join(" – ");
};

export const hasJob = (job: Job) =>
  Boolean(job.title.trim() || job.employer.trim() || job.duties.trim());

export const hasSchool = (school: School) =>
  Boolean(school.credential.trim() || school.school.trim());

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());

/** Strips a scheme and www. so a long profile URL prints as a short one. */
export const tidyUrl = (value: string) =>
  value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");

/**
 * A starter professional summary assembled from the answers already given.
 * It is a first draft to edit, not a finished sentence, and the builder says
 * so where it is offered.
 */
export function draftSummary(data: ResumeData): string {
  const role = data.jobTitle.trim() || "candidate";
  const skills = skillList(data.skills).slice(0, 3);
  const employers = data.jobs.filter(hasJob).map((job) => job.employer.trim()).filter(Boolean);

  const opening = employers.length
    ? `${role} with experience at ${employers.slice(0, 2).join(" and ")}.`
    : `${role} looking for a role where I can do more of the work I am good at.`;
  // Skills and job titles are printed as the visitor typed them: lowercasing
  // would turn "Algebra I and II" into "algebra i and ii".
  const middle = skills.length ? ` Strongest in ${skills.join(", ")}.` : "";
  const close = ` Looking for a ${role} position where that experience is useful from day one.`;

  return `${opening.charAt(0).toUpperCase()}${opening.slice(1)}${middle}${close}`;
}

/* ------------------------------------------------------- existing resumes */

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]{2,24}/;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_-]{2,60}/i;
const NAME_RE = /^[A-Za-z][A-Za-z'.-]*(?:\s+[A-Za-z][A-Za-z'.-]*){1,3}$/;

const SECTION_ALIASES: Record<string, string[]> = {
  summary: ["professional summary", "summary", "profile", "objective", "about me"],
  skills: ["skills", "core skills", "key skills", "technical skills", "areas of expertise"],
};

function sectionBody(lines: string[], aliases: string[]): string {
  const index = lines.findIndex((line) => {
    const clean = line.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    return aliases.includes(clean);
  });
  if (index === -1) return "";
  const body: string[] = [];
  for (const line of lines.slice(index + 1)) {
    const clean = line.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    const isHeading = clean.length > 0 && clean.length < 34 && line === line.toUpperCase();
    if (isHeading && body.length) break;
    if (body.length >= 8) break;
    body.push(line);
  }
  return body.join("\n").trim();
}

/** Longest text an upload is read from, so a pasted novel cannot stall the tab. */
export const MAX_PASTE = 20_000;

/**
 * Pulls what it can recognize out of a resume the visitor pastes in. This is
 * pattern matching, not comprehension: the builder walks the visitor through
 * every answer afterwards so they can correct whatever it got wrong.
 */
export function parseExistingResume(text: string): Partial<ResumeData> {
  const source = text.slice(0, MAX_PASTE);
  const lines = source
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const found: Partial<ResumeData> = {};

  const email = source.match(EMAIL_RE)?.[0];
  if (email) found.email = email;

  const linkedin = source.match(LINKEDIN_RE)?.[0];
  if (linkedin) found.linkedin = tidyUrl(linkedin);

  // Run the phone pattern on text with the email removed, so the digits in an
  // address like jordan1994@example.com are never read as a number.
  const phone = source.replace(EMAIL_RE, " ").match(PHONE_RE)?.[0];
  if (phone) found.phone = phone.trim();

  const nameIndex = lines.findIndex(
    (line) => NAME_RE.test(line) && line.split(/\s+/).length <= 4 && !/resume|curriculum/i.test(line)
  );
  if (nameIndex !== -1) {
    const parts = lines[nameIndex].split(/\s+/);
    found.firstName = parts[0];
    found.lastName = parts[parts.length - 1];

    // The line under the name is usually the job title. Two capitalized words
    // like "Reading Specialist" look exactly like a name, so the test is what
    // a title is not: contact details, a section heading in capitals, or the
    // name line repeated.
    const next = lines[nameIndex + 1];
    const isHeading = next === next?.toUpperCase();
    if (next && next.length <= 60 && !/[@\d]/.test(next) && !isHeading) {
      found.jobTitle = next;
    }
  }

  const summary = sectionBody(lines, SECTION_ALIASES.summary);
  if (summary) found.summary = summary;

  const skills = sectionBody(lines, SECTION_ALIASES.skills);
  if (skills) found.skills = skillList(skills).join("\n");

  return found;
}
