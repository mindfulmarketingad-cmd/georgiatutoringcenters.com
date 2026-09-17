import {
  bulletList,
  dateRange,
  fullName,
  hasJob,
  hasSchool,
  skillList,
  tidyUrl,
  type ResumeData,
  type TemplateKey,
} from "@/lib/resume";

/**
 * The resume itself. One set of markup for every template: the chosen key
 * becomes a class and the stylesheet does the rest.
 *
 * The main and side wrappers are `display: contents` in every single-column
 * template, so sections flow in document order there and only the Executive
 * layout pulls skills and education into a sidebar.
 */
export default function ResumePreview({
  data,
  template,
}: {
  data: ResumeData;
  template: TemplateKey;
}) {
  const name = fullName(data) || "Your Name";
  const jobs = data.jobs.filter(hasJob);
  const schools = data.schools.filter(hasSchool);
  const skills = skillList(data.skills);
  const summary = data.summary.trim();

  const contacts = [
    data.email.trim(),
    data.phone.trim(),
    data.linkedin.trim() ? tidyUrl(data.linkedin) : "",
  ].filter(Boolean);

  return (
    <article className={`resume resume--${template}`} aria-label={`${name} resume preview`}>
      <header className="resume-head">
        <p className="resume-name">{name}</p>
        {data.jobTitle.trim() && <p className="resume-role">{data.jobTitle.trim()}</p>}
        {contacts.length > 0 && (
          <ul className="resume-contact">
            {contacts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </header>

      <div className="resume-main">
        {summary && (
          <section className="resume-section resume-section--summary">
            <h3>Professional Summary</h3>
            {summary.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>
        )}

        {jobs.length > 0 && (
          <section className="resume-section resume-section--experience">
            <h3>Experience</h3>
            {jobs.map((job) => {
              const bullets = bulletList(job.duties);
              const dates = dateRange(job);
              const place = [job.employer.trim(), job.location.trim()].filter(Boolean).join(", ");
              return (
                <div className="resume-entry" key={job.id}>
                  <div className="resume-entry-head">
                    <p className="resume-entry-title">{job.title.trim() || "Role"}</p>
                    {dates && <p className="resume-entry-dates">{dates}</p>}
                  </div>
                  {place && <p className="resume-entry-meta">{place}</p>}
                  {bullets.length > 0 && (
                    <ul className="resume-bullets">
                      {bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>

      <div className="resume-side">
        {skills.length > 0 && (
          <section className="resume-section resume-section--skills">
            <h3>Skills</h3>
            <ul className="resume-skills">
              {skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        )}

        {schools.length > 0 && (
          <section className="resume-section resume-section--education">
            <h3>Education</h3>
            {schools.map((school) => {
              const place = [school.school.trim(), school.location.trim()]
                .filter(Boolean)
                .join(", ");
              return (
                <div className="resume-entry" key={school.id}>
                  <div className="resume-entry-head">
                    <p className="resume-entry-title">{school.credential.trim() || "Credential"}</p>
                    {school.year.trim() && (
                      <p className="resume-entry-dates">{school.year.trim()}</p>
                    )}
                  </div>
                  {place && <p className="resume-entry-meta">{place}</p>}
                  {school.detail.trim() && (
                    <p className="resume-entry-detail">{school.detail.trim()}</p>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </article>
  );
}
