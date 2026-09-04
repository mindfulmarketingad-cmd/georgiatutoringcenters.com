import Link from "next/link";
import Image from "next/image";
import type { Author } from "@/lib/content/authors";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AuthorByline({
  author,
  published,
  updated,
  readMinutes,
}: {
  author: Author;
  published: string;
  updated: string;
  readMinutes: number;
}) {
  return (
    <div className="byline">
      <Image
        className="byline-avatar"
        src={`/authors/${author.slug}.svg`}
        alt=""
        width={48}
        height={48}
      />
      <p className="byline-text">
        By{" "}
        <Link href={`/authors/${author.slug}`} rel="author">
          {author.name}
        </Link>
        , {author.role}
        <br />
        <span className="form-help">
          Published {formatDate(published)}
          {updated !== published ? ` · Updated ${formatDate(updated)}` : ""} · {readMinutes} minute
          read
        </span>
      </p>
    </div>
  );
}

export function AuthorCard({ author }: { author: Author }) {
  return (
    <aside className="author-card" aria-label={`About ${author.name}`}>
      <Image
        className="author-card-avatar"
        src={`/authors/${author.slug}.svg`}
        alt=""
        width={96}
        height={96}
      />
      <div>
        <h3 style={{ marginBottom: "0.2rem" }}>
          <Link href={`/authors/${author.slug}`} rel="author">
            {author.name}
          </Link>
        </h3>
        <p className="card-meta" style={{ marginBottom: "0.5rem" }}>
          {author.role}
        </p>
        <p style={{ marginBottom: "0.6rem" }}>{author.bio[0]}</p>
        <Link href={`/authors/${author.slug}`}>
          More guides by this author &rarr;
        </Link>
      </div>
    </aside>
  );
}
