"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import ResumePreview from "@/components/ResumePreview";
import ResumeDownload from "@/components/ResumeDownload";
import {
  MAX_PASTE,
  draftSummary,
  emptyJob,
  emptyResume,
  emptySchool,
  hasJob,
  hasSchool,
  isEmail,
  skillList,
  steps,
  templates,
  type ResumeData,
  type TemplateKey,
} from "@/lib/resume";

type Stage = "start" | "import" | "questions" | "templates" | "done";

const STORAGE_KEY = "gtc-resume-builder-v1";

type Saved = { data: ResumeData; template: TemplateKey; step: number; stage: Stage };

/**
 * localStorage read as an external store, so the saved draft reaches the
 * component without an effect writing state back on mount.
 */
function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

const readStorage = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/** Nothing is saved on the server, so the first render matches the markup. */
const noStorage = () => null;

function parseSaved(raw: string | null): Saved | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (!parsed.data || typeof parsed.data !== "object") return null;
    return {
      data: { ...emptyResume(), ...parsed.data },
      template: parsed.template ?? "classic",
      step: typeof parsed.step === "number" ? Math.min(Math.max(parsed.step, 0), steps.length - 1) : 0,
      stage: parsed.stage === "done" || parsed.stage === "templates" ? parsed.stage : "questions",
    };
  } catch {
    return null;
  }
}

function save(saved: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Private browsing, a full quota or blocked site data. The builder still
    // works for this visit; it just will not survive a refresh.
  }
}

function clear() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do: there was nothing readable to clear.
  }
}

let rowId = 0;
const nextId = (prefix: string) => `${prefix}-new-${(rowId += 1)}`;

export default function ResumeBuilder() {
  const [stage, setStage] = useState<Stage>("start");
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [template, setTemplate] = useState<TemplateKey>("classic");
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");
  const [pasteNote, setPasteNote] = useState("");
  const [locked, setLocked] = useState(true);

  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Work in progress is offered back on the start screen rather than
  // restored silently, so a shared computer never shows someone else's
  // details the moment the page opens.
  const savedRaw = useSyncExternalStore(subscribeToStorage, readStorage, noStorage);
  const resumable = useMemo(() => parseSaved(savedRaw), [savedRaw]);

  // Keep the draft on the visitor's own device as they answer.
  useEffect(() => {
    if (stage === "start" || stage === "import") return;
    save({ data, template, step, stage });
  }, [data, template, step, stage]);

  // Move focus with the flow so keyboard and screen reader users land on the
  // new question rather than at the top of the page.
  useEffect(() => {
    if (stage === "questions") firstFieldRef.current?.focus();
    else if (stage !== "start") headingRef.current?.focus();
  }, [stage, step]);

  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const current = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  function validate(): string {
    if (current.kind !== "text" || !current.field) return "";
    const value = String(data[current.field] ?? "").trim();
    if (current.required && !value) return "This one is needed before the next question.";
    if (current.field === "email" && value && !isEmail(value)) {
      return "That does not look like an email address. Check for a missing @ or a typo.";
    }
    return "";
  }

  function advance() {
    const problem = validate();
    if (problem) {
      setError(problem);
      firstFieldRef.current?.focus();
      return;
    }
    setError("");
    if (step === steps.length - 1) setStage("templates");
    else setStep(step + 1);
  }

  function back() {
    setError("");
    if (step === 0) setStage("start");
    else setStep(step - 1);
  }

  function readPastedResume() {
    const text = paste.trim();
    if (text.length < 40) {
      setPasteNote("Paste a bit more of the resume and we will pick out what we can.");
      return;
    }
    // Imported lazily so the parser is not in the bundle for visitors who
    // start from scratch.
    import("@/lib/resume").then(({ parseExistingResume }) => {
      const found = parseExistingResume(text);
      const labels: Record<string, string> = {
        firstName: "first name",
        lastName: "last name",
        jobTitle: "job title",
        email: "email",
        phone: "phone",
        linkedin: "LinkedIn",
        summary: "summary",
        skills: "skills",
      };
      const filled = Object.keys(found)
        .map((key) => labels[key])
        .filter(Boolean);
      setData((currentData) => ({ ...currentData, ...found }));
      setPasteNote(
        filled.length
          ? `Picked out your ${filled.join(", ")}. Check each one as you go, and fill in the rest.`
          : "Nothing recognizable came out of that, so start from the first question and we will build it up."
      );
      setStage("questions");
      setStep(0);
    });
  }

  function startOver() {
    clear();
    setData(emptyResume());
    setTemplate("classic");
    setStep(0);
    setError("");
    setPaste("");
    setPasteNote("");
    setStage("start");
  }

  /* ------------------------------------------------------------- screens */

  const offerSaved = stage === "start" && resumable;

  if (stage === "start") {
    return (
      <div className="rb">
        <div className="rb-start">
          <button
            type="button"
            className="rb-choice"
            onClick={() => {
              setStage("import");
              setPasteNote("");
            }}
          >
            <span className="rb-choice-title">I Already Have a Resume</span>
            <span className="rb-choice-body">
              Paste the one you have. We pull out your contact details and what else we can read,
              then walk you through the rest so you can bring it up to date and restyle it.
            </span>
          </button>

          <button
            type="button"
            className="rb-choice"
            onClick={() => {
              setStage("questions");
              setStep(0);
            }}
          >
            <span className="rb-choice-title">I Do Not Have a Resume</span>
            <span className="rb-choice-body">
              Start from nothing. Ten plain questions, one at a time, with an example on every
              screen. Nothing to download and nothing to sign up for.
            </span>
          </button>
        </div>

        {offerSaved && (
          <p className="notice rb-resume-note">
            You have an unfinished resume saved on this device.{" "}
            <button
              type="button"
              className="rb-link"
              onClick={() => {
                setData(resumable.data);
                setTemplate(resumable.template);
                setStep(resumable.step);
                setStage(resumable.stage);
              }}
            >
              Pick up where you left off
            </button>{" "}
            or{" "}
            <button type="button" className="rb-link" onClick={startOver}>
              delete it and start fresh
            </button>
            .
          </p>
        )}
      </div>
    );
  }

  if (stage === "import") {
    return (
      <div className="rb">
        <h2 className="rb-question" tabIndex={-1} ref={headingRef}>
          Paste Your Current Resume
        </h2>
        <p className="rb-help">
          Open your existing resume, select everything and paste it below. Plain text works best.
          We read it in your browser and never send it anywhere.
        </p>
        <div className="form-field">
          <label htmlFor="rb-paste">Your current resume</label>
          <textarea
            id="rb-paste"
            value={paste}
            maxLength={MAX_PASTE}
            onChange={(event) => setPaste(event.target.value)}
            placeholder="Jordan Ellis&#10;Math Tutor&#10;jordan.ellis@example.com | (404) 555-0134&#10;&#10;EXPERIENCE&#10;..."
          />
          <span className="form-help">{paste.length.toLocaleString()} of {MAX_PASTE.toLocaleString()} characters</span>
        </div>
        {pasteNote && (
          <p className="notice" role="status">
            {pasteNote}
          </p>
        )}
        <div className="rb-actions">
          <button type="button" className="btn btn--ghost" onClick={() => setStage("start")}>
            Back
          </button>
          <button type="button" className="btn" onClick={readPastedResume}>
            Read It and Continue
          </button>
        </div>
        <p className="rb-help">
          Would rather type it out?{" "}
          <button
            type="button"
            className="rb-link"
            onClick={() => {
              setStage("questions");
              setStep(0);
            }}
          >
            Skip the paste and answer the questions
          </button>
          .
        </p>
      </div>
    );
  }

  if (stage === "questions") {
    return (
      <div className="rb">
        <div className="rb-progress">
          <div className="rb-progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="rb-progress-label">
            Question {step + 1} of {steps.length}
          </p>
        </div>

        <h2 className="rb-question" tabIndex={-1} ref={headingRef}>
          {current.question}
        </h2>
        <p className="rb-help">{current.help}</p>
        {pasteNote && step === 0 && (
          <p className="notice" role="status">
            {pasteNote}
          </p>
        )}

        {current.kind === "text" && current.field && (
          <div className="form-field">
            <label htmlFor={`rb-${current.key}`}>{current.label ?? current.question}</label>
            <input
              id={`rb-${current.key}`}
              ref={firstFieldRef as React.Ref<HTMLInputElement>}
              type={current.inputType}
              inputMode={current.inputType === "tel" ? "tel" : undefined}
              autoComplete={current.autoComplete}
              maxLength={160}
              value={String(data[current.field] ?? "")}
              placeholder={current.placeholder}
              aria-describedby={error ? "rb-error" : undefined}
              aria-invalid={error ? true : undefined}
              onChange={(event) => set(current.field!, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  advance();
                }
              }}
            />
          </div>
        )}

        {current.kind === "jobs" && (
          <div className="rb-rows">
            {data.jobs.map((job, index) => (
              <fieldset className="rb-row" key={job.id}>
                <legend>Job {index + 1}</legend>
                <div className="rb-grid">
                  <div className="form-field">
                    <label htmlFor={`${job.id}-title`}>Job title</label>
                    <input
                      id={`${job.id}-title`}
                      ref={index === 0 ? (firstFieldRef as React.Ref<HTMLInputElement>) : undefined}
                      type="text"
                      maxLength={120}
                      value={job.title}
                      placeholder="After School Math Tutor"
                      onChange={(event) =>
                        set(
                          "jobs",
                          data.jobs.map((row) =>
                            row.id === job.id ? { ...row, title: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor={`${job.id}-employer`}>Employer</label>
                    <input
                      id={`${job.id}-employer`}
                      type="text"
                      maxLength={120}
                      value={job.employer}
                      placeholder="Marietta Learning Center"
                      onChange={(event) =>
                        set(
                          "jobs",
                          data.jobs.map((row) =>
                            row.id === job.id ? { ...row, employer: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor={`${job.id}-location`}>Location</label>
                    <input
                      id={`${job.id}-location`}
                      type="text"
                      maxLength={120}
                      value={job.location}
                      placeholder="Marietta, GA"
                      onChange={(event) =>
                        set(
                          "jobs",
                          data.jobs.map((row) =>
                            row.id === job.id ? { ...row, location: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="rb-dates">
                    <div className="form-field">
                      <label htmlFor={`${job.id}-start`}>Started</label>
                      <input
                        id={`${job.id}-start`}
                        type="text"
                        maxLength={40}
                        value={job.start}
                        placeholder="Aug 2023"
                        onChange={(event) =>
                          set(
                            "jobs",
                            data.jobs.map((row) =>
                              row.id === job.id ? { ...row, start: event.target.value } : row
                            )
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor={`${job.id}-end`}>Ended</label>
                      <input
                        id={`${job.id}-end`}
                        type="text"
                        maxLength={40}
                        value={job.current ? "" : job.end}
                        disabled={job.current}
                        placeholder="May 2025"
                        onChange={(event) =>
                          set(
                            "jobs",
                            data.jobs.map((row) =>
                              row.id === job.id ? { ...row, end: event.target.value } : row
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                  <label className="rb-check" htmlFor={`${job.id}-current`}>
                    <input
                      id={`${job.id}-current`}
                      type="checkbox"
                      checked={job.current}
                      onChange={(event) =>
                        set(
                          "jobs",
                          data.jobs.map((row) =>
                            row.id === job.id ? { ...row, current: event.target.checked } : row
                          )
                        )
                      }
                    />
                    I still work here
                  </label>
                  <div className="form-field rb-wide">
                    <label htmlFor={`${job.id}-duties`}>What you did there</label>
                    <textarea
                      id={`${job.id}-duties`}
                      value={job.duties}
                      maxLength={2000}
                      placeholder={
                        "One line per point. Numbers land harder than adjectives:\nRaised average algebra grades by a full letter across 14 students\nBuilt weekly lesson plans for grades 6 to 9"
                      }
                      onChange={(event) =>
                        set(
                          "jobs",
                          data.jobs.map((row) =>
                            row.id === job.id ? { ...row, duties: event.target.value } : row
                          )
                        )
                      }
                    />
                    <span className="form-help">One line per bullet point.</span>
                  </div>
                </div>
                {data.jobs.length > 1 && (
                  <button
                    type="button"
                    className="rb-link rb-remove"
                    onClick={() => set("jobs", data.jobs.filter((row) => row.id !== job.id))}
                  >
                    Remove this job
                  </button>
                )}
              </fieldset>
            ))}
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => set("jobs", [...data.jobs, emptyJob(nextId("job"))])}
            >
              Add Another Job
            </button>
          </div>
        )}

        {current.kind === "skills" && (
          <div className="form-field">
            <label htmlFor="rb-skills">Your skills</label>
            <textarea
              id="rb-skills"
              ref={firstFieldRef as React.Ref<HTMLTextAreaElement>}
              value={data.skills}
              maxLength={1200}
              placeholder={"Algebra I and II\nLesson planning\nProgress reporting to parents\nGoogle Classroom"}
              onChange={(event) => set("skills", event.target.value)}
            />
            <span className="form-help">
              {skillList(data.skills).length} skill{skillList(data.skills).length === 1 ? "" : "s"} so
              far. Eight to twelve is a good target.
            </span>
          </div>
        )}

        {current.kind === "schools" && (
          <div className="rb-rows">
            {data.schools.map((school, index) => (
              <fieldset className="rb-row" key={school.id}>
                <legend>Education {index + 1}</legend>
                <div className="rb-grid">
                  <div className="form-field">
                    <label htmlFor={`${school.id}-credential`}>Degree or certificate</label>
                    <input
                      id={`${school.id}-credential`}
                      ref={index === 0 ? (firstFieldRef as React.Ref<HTMLInputElement>) : undefined}
                      type="text"
                      maxLength={140}
                      value={school.credential}
                      placeholder="B.S. Mathematics"
                      onChange={(event) =>
                        set(
                          "schools",
                          data.schools.map((row) =>
                            row.id === school.id ? { ...row, credential: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor={`${school.id}-school`}>School</label>
                    <input
                      id={`${school.id}-school`}
                      type="text"
                      maxLength={140}
                      value={school.school}
                      placeholder="Georgia State University"
                      onChange={(event) =>
                        set(
                          "schools",
                          data.schools.map((row) =>
                            row.id === school.id ? { ...row, school: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor={`${school.id}-location`}>Location</label>
                    <input
                      id={`${school.id}-location`}
                      type="text"
                      maxLength={120}
                      value={school.location}
                      placeholder="Atlanta, GA"
                      onChange={(event) =>
                        set(
                          "schools",
                          data.schools.map((row) =>
                            row.id === school.id ? { ...row, location: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor={`${school.id}-year`}>Year</label>
                    <input
                      id={`${school.id}-year`}
                      type="text"
                      maxLength={40}
                      value={school.year}
                      placeholder="2022"
                      onChange={(event) =>
                        set(
                          "schools",
                          data.schools.map((row) =>
                            row.id === school.id ? { ...row, year: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="form-field rb-wide">
                    <label htmlFor={`${school.id}-detail`}>Anything worth adding</label>
                    <input
                      id={`${school.id}-detail`}
                      type="text"
                      maxLength={200}
                      value={school.detail}
                      placeholder="Minor in education, 3.8 GPA, Dean's List"
                      onChange={(event) =>
                        set(
                          "schools",
                          data.schools.map((row) =>
                            row.id === school.id ? { ...row, detail: event.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                </div>
                {data.schools.length > 1 && (
                  <button
                    type="button"
                    className="rb-link rb-remove"
                    onClick={() =>
                      set("schools", data.schools.filter((row) => row.id !== school.id))
                    }
                  >
                    Remove this entry
                  </button>
                )}
              </fieldset>
            ))}
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => set("schools", [...data.schools, emptySchool(nextId("school"))])}
            >
              Add Another School
            </button>
          </div>
        )}

        {current.kind === "summary" && (
          <div className="form-field">
            <label htmlFor="rb-summary">Professional summary</label>
            <textarea
              id="rb-summary"
              ref={firstFieldRef as React.Ref<HTMLTextAreaElement>}
              value={data.summary}
              maxLength={1200}
              placeholder="Math tutor with three years of one-to-one and small group experience across grades 6 to 12..."
              onChange={(event) => set("summary", event.target.value)}
            />
            <span className="form-help">
              Stuck?{" "}
              <button
                type="button"
                className="rb-link"
                onClick={() => set("summary", draftSummary(data))}
              >
                Put a rough draft in the box
              </button>{" "}
              from your answers, then rewrite it in your own words.
            </span>
          </div>
        )}

        {error && (
          <p className="notice rb-error" id="rb-error" role="alert">
            {error}
          </p>
        )}

        <div className="rb-actions">
          <button type="button" className="btn btn--ghost" onClick={back}>
            Back
          </button>
          <button type="button" className="btn" onClick={advance}>
            {step === steps.length - 1 ? "Pick a Template" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "templates") {
    return (
      <div className="rb">
        <h2 className="rb-question" tabIndex={-1} ref={headingRef}>
          Pick a Template
        </h2>
        <p className="rb-help">
          Same answers, five layouts. You can change your mind afterwards without losing anything.
        </p>

        <ul className="rb-templates">
          {templates.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                className={`rb-template${template === option.key ? " is-picked" : ""}`}
                aria-pressed={template === option.key}
                onClick={() => setTemplate(option.key)}
              >
                <span className={`rb-thumb rb-thumb--${option.key}`} aria-hidden="true">
                  <span className="rb-thumb-name" />
                  <span className="rb-thumb-rule" />
                  <span className="rb-thumb-body">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                </span>
                <span className="rb-template-name">{option.name}</span>
                <span className="rb-template-blurb">{option.blurb}</span>
                <span className="rb-template-best">Best for: {option.best}</span>
                <span className={`rb-template-ats${option.atsSafe ? "" : " is-warn"}`}>
                  {option.atsSafe
                    ? "Single column, reads cleanly in applicant tracking software"
                    : "Two columns, which some applicant tracking software scrambles"}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="rb-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setStage("questions");
              setStep(steps.length - 1);
            }}
          >
            Back to Questions
          </button>
          <button type="button" className="btn" onClick={() => setStage("done")}>
            See My Resume
          </button>
        </div>
      </div>
    );
  }

  const missing = [
    !data.summary.trim() && "a professional summary",
    !data.jobs.some(hasJob) && "any job history",
    !skillList(data.skills).length && "any skills",
    !data.schools.some(hasSchool) && "any education",
  ].filter(Boolean) as string[];

  const missingList =
    missing.length > 1
      ? `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`
      : missing[0];

  return (
    <div className="rb">
      <h2 className="rb-question" tabIndex={-1} ref={headingRef}>
        Your Resume
      </h2>

      <ResumeDownload data={data} template={template} onLockChange={setLocked} />

      <div className="rb-toolbar">
        <button type="button" className="btn btn--ghost" onClick={() => setStage("templates")}>
          Change Template
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setStage("questions");
            setStep(0);
          }}
        >
          Edit Answers
        </button>
        <button type="button" className="btn btn--ghost" onClick={startOver}>
          Start Over
        </button>
      </div>
      <p className="rb-help">
        Editing, switching templates and reading your resume on this page are free and always will
        be. Downloading the finished file, as a PDF, a Word document or plain text, is what the
        subscription covers.
      </p>
      {missing.length > 0 && (
        <p className="notice rb-missing">
          This resume does not have {missingList}. It will still print, but most employers expect
          all four.{" "}
          <button
            type="button"
            className="rb-link"
            onClick={() => {
              setStage("questions");
              setStep(0);
            }}
          >
            Go back and fill them in
          </button>
          .
        </p>
      )}

      <div className="resume-sheet" data-locked={locked ? "true" : undefined}>
        <ResumePreview data={data} template={template} />
      </div>
    </div>
  );
}
